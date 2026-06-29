from uuid import UUID

from application.dtos.sendnotificationdto import SendNotificationDTO
from application.interfaces.notificationrepository import NotificationRepository
from domain.entities.notification import Notification


class SendNotificationUseCase:
    def __init__(self, repository: NotificationRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: SendNotificationDTO) -> Notification:
        entity = Notification(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
