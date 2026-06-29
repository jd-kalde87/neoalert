from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.role import Role


class RoleRepository(ABC):
    @abstractmethod
    async def list_all(self, tenant_id: UUID) -> list[Role]:
        ...

    @abstractmethod
    async def find_by_id(self, tenant_id: UUID, role_id: UUID) -> Role | None:
        ...

    @abstractmethod
    async def find_by_code(self, tenant_id: UUID, code: str) -> Role | None:
        ...

    @abstractmethod
    async def save(self, entity: Role) -> Role:
        ...

    @abstractmethod
    async def update(self, entity: Role) -> Role:
        ...

    @abstractmethod
    async def delete(self, tenant_id: UUID, role_id: UUID) -> None:
        ...

    @abstractmethod
    async def assign_to_user(self, user_id: UUID, role_id: UUID, assigned_by: UUID | None) -> None:
        ...

    @abstractmethod
    async def remove_from_user(self, user_id: UUID, role_id: UUID) -> None:
        ...

    @abstractmethod
    async def list_user_role_ids(self, tenant_id: UUID, user_id: UUID) -> list[UUID]:
        ...

    @abstractmethod
    async def list_user_role_codes(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        ...
