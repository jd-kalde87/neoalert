from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.permission import Permission


class PermissionRepository(ABC):
    @abstractmethod
    async def list_all(self) -> list[Permission]:
        ...

    @abstractmethod
    async def find_by_id(self, permission_id: UUID) -> Permission | None:
        ...

    @abstractmethod
    async def find_by_code(self, code: str) -> Permission | None:
        ...

    @abstractmethod
    async def save(self, entity: Permission) -> Permission:
        ...

    @abstractmethod
    async def update(self, entity: Permission) -> Permission:
        ...

    @abstractmethod
    async def delete(self, permission_id: UUID) -> None:
        ...

    @abstractmethod
    async def assign_to_role(self, role_id: UUID, permission_id: UUID) -> None:
        ...

    @abstractmethod
    async def remove_from_role(self, role_id: UUID, permission_id: UUID) -> None:
        ...

    @abstractmethod
    async def list_role_permission_codes(self, role_id: UUID) -> list[str]:
        ...

    @abstractmethod
    async def list_by_role_id(self, role_id: UUID) -> list[Permission]:
        ...

    @abstractmethod
    async def replace_role_permissions(self, role_id: UUID, permission_ids: list[UUID]) -> None:
        ...

    @abstractmethod
    async def list_user_effective_permissions(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        ...
