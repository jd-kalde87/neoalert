from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status

from application.dtos.assignmentdto import AssignPermissionsDTO
from application.dtos.roledto import CreateRoleDTO, UpdateRoleDTO
from domain.exceptions.domain_exception import ConflictError, DomainException, NotFoundError
from presentation.dependencies.auth_dependencies import AuthenticatedUser, get_tenant_id, require_permission
from presentation.dependencies.container import ServiceContainer, get_container
from presentation.schemas.permission_schemas import (
    AssignPermissionsRequest,
    PermissionResponse,
    RolePermissionsResponse,
)
from presentation.schemas.role_schemas import CreateRoleRequest, RoleResponse, UpdateRoleRequest

router = APIRouter(prefix="/roles", tags=["roles"])


def _map_error(exc: DomainException) -> HTTPException:
    if isinstance(exc, NotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    if isinstance(exc, ConflictError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.message)
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message)


def _role_to_response(role) -> RoleResponse:
    return RoleResponse(
        id=role.id,
        tenant_id=role.tenant_id,
        code=role.code,
        name=role.name,
        description=role.description,
        is_system=role.is_system,
        created_at=role.created_at,
    )


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


@router.get("", response_model=list[RoleResponse], summary="List roles")
async def list_roles(
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:read")),
    container: ServiceContainer = Depends(get_container),
) -> list[RoleResponse]:
    roles = await container.list_roles_use_case.execute(tenant_id)
    return [_role_to_response(role) for role in roles]


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED, summary="Create role")
async def create_role(
    body: CreateRoleRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:manage")),
    container: ServiceContainer = Depends(get_container),
) -> RoleResponse:
    try:
        role = await container.create_role_use_case.execute(
            tenant_id,
            CreateRoleDTO(code=body.code, name=body.name, description=body.description),
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _role_to_response(role)


@router.get("/{role_id}", response_model=RoleResponse, summary="Get role by ID")
async def get_role(
    role_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:read")),
    container: ServiceContainer = Depends(get_container),
) -> RoleResponse:
    try:
        role = await container.get_role_use_case.execute(tenant_id, role_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _role_to_response(role)


@router.put("/{role_id}", response_model=RoleResponse, summary="Update role")
async def update_role(
    role_id: UUID,
    body: UpdateRoleRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:manage")),
    container: ServiceContainer = Depends(get_container),
) -> RoleResponse:
    try:
        role = await container.update_role_use_case.execute(
            tenant_id,
            role_id,
            UpdateRoleDTO(name=body.name, description=body.description),
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _role_to_response(role)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete role")
async def delete_role(
    role_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:manage")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.delete_role_use_case.execute(tenant_id, role_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{role_id}/permissions",
    response_model=RolePermissionsResponse,
    summary="List permissions assigned to role",
)
async def get_role_permissions(
    role_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:read")),
    container: ServiceContainer = Depends(get_container),
) -> RolePermissionsResponse:
    try:
        permissions = await container.get_role_permissions_use_case.execute(tenant_id, role_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return RolePermissionsResponse(
        role_id=role_id,
        permissions=[_permission_to_response(permission) for permission in permissions],
    )


@router.put(
    "/{role_id}/permissions",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Replace permissions assigned to role",
)
async def replace_role_permissions(
    role_id: UUID,
    body: AssignPermissionsRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:manage")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.set_role_permissions_use_case.execute(
            tenant_id,
            role_id,
            AssignPermissionsDTO(permission_ids=body.permission_ids),
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{role_id}/permissions", status_code=status.HTTP_204_NO_CONTENT, summary="Assign permissions to role")
async def assign_permissions(
    role_id: UUID,
    body: AssignPermissionsRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:manage")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.assign_permissions_to_role_use_case.execute(
            tenant_id,
            role_id,
            AssignPermissionsDTO(permission_ids=body.permission_ids),
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove permission from role",
)
async def remove_permission(
    role_id: UUID,
    permission_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("roles:manage")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.remove_permission_from_role_use_case.execute(
            tenant_id, role_id, permission_id
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
