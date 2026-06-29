from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from infrastructure.security.jwtservice import JwtService
from presentation.dependencies.container import ServiceContainer, get_container

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthenticatedUser:
    user_id: UUID
    tenant_id: UUID
    email: str
    permissions: list[str]
    roles: list[str]


def get_settings(container: ServiceContainer = Depends(get_container)):
    return container.settings


async def get_tenant_id(
    request: Request,
    container: ServiceContainer = Depends(get_container),
) -> UUID:
    tenant_id = getattr(request.state, "tenant_id", None)
    if tenant_id is None:
        return container.settings.default_tenant_id
    return tenant_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    container: ServiceContainer = Depends(get_container),
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    jwt_service: JwtService = container.jwt_service
    try:
        payload = jwt_service.decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    return AuthenticatedUser(
        user_id=UUID(payload["sub"]),
        tenant_id=UUID(payload["tenant_id"]),
        email=payload["email"],
        permissions=list(payload.get("permissions", [])),
        roles=list(payload.get("roles", [])),
    )


def require_permission(required_permission: str):
    async def checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if "admin" in user.roles or required_permission in user.permissions:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing permission: {required_permission}",
        )

    return checker
