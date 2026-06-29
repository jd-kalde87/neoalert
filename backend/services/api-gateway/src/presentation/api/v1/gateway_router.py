from fastapi import APIRouter

from core.config import Settings

router = APIRouter(prefix="/gateway", tags=["api-gateway"])
settings = Settings()

GATEWAY_ROUTES: list[dict[str, str | int]] = [
    {"service": "identity-service", "port": 8001, "gateway_prefix": "/auth", "upstream_prefix": "/auth"},
    {"service": "identity-service", "port": 8001, "gateway_prefix": "/roles", "upstream_prefix": "/roles"},
    {"service": "identity-service", "port": 8001, "gateway_prefix": "/permissions", "upstream_prefix": "/permissions"},
    {"service": "identity-service", "port": 8001, "gateway_prefix": "/users", "upstream_prefix": "/users"},
    {"service": "tenant-service", "port": 8002, "gateway_prefix": "/auth/tenants", "upstream_prefix": "/tenants"},
    {"service": "tenant-service", "port": 8002, "gateway_prefix": "/tenants", "upstream_prefix": "/tenants"},
    {"service": "employee-service", "port": 8003, "gateway_prefix": "/operations", "upstream_prefix": "/operations"},
    {"service": "attendance-service", "port": 8004, "gateway_prefix": "/attendance", "upstream_prefix": "/attendance"},
    {"service": "location-service", "port": 8005, "gateway_prefix": "/maps", "upstream_prefix": "/maps"},
    {"service": "incident-service", "port": 8006, "gateway_prefix": "/incidents", "upstream_prefix": "/incidents"},
    {"service": "file-ingestion-service", "port": 8007, "gateway_prefix": "/imports", "upstream_prefix": "/imports"},
    {
        "service": "template-configuration-service",
        "port": 8008,
        "gateway_prefix": "/import-templates",
        "upstream_prefix": "/import-templates",
    },
    {"service": "notification-service", "port": 8009, "gateway_prefix": "/notifications", "upstream_prefix": "/notifications"},
    {"service": "reporting-service", "port": 8010, "gateway_prefix": "/dashboard", "upstream_prefix": "/dashboard"},
    {"service": "reporting-service", "port": 8010, "gateway_prefix": "/reports", "upstream_prefix": "/reports"},
    {"service": "ai-service", "port": 8011, "gateway_prefix": "/ai", "upstream_prefix": "/ai"},
    {"service": "audit-service", "port": 8012, "gateway_prefix": "/audit", "upstream_prefix": "/audit"},
]


@router.get("/routes", summary="List configured gateway proxy routes")
async def list_routes() -> dict[str, object]:
    return {
        "status": "ok",
        "gateway_port": settings.port,
        "microservice_count": 13,
        "downstream_services": 12,
        "routes": GATEWAY_ROUTES,
    }
