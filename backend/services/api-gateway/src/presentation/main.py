import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neoalert_observability import CorrelationIdMiddleware, configure_logging, configure_telemetry

from core.config import Settings
from presentation.api.v1.health_router import router as health_router
from presentation.api.v1.auth_proxy_router import router as auth_proxy_router
from presentation.api.v1.tenant_proxy_router import router as tenant_proxy_router
from presentation.api.v1.service_proxy_router import router as service_proxy_router
from presentation.api.v1.gateway_router import router as service_router
from presentation.middleware.tenant_context_middleware import TenantContextMiddleware
from presentation.api.v1.rate_limit_router import router as rate_limit_router

settings = Settings()
configure_logging(settings.service_name, settings.log_level)
configure_telemetry(settings.service_name)

app = FastAPI(title="NEOALERT API Gateway", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(TenantContextMiddleware)
app.include_router(health_router)
app.include_router(tenant_proxy_router)
app.include_router(auth_proxy_router)
app.include_router(service_proxy_router)
app.include_router(service_router)
app.include_router(rate_limit_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": settings.service_name, "status": "running"}
