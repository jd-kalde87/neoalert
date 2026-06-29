from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.user import User


class UserRepository(ABC):
    @abstractmethod
    async def find_by_id(self, tenant_id: UUID, user_id: UUID) -> User | None:
        ...

    @abstractmethod
    async def find_by_email(self, tenant_id: UUID, email: str) -> User | None:
        ...

    @abstractmethod
    async def find_by_username(self, tenant_id: UUID, username: str) -> User | None:
        ...

    @abstractmethod
    async def find_by_google_id(self, google_id: str) -> User | None:
        ...

    @abstractmethod
    async def save(self, entity: User) -> User:
        ...

    @abstractmethod
    async def update(self, entity: User) -> User:
        ...

    @abstractmethod
    async def list_all(self, tenant_id: UUID, search: str | None = None) -> list[User]:
        ...

    @abstractmethod
    async def soft_delete(self, tenant_id: UUID, user_id: UUID) -> None:
        ...
