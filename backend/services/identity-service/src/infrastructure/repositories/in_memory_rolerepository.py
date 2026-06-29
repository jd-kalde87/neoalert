from uuid import UUID

from application.interfaces.rolerepository import RoleRepository
from domain.entities.role import Role


class InMemoryRoleRepository(RoleRepository):
    def __init__(self) -> None:
        self._roles: dict[UUID, Role] = {}
        self._user_roles: dict[UUID, set[UUID]] = {}

    async def list_all(self, tenant_id: UUID) -> list[Role]:
        return [role for role in self._roles.values() if role.tenant_id == tenant_id]

    async def find_by_id(self, tenant_id: UUID, role_id: UUID) -> Role | None:
        role = self._roles.get(role_id)
        if role and role.tenant_id == tenant_id:
            return role
        return None

    async def find_by_code(self, tenant_id: UUID, code: str) -> Role | None:
        for role in self._roles.values():
            if role.tenant_id == tenant_id and role.code == code:
                return role
        return None

    async def save(self, entity: Role) -> Role:
        self._roles[entity.id] = entity
        return entity

    async def update(self, entity: Role) -> Role:
        self._roles[entity.id] = entity
        return entity

    async def delete(self, tenant_id: UUID, role_id: UUID) -> None:
        role = await self.find_by_id(tenant_id, role_id)
        if role:
            del self._roles[role_id]
            for user_id in list(self._user_roles.keys()):
                self._user_roles[user_id].discard(role_id)

    async def assign_to_user(self, user_id: UUID, role_id: UUID, assigned_by: UUID | None) -> None:
        self._user_roles.setdefault(user_id, set()).add(role_id)

    async def remove_from_user(self, user_id: UUID, role_id: UUID) -> None:
        if user_id in self._user_roles:
            self._user_roles[user_id].discard(role_id)

    async def list_user_role_ids(self, tenant_id: UUID, user_id: UUID) -> list[UUID]:
        role_ids = self._user_roles.get(user_id, set())
        return [
            role_id
            for role_id in role_ids
            if role_id in self._roles and self._roles[role_id].tenant_id == tenant_id
        ]

    async def list_user_role_codes(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        role_ids = await self.list_user_role_ids(tenant_id, user_id)
        return [self._roles[role_id].code for role_id in role_ids]
