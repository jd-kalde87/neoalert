from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status

from application.dtos.permissiondto import CreatePermissionDTO, UpdatePermissionDTO
from core.access_catalog import ACCESS_ROUTE_CATALOG
from domain.exceptions.domain_exception import ConflictError, DomainException, NotFoundError
from presentation.dependencies.auth_dependencies import AuthenticatedUser, require_permission
from presentation.dependencies.container import ServiceContainer, get_container
from presentation.schemas.permission_schemas import (
    AccessRouteResponse,
    CreatePermissionRequest,
    PermissionResponse,
    UpdatePermissionRequest,
)

router = APIRouter(prefix="/permissions", tags=["permissions"])


def _map_error(exc: DomainException) -> HTTPException:
    if isinstance(exc, NotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    if isinstance(exc, ConflictError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.message)
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message)


def _permission_to_response(permission) -> PermissionResponse:
    return PermissionResponse(
        id=permission.id,
        code=permission.code,
        name=permission.name,
        resource=permission.resource,
        action=permission.action,
        description=permission.description,
        created_at=permission.created_at,
    )


@router.get("", response_model=list[PermissionResponse], summary="List permissions")
async def list_permissions(
    _: AuthenticatedUser = Depends(require_permission("permissions:read")),
    container: ServiceContainer = Depends(get_container),
) -> list[PermissionResponse]:
    permissions = await container.list_permissions_use_case.execute()
    return [_permission_to_response(permission) for permission in permissions]


@router.get("/access-routes", response_model=list[AccessRouteResponse], summary="List app routes and required permissions")
async def list_access_routes(
    _: AuthenticatedUser = Depends(require_permission("permissions:read")),
) -> list[AccessRouteResponse]:
    return [
        AccessRouteResponse(
            route=entry.route,
            label=entry.label,
            group=entry.group,
            permission_code=entry.permission_code,
            write_permission_code=entry.write_permission_code,
        )
        for entry in ACCESS_ROUTE_CATALOG
    ]


@router.post(
    "",
    response_model=PermissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create permission",
)
async def create_permission(
    body: CreatePermissionRequest,
    _: AuthenticatedUser = Depends(require_permission("permissions:manage")),
    container: ServiceContainer = Depends(get_container),
) -> PermissionResponse:
    try:
        permission = await container.create_permission_use_case.execute(
            CreatePermissionDTO(
                code=body.code,
                name=body.name,
                resource=body.resource,
                action=body.action,
                description=body.description,
            )
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _permission_to_response(permission)


@router.get("/{permission_id}", response_model=PermissionResponse, summary="Get permission by ID")
async def get_permission(
    permission_id: UUID,
    _: AuthenticatedUser = Depends(require_permission("permissions:read")),
    container: ServiceContainer = Depends(get_container),
) -> PermissionResponse:
    try:
        permission = await container.get_permission_use_case.execute(permission_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _permission_to_response(permission)


@router.put("/{permission_id}", response_model=PermissionResponse, summary="Update permission")
async def update_permission(
    permission_id: UUID,
    body: UpdatePermissionRequest,
    _: AuthenticatedUser = Depends(require_permission("permissions:manage")),
    container: ServiceContainer = Depends(get_container),
) -> PermissionResponse:
    try:
        permission = await container.update_permission_use_case.execute(
            permission_id,
            UpdatePermissionDTO(
                name=body.name,
                resource=body.resource,
                action=body.action,
                description=body.description,
            ),
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _permission_to_response(permission)


@router.delete("/{permission_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete permission")
async def delete_permission(
    permission_id: UUID,
    _: AuthenticatedUser = Depends(require_permission("permissions:manage")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.delete_permission_use_case.execute(permission_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
