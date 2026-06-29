import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from neoalert_observability import CorrelationIdMiddleware, configure_logging, configure_telemetry

from core.config import Settings
from presentation.api.v1.auth_router import router as auth_router
from presentation.api.v1.health_router import router as health_router
from presentation.api.v1.permissions_router import router as permissions_router
from presentation.api.v1.roles_router import router as roles_router
from presentation.api.v1.users_router import router as users_router
from infrastructure.database.schema_applier import ensure_schema
from presentation.dependencies.container import reset_container
from presentation.middleware.tenant_context_middleware import TenantContextMiddleware

settings = Settings()
configure_logging(settings.service_name, settings.log_level)
configure_telemetry(settings.service_name)
logger = logging.getLogger(__name__)


def _log_email_adapter_mode() -> None:
    adapter = settings.email_adapter
    logger.info("Email adapter: %s", adapter)
    if adapter == "console":
        logger.warning(
            "IDENTITYSERVICE_EMAIL_ADAPTER=console — verification emails are logged only, "
            "not delivered to a real inbox. Set IDENTITYSERVICE_EMAIL_ADAPTER=smtp and "
            "configure IDENTITYSERVICE_SMTP_* in .env for real delivery."
        )
    elif adapter == "smtp":
        logger.info(
            "SMTP delivery enabled: host=%s port=%s TLS=%s from=%s user=%s",
            settings.smtp_host,
            settings.smtp_port,
            settings.smtp_use_tls,
            settings.smtp_from_email,
            settings.smtp_user or "(none)",
        )
        if not settings.smtp_configured:
            logger.warning(
                "SMTP adapter selected but credentials look incomplete "
                "(host/user/password). Outbound mail will likely fail."
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _log_email_adapter_mode()
    await ensure_schema(settings)
    container = reset_container(settings)
    await container.seed_service.seed_if_empty()
    yield


app = FastAPI(
    title="NEOALERT Identity Service",
    version="0.2.0",
    lifespan=lifespan,
)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(TenantContextMiddleware)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(roles_router)
app.include_router(permissions_router)
app.include_router(users_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )
    openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {})[
        "BearerAuth"
    ] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": settings.service_name, "status": "running"}
