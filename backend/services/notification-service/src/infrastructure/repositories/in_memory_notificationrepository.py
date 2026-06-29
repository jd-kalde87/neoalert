from uuid import UUID

from application.interfaces.notificationrepository import NotificationRepository
from domain.entities.notification import Notification


class InMemoryNotificationRepository(NotificationRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, Notification] = {}

    async def save(self, tenant_id: UUID, *args: object) -> Notification | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: Notification) -> Notification:
        self._store[entity.id] = entity
        return entity
