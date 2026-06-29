from datetime import date
from uuid import uuid4

import pytest

from application.dtos.sendnotificationdto import SendNotificationDTO
from application.use_cases.sendnotificationusecase import SendNotificationUseCase
from infrastructure.repositories.in_memory_notificationrepository import InMemoryNotificationRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryNotificationRepository()
    use_case_instance = SendNotificationUseCase(repo)
    tenant_id = uuid4()
    dto = SendNotificationDTO(channel="test", recipient_id=uuid4(), subject="test", body="test")
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
