from datetime import date
from uuid import uuid4

import pytest

from application.dtos.recordlocationdto import RecordLocationDTO
from application.use_cases.recordlocationusecase import RecordLocationUseCase
from infrastructure.repositories.in_memory_locationrepository import InMemoryLocationRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryLocationRepository()
    use_case_instance = RecordLocationUseCase(repo)
    tenant_id = uuid4()
    dto = RecordLocationDTO(employee_id=uuid4(), latitude=0.0, longitude=0.0)
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
