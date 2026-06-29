from uuid import UUID

from application.interfaces.permissionrepository import PermissionRepository
from domain.entities.permission import Permission


class InMemoryPermissionRepository(PermissionRepository):
    def __init__(self) -> None:
        self._permissions: dict[UUID, Permission] = {}
        self._role_permissions: dict[UUID, set[UUID]] = {}
        self._user_role_lookup: InMemoryRoleLookup | None = None

    def bind_role_lookup(self, role_lookup: "InMemoryRoleLookup") -> None:
        self._user_role_lookup = role_lookup

    async def list_all(self) -> list[Permission]:
        return list(self._permissions.values())

    async def find_by_id(self, permission_id: UUID) -> Permission | None:
        return self._permissions.get(permission_id)

    async def find_by_code(self, code: str) -> Permission | None:
        for permission in self._permissions.values():
            if permission.code == code:
                return permission
        return None

    async def save(self, entity: Permission) -> Permission:
        self._permissions[entity.id] = entity
        return entity

    async def update(self, entity: Permission) -> Permission:
        self._permissions[entity.id] = entity
        return entity

    async def delete(self, permission_id: UUID) -> None:
        self._permissions.pop(permission_id, None)
        for role_id in self._role_permissions:
            self._role_permissions[role_id].discard(permission_id)

    async def assign_to_role(self, role_id: UUID, permission_id: UUID) -> None:
        self._role_permissions.setdefault(role_id, set()).add(permission_id)

    async def remove_from_role(self, role_id: UUID, permission_id: UUID) -> None:
        if role_id in self._role_permissions:
            self._role_permissions[role_id].discard(permission_id)

    async def list_role_permission_codes(self, role_id: UUID) -> list[str]:
        permission_ids = self._role_permissions.get(role_id, set())
        return [
            self._permissions[permission_id].code
            for permission_id in permission_ids
            if permission_id in self._permissions
        ]

    async def list_by_role_id(self, role_id: UUID) -> list[Permission]:
        permission_ids = self._role_permissions.get(role_id, set())
        return sorted(
            [self._permissions[permission_id] for permission_id in permission_ids if permission_id in self._permissions],
            key=lambda item: item.code,
        )

    async def replace_role_permissions(self, role_id: UUID, permission_ids: list[UUID]) -> None:
        self._role_permissions[role_id] = set(permission_ids)

    async def list_user_effective_permissions(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        if self._user_role_lookup is None:
            return []
        role_ids = await self._user_role_lookup.list_user_role_ids(tenant_id, user_id)
        codes: set[str] = set()
        for role_id in role_ids:
            codes.update(await self.list_role_permission_codes(role_id))
        return sorted(codes)


class InMemoryRoleLookup:
    async def list_user_role_ids(self, tenant_id: UUID, user_id: UUID) -> list[UUID]:
        raise NotImplementedError
