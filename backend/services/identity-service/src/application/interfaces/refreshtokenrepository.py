from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.refreshtoken import RefreshToken


class RefreshTokenRepository(ABC):
    @abstractmethod
    async def save(self, entity: RefreshToken) -> RefreshToken:
        ...

    @abstractmethod
    async def find_by_hash(self, token_hash: str) -> RefreshToken | None:
        ...

    @abstractmethod
    async def revoke(self, token_id: UUID) -> None:
        ...

    @abstractmethod
    async def revoke_all_for_user(self, tenant_id: UUID, user_id: UUID) -> None:
        ...
