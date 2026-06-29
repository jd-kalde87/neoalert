from uuid import UUID

from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from core.access_catalog import DEFAULT_ROLES, FEATURE_PERMISSIONS
from core.config import Settings
from domain.entities.permission import Permission
from domain.entities.role import Role
from domain.entities.user import User
from infrastructure.security.passwordhasher import PasswordHasher

DEFAULT_PERMISSIONS: list[tuple[str, str, str, str]] = [
    ("users:read", "Read users", "users", "read"),
    ("users:write", "Write users", "users", "write"),
    ("roles:read", "Read roles", "roles", "read"),
    ("roles:manage", "Manage roles", "roles", "manage"),
    ("permissions:read", "Read permissions", "permissions", "read"),
    ("permissions:manage", "Manage permissions", "permissions", "manage"),
    ("auth:manage", "Manage auth settings", "auth", "manage"),
]


class SeedDataService:
    def __init__(
        self,
        settings: Settings,
        user_repository: UserRepository,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        self._settings = settings
        self._user_repository = user_repository
        self._role_repository = role_repository
        self._permission_repository = permission_repository
        self._password_hasher = password_hasher

    async def seed_if_empty(self) -> None:
        permission_map = await self._ensure_permissions()
        tenant_id = self._settings.default_tenant_id

        admin_role = await self._role_repository.find_by_code(tenant_id, "admin")
        if admin_role is None:
            admin_role = await self._role_repository.save(
                Role(
                    tenant_id=tenant_id,
                    code="admin",
                    name="Administrator",
                    description="Full access to all permissions",
                    is_system=True,
                )
            )

        all_permissions = await self._permission_repository.list_all()
        for permission in all_permissions:
            if permission.code not in await self._permission_repository.list_role_permission_codes(admin_role.id):
                await self._permission_repository.assign_to_role(admin_role.id, permission.id)

        await self._ensure_default_roles(tenant_id, permission_map)

        admin_email = "admin@neoalert.com"
        admin_user = await self._user_repository.find_by_email(tenant_id, admin_email)
        if admin_user is None:
            admin_user = User(
                tenant_id=tenant_id,
                email=admin_email,
                username="admin",
                full_name="System Administrator",
                hashed_password=self._password_hasher.hash("Admin123!"),
                email_verified=True,
                is_superadmin=True,
            )
            admin_user = await self._user_repository.save(admin_user)
            await self._role_repository.assign_to_user(admin_user.id, admin_role.id, None)

    async def _ensure_permissions(self) -> dict[str, Permission]:
        permission_map: dict[str, Permission] = {}
        catalog = DEFAULT_PERMISSIONS + FEATURE_PERMISSIONS

        for code, name, resource, action in catalog:
            existing = await self._permission_repository.find_by_code(code)
            if existing is None:
                saved = await self._permission_repository.save(
                    Permission(code=code, name=name, resource=resource, action=action)
                )
                permission_map[code] = saved
            else:
                permission_map[code] = existing

        return permission_map

    async def _ensure_default_roles(self, tenant_id: UUID, permission_map: dict[str, Permission]) -> None:
        for code, name, description, permission_codes in DEFAULT_ROLES:
            role = await self._role_repository.find_by_code(tenant_id, code)
            if role is None:
                role = await self._role_repository.save(
                    Role(
                        tenant_id=tenant_id,
                        code=code,
                        name=name,
                        description=description,
                        is_system=True,
                    )
                )
                permission_ids = [
                    permission_map[perm_code].id
                    for perm_code in permission_codes
                    if perm_code in permission_map
                ]
                await self._permission_repository.replace_role_permissions(role.id, permission_ids)
