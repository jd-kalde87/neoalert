from datetime import date
from uuid import uuid4

import pytest

from application.dtos.createincidentdto import CreateIncidentDTO
from application.use_cases.createincidentusecase import CreateIncidentUseCase
from infrastructure.repositories.in_memory_incidentrepository import InMemoryIncidentRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryIncidentRepository()
    use_case_instance = CreateIncidentUseCase(repo)
    tenant_id = uuid4()
    dto = CreateIncidentDTO(title="test", severity="test", source="test")
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
