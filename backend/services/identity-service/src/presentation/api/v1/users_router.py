from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from application.dtos.userdto import CreateAdminUserDTO, UpdateAdminUserDTO
from application.dtos.assignmentdto import AssignRolesDTO
from domain.exceptions.domain_exception import ConflictError, DomainException, NotFoundError, ValidationError
from presentation.dependencies.auth_dependencies import AuthenticatedUser, get_tenant_id, require_permission
from presentation.dependencies.container import ServiceContainer, get_container
from presentation.schemas.permission_schemas import AssignRolesRequest, UserPermissionsResponse
from presentation.schemas.role_schemas import RoleResponse
from presentation.schemas.user_schemas import (
    AdminUserResponse,
    CreateAdminUserRequest,
    UpdateAdminUserRequest,
    UserRolesResponse,
)

router = APIRouter(prefix="/users", tags=["users"])


def _map_error(exc: DomainException) -> HTTPException:
    if isinstance(exc, NotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    if isinstance(exc, ConflictError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.message)
    if isinstance(exc, ValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message)
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


def _user_to_response(user, role_codes: list[str]) -> AdminUserResponse:
    return AdminUserResponse(
        id=user.id,
        tenant_id=user.tenant_id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        email_verified=user.email_verified,
        is_active=user.is_active,
        is_superadmin=user.is_superadmin,
        roles=role_codes,
        created_at=user.created_at,
    )


@router.get("", response_model=list[AdminUserResponse], summary="List users")
async def list_users(
    search: str | None = Query(default=None),
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("users:read")),
    container: ServiceContainer = Depends(get_container),
) -> list[AdminUserResponse]:
    users = await container.list_users_use_case.execute(tenant_id, search=search)
    return [_user_to_response(user, role_codes) for user, role_codes in users]


@router.post("", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED, summary="Create user")
async def create_user(
    body: CreateAdminUserRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    current_user: AuthenticatedUser = Depends(require_permission("users:write")),
    container: ServiceContainer = Depends(get_container),
) -> AdminUserResponse:
    try:
        user = await container.create_admin_user_use_case.execute(
            tenant_id,
            CreateAdminUserDTO(
                email=body.email,
                password=body.password,
                full_name=body.full_name,
                username=body.username,
                email_verified=body.email_verified,
                is_active=body.is_active,
                role_ids=body.role_ids,
            ),
            current_user.user_id,
        )
        role_codes = await container.get_user_roles_use_case.execute(tenant_id, user.id)
        role_codes = [role.code for role in role_codes]
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _user_to_response(user, role_codes)


@router.get("/{user_id}", response_model=AdminUserResponse, summary="Get user by ID")
async def get_user(
    user_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("users:read")),
    container: ServiceContainer = Depends(get_container),
) -> AdminUserResponse:
    try:
        user, role_codes = await container.get_user_use_case.execute(tenant_id, user_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _user_to_response(user, role_codes)


@router.put("/{user_id}", response_model=AdminUserResponse, summary="Update user")
async def update_user(
    user_id: UUID,
    body: UpdateAdminUserRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    current_user: AuthenticatedUser = Depends(require_permission("users:write")),
    container: ServiceContainer = Depends(get_container),
) -> AdminUserResponse:
    try:
        user = await container.update_admin_user_use_case.execute(
            tenant_id,
            user_id,
            UpdateAdminUserDTO(
                email=body.email,
                password=body.password,
                full_name=body.full_name,
                username=body.username,
                email_verified=body.email_verified,
                is_active=body.is_active,
                role_ids=body.role_ids,
            ),
            current_user.user_id,
        )
        role_codes = [role.code for role in await container.get_user_roles_use_case.execute(tenant_id, user_id)]
    except DomainException as exc:
        raise _map_error(exc) from exc
    return _user_to_response(user, role_codes)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete user")
async def delete_user(
    user_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("users:write")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.delete_user_use_case.execute(tenant_id, user_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{user_id}/roles", response_model=UserRolesResponse, summary="Get user roles")
async def get_user_roles(
    user_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("users:read")),
    container: ServiceContainer = Depends(get_container),
) -> UserRolesResponse:
    try:
        roles = await container.get_user_roles_use_case.execute(tenant_id, user_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return UserRolesResponse(user_id=user_id, roles=[_role_to_response(role) for role in roles])


@router.put("/{user_id}/roles", status_code=status.HTTP_204_NO_CONTENT, summary="Replace user roles")
async def replace_user_roles(
    user_id: UUID,
    body: AssignRolesRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    current_user: AuthenticatedUser = Depends(require_permission("users:write")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.update_admin_user_use_case.execute(
            tenant_id,
            user_id,
            UpdateAdminUserDTO(role_ids=body.role_ids),
            current_user.user_id,
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{user_id}/roles", status_code=status.HTTP_204_NO_CONTENT, summary="Assign roles to user")
async def assign_roles(
    user_id: UUID,
    body: AssignRolesRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    current_user: AuthenticatedUser = Depends(require_permission("users:write")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.assign_roles_to_user_use_case.execute(
            tenant_id,
            user_id,
            AssignRolesDTO(role_ids=body.role_ids),
            current_user.user_id,
        )
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove role from user",
)
async def remove_role(
    user_id: UUID,
    role_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("users:write")),
    container: ServiceContainer = Depends(get_container),
) -> Response:
    try:
        await container.remove_role_from_user_use_case.execute(tenant_id, user_id, role_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{user_id}/permissions",
    response_model=UserPermissionsResponse,
    summary="Get effective permissions for user",
)
async def get_user_permissions(
    user_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    _: AuthenticatedUser = Depends(require_permission("users:read")),
    container: ServiceContainer = Depends(get_container),
) -> UserPermissionsResponse:
    try:
        permissions = await container.get_user_permissions_use_case.execute(tenant_id, user_id)
    except DomainException as exc:
        raise _map_error(exc) from exc
    return UserPermissionsResponse(user_id=user_id, permissions=permissions)
