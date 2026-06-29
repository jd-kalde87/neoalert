from fastapi import APIRouter, Request, Response

from core.config import Settings
from presentation.proxy.proxy_utils import build_target, proxy_request

router = APIRouter(tags=["auth-proxy"])
settings = Settings()


@router.api_route(
    "/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    summary="Proxy auth requests to identity-service",
)
async def proxy_auth(path: str, request: Request) -> Response:
    target_url = build_target(settings.identity_service_url, f"/auth/{path}", request.url.query)
    return await proxy_request(request, target_url)


@router.api_route(
    "/roles{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    summary="Proxy roles requests to identity-service",
)
async def proxy_roles(path: str, request: Request) -> Response:
    suffix = path if path.startswith("/") else f"/{path}" if path else ""
    target_url = build_target(settings.identity_service_url, f"/roles{suffix}", request.url.query)
    return await proxy_request(request, target_url)


@router.api_route(
    "/permissions{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    summary="Proxy permissions requests to identity-service",
)
async def proxy_permissions(path: str, request: Request) -> Response:
    suffix = path if path.startswith("/") else f"/{path}" if path else ""
    target_url = build_target(settings.identity_service_url, f"/permissions{suffix}", request.url.query)
    return await proxy_request(request, target_url)


@router.api_route(
    "/users{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    summary="Proxy user management requests to identity-service",
)
async def proxy_users(path: str, request: Request) -> Response:
    suffix = path if path.startswith("/") else f"/{path}" if path else ""
    target_url = build_target(settings.identity_service_url, f"/users{suffix}", request.url.query)
    return await proxy_request(request, target_url)
