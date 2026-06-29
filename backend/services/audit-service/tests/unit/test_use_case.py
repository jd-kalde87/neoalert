from datetime import date
from uuid import uuid4

import pytest

from application.dtos.auditlogdto import AuditLogDTO
from application.use_cases.recordauditlogusecase import RecordAuditLogUseCase
from infrastructure.repositories.in_memory_auditlogrepository import InMemoryAuditLogRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryAuditLogRepository()
    use_case_instance = RecordAuditLogUseCase(repo)
    tenant_id = uuid4()
    dto = AuditLogDTO(actor_id=uuid4(), action="test", entity_type="test", entity_id=uuid4())
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
