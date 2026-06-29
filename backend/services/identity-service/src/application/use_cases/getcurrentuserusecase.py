from uuid import UUID

from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from domain.entities.user import User
from domain.exceptions.domain_exception import NotFoundError


class GetCurrentUserUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def execute(self, tenant_id: UUID, user_id: UUID) -> dict:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        role_codes = await self._role_repository.list_user_role_codes(tenant_id, user_id)
        if user.is_superadmin or "admin" in role_codes:
            permissions = [p.code for p in await self._permission_repository.list_all()]
        else:
            permissions = await self._permission_repository.list_user_effective_permissions(
                tenant_id, user_id
            )
        return {
            "id": user.id,
            "tenant_id": user.tenant_id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "email_verified": user.email_verified,
            "roles": role_codes,
            "permissions": permissions,
        }
