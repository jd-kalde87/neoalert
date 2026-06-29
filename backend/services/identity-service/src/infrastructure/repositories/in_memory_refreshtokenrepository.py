from uuid import UUID

from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from domain.entities.refreshtoken import RefreshToken


class InMemoryRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, RefreshToken] = {}
        self._hash_index: dict[str, UUID] = {}

    async def save(self, entity: RefreshToken) -> RefreshToken:
        self._store[entity.id] = entity
        self._hash_index[entity.token_hash] = entity.id
        return entity

    async def find_by_hash(self, token_hash: str) -> RefreshToken | None:
        token_id = self._hash_index.get(token_hash)
        if token_id is None:
            return None
        return self._store.get(token_id)

    async def revoke(self, token_id: UUID) -> None:
        from datetime import datetime, timezone

        token = self._store.get(token_id)
        if token:
            token.revoked_at = datetime.now(timezone.utc)

    async def revoke_all_for_user(self, tenant_id: UUID, user_id: UUID) -> None:
        from datetime import datetime, timezone

        for token in self._store.values():
            if token.tenant_id == tenant_id and token.user_id == user_id:
                token.revoked_at = datetime.now(timezone.utc)
