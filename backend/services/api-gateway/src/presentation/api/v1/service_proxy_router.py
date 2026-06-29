from fastapi import APIRouter, Request, Response

from core.config import Settings
from presentation.proxy.proxy_utils import build_target, proxy_request

router = APIRouter(tags=["service-proxy"])
settings = Settings()


def _register_proxy(
    gateway_prefix: str,
    service_url: str,
    upstream_prefix: str,
) -> None:
    @router.api_route(
        f"{gateway_prefix}{{path:path}}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        summary=f"Proxy {gateway_prefix} to downstream service",
        include_in_schema=False,
    )
    async def proxy_with_path(path: str, request: Request) -> Response:
        suffix = path if path.startswith("/") else f"/{path}" if path else ""
        upstream_path = f"{upstream_prefix.rstrip('/')}{suffix}"
        target_url = build_target(service_url, upstream_path, request.url.query)
        return await proxy_request(request, target_url)

    @router.api_route(
        gateway_prefix.rstrip("/") or gateway_prefix,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        summary=f"Proxy {gateway_prefix} root to downstream service",
        include_in_schema=False,
    )
    async def proxy_root(request: Request) -> Response:
        upstream_path = upstream_prefix.rstrip("/") or upstream_prefix
        target_url = build_target(service_url, upstream_path, request.url.query)
        return await proxy_request(request, target_url)


# reporting-service (8010)
_register_proxy("/dashboard", settings.reporting_service_url, "/dashboard")
_register_proxy("/reports", settings.reporting_service_url, "/reports")

# attendance-service (8004)
_register_proxy("/attendance", settings.attendance_service_url, "/attendance")

# location-service (8005)
_register_proxy("/maps", settings.location_service_url, "/maps")

# incident-service (8006)
_register_proxy("/incidents", settings.incident_service_url, "/incidents")

# notification-service (8009)
_register_proxy("/notifications", settings.notification_service_url, "/notifications")

# file-ingestion-service (8007)
_register_proxy("/imports", settings.file_ingestion_service_url, "/imports")

# template-configuration-service (8008)
_register_proxy(
    "/import-templates",
    settings.template_configuration_service_url,
    "/import-templates",
)

# audit-service (8012)
_register_proxy("/audit", settings.audit_service_url, "/audit")

# employee-service (8003)
_register_proxy("/operations", settings.employee_service_url, "/operations")

# ai-service (8011)
_register_proxy("/ai", settings.ai_service_url, "/ai")

# tenant-service (8002) — admin tenant management
_register_proxy("/tenants", settings.tenant_service_url, "/tenants")
