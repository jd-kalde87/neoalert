import logging
import re
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from core.config import Settings

logger = logging.getLogger(__name__)

MIGRATIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS _neoalert_schema_migrations (
    version     VARCHAR(128) PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
"""

_STATEMENT_SPLIT = re.compile(r";\s*(?:\n|$)")


def _split_sql_statements(sql: str) -> list[str]:
    statements: list[str] = []
    buffer: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        buffer.append(line)
        if stripped.endswith(";"):
            statement = "\n".join(buffer).strip()
            if statement:
                statements.append(statement)
            buffer = []
    remainder = "\n".join(buffer).strip()
    if remainder:
        statements.append(remainder)
    return statements


def _local_dev_schema_dir() -> Path | None:
    for ancestor in Path(__file__).resolve().parents:
        candidate = (
            ancestor / "infrastructure" / "database" / "schemas" / "identity-service"
        )
        if candidate.is_dir() and any(candidate.glob("V*.sql")):
            return candidate
    return None


def _resolve_schema_dir(settings: Settings) -> Path | None:
    candidates = [
        Path(settings.schema_dir),
        Path("/app/schemas/identity-service"),
        _local_dev_schema_dir(),
    ]
    for candidate in candidates:
        if candidate is not None and candidate.is_dir() and any(candidate.glob("V*.sql")):
            return candidate
    return None


async def ensure_schema(settings: Settings) -> None:
    if settings.storage_backend != "postgres" or not settings.auto_apply_schema:
        return

    schema_dir = _resolve_schema_dir(settings)
    if schema_dir is None:
        logger.warning("identity-service schema directory not found; skipping auto-apply")
        return

    engine = create_async_engine(settings.database_url, echo=settings.debug)
    try:
        await _apply_migrations(engine, schema_dir)
    finally:
        await engine.dispose()


async def _apply_migrations(engine: AsyncEngine, schema_dir: Path) -> None:
    migration_files = sorted(schema_dir.glob("V*.sql"))
    if not migration_files:
        logger.warning("No migration files found in %s", schema_dir)
        return

    async with engine.begin() as conn:
        await conn.execute(text(MIGRATIONS_TABLE_SQL))

        for migration_file in migration_files:
            version = migration_file.stem
            already_applied = await conn.scalar(
                text(
                    "SELECT 1 FROM _neoalert_schema_migrations WHERE version = :version"
                ),
                {"version": version},
            )
            if already_applied:
                logger.info("SKIP %s (already applied)", version)
                continue

            sql = migration_file.read_text(encoding="utf-8")
            for statement in _split_sql_statements(sql):
                await conn.execute(text(statement))

            await conn.execute(
                text(
                    "INSERT INTO _neoalert_schema_migrations (version) VALUES (:version)"
                ),
                {"version": version},
            )
            logger.info("Applied migration %s", version)
