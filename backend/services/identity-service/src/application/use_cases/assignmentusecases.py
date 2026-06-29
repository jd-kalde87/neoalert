from uuid import UUID

from application.dtos.assignmentdto import AssignPermissionsDTO, AssignRolesDTO
from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from domain.exceptions.domain_exception import NotFoundError


class AssignPermissionsToRoleUseCase:
    def __init__(
        self,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def execute(self, tenant_id: UUID, role_id: UUID, dto: AssignPermissionsDTO) -> None:
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        for permission_id in dto.permission_ids:
            permission = await self._permission_repository.find_by_id(permission_id)
            if permission is None:
                raise NotFoundError(f"Permission {permission_id} not found")
            await self._permission_repository.assign_to_role(role_id, permission_id)


class RemovePermissionFromRoleUseCase:
    def __init__(
        self,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def execute(self, tenant_id: UUID, role_id: UUID, permission_id: UUID) -> None:
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        permission = await self._permission_repository.find_by_id(permission_id)
        if permission is None:
            raise NotFoundError("Permission not found")
        await self._permission_repository.remove_from_role(role_id, permission_id)


class AssignRolesToUserUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository,
    ) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository

    async def execute(
        self,
        tenant_id: UUID,
        user_id: UUID,
        dto: AssignRolesDTO,
        assigned_by: UUID | None,
    ) -> None:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        for role_id in dto.role_ids:
            role = await self._role_repository.find_by_id(tenant_id, role_id)
            if role is None:
                raise NotFoundError(f"Role {role_id} not found")
            await self._role_repository.assign_to_user(user_id, role_id, assigned_by)


class RemoveRoleFromUserUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository,
    ) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, user_id: UUID, role_id: UUID) -> None:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        await self._role_repository.remove_from_user(user_id, role_id)


class GetUserPermissionsUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def execute(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        role_codes = await self._role_repository.list_user_role_codes(tenant_id, user_id)
        if user.is_superadmin or "admin" in role_codes:
            return [p.code for p in await self._permission_repository.list_all()]
        return await self._permission_repository.list_user_effective_permissions(tenant_id, user_id)


class GetRolePermissionsUseCase:
    def __init__(
        self,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def execute(self, tenant_id: UUID, role_id: UUID):
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        return await self._permission_repository.list_by_role_id(role_id)


class SetRolePermissionsUseCase:
    def __init__(
        self,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def execute(self, tenant_id: UUID, role_id: UUID, dto: AssignPermissionsDTO) -> None:
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        for permission_id in dto.permission_ids:
            permission = await self._permission_repository.find_by_id(permission_id)
            if permission is None:
                raise NotFoundError(f"Permission {permission_id} not found")
        await self._permission_repository.replace_role_permissions(role_id, dto.permission_ids)
