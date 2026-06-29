from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.notification import Notification


class NotificationRepository(ABC):
    @abstractmethod
    async def save(self, tenant_id: UUID, *args: object) -> Notification | None:
        ...

    @abstractmethod
    async def save(self, entity: Notification) -> Notification:
        ...
