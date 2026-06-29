from uuid import UUID

from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from domain.entities.passwordresettoken import PasswordResetToken


class InMemoryPasswordResetTokenRepository(PasswordResetTokenRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, PasswordResetToken] = {}
        self._hash_index: dict[str, UUID] = {}

    async def save(self, entity: PasswordResetToken) -> PasswordResetToken:
        self._store[entity.id] = entity
        self._hash_index[entity.token_hash] = entity.id
        return entity

    async def find_by_hash(self, token_hash: str) -> PasswordResetToken | None:
        token_id = self._hash_index.get(token_hash)
        if token_id is None:
            return None
        return self._store.get(token_id)

    async def mark_used(self, token_id: UUID) -> None:
        from datetime import datetime, timezone

        token = self._store.get(token_id)
        if token:
            token.used_at = datetime.now(timezone.utc)
