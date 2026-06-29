from uuid import UUID

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

TENANT_HEADER = "X-Tenant-ID"


class TenantContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        tenant_id = request.headers.get(TENANT_HEADER)
        if tenant_id:
            try:
                request.state.tenant_id = UUID(tenant_id)
            except ValueError:
                pass
        return await call_next(request)
