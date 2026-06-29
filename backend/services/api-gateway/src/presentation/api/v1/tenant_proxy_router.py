from fastapi import APIRouter, Request, Response

from core.config import Settings
from presentation.proxy.proxy_utils import build_target, proxy_request

router = APIRouter(tags=["tenant-proxy"])
settings = Settings()


@router.api_route(
    "/auth/tenants",
    methods=["GET", "OPTIONS"],
    summary="Proxy tenant list for auth flow",
)
async def proxy_auth_tenants(request: Request) -> Response:
    target_url = build_target(settings.tenant_service_url, "/tenants", request.url.query)
    return await proxy_request(request, target_url)
