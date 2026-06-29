from uuid import UUID

from application.interfaces.userrepository import UserRepository
from domain.entities.user import User


class InMemoryUserRepository(UserRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, User] = {}

    async def find_by_id(self, tenant_id: UUID, user_id: UUID) -> User | None:
        user = self._store.get(user_id)
        if user and user.tenant_id == tenant_id:
            return user
        return None

    async def find_by_email(self, tenant_id: UUID, email: str) -> User | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id and item.email.lower() == email.lower():
                return item
        return None

    async def find_by_username(self, tenant_id: UUID, username: str) -> User | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id and item.username == username:
                return item
        return None

    async def find_by_google_id(self, google_id: str) -> User | None:
        for item in self._store.values():
            if item.google_id == google_id:
                return item
        return None

    async def save(self, entity: User) -> User:
        self._store[entity.id] = entity
        return entity

    async def update(self, entity: User) -> User:
        self._store[entity.id] = entity
        return entity

    async def list_all(self, tenant_id: UUID, search: str | None = None) -> list[User]:
        users = [item for item in self._store.values() if item.tenant_id == tenant_id]
        if search:
            term = search.strip().lower()
            users = [
                item
                for item in users
                if term in item.email.lower()
                or term in item.full_name.lower()
                or (item.username and term in item.username.lower())
            ]
        return sorted(users, key=lambda item: item.created_at, reverse=True)

    async def soft_delete(self, tenant_id: UUID, user_id: UUID) -> None:
        user = await self.find_by_id(tenant_id, user_id)
        if user:
            user.is_active = False
            self._store.pop(user_id, None)
