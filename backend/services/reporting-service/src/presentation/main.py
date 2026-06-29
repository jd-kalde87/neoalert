import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from neoalert_observability import CorrelationIdMiddleware, configure_logging, configure_telemetry

from core.config import Settings
from presentation.api.v1.health_router import router as health_router
from presentation.api.v1.reports_router import router as reports_router
from presentation.api.v1.dashboard_router import router as dashboard_router
from presentation.middleware.tenant_context_middleware import TenantContextMiddleware


settings = Settings()
configure_logging(settings.service_name, settings.log_level)
configure_telemetry(settings.service_name)

app = FastAPI(title="NEOALERT Reporting Service", version="0.1.0")
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(TenantContextMiddleware)
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(reports_router)



@app.get("/")
async def root() -> dict[str, str]:
    return {"service": settings.service_name, "status": "running"}
