from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.emailverificationtoken import EmailVerificationToken


class EmailVerificationTokenRepository(ABC):
    @abstractmethod
    async def save(self, entity: EmailVerificationToken) -> EmailVerificationToken:
        ...

    @abstractmethod
    async def find_by_hash(self, token_hash: str) -> EmailVerificationToken | None:
        ...

    @abstractmethod
    async def mark_used(self, token_id: UUID) -> None:
        ...
