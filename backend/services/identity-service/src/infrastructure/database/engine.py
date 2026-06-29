from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.config import Settings

_engine = None
_session_factory = None


def init_engine(settings: Settings) -> None:
    global _engine, _session_factory
    _engine = create_async_engine(settings.database_url, echo=settings.debug)
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if _session_factory is None:
        raise RuntimeError("Database engine not initialized")
    async with _session_factory() as session:
        yield session
