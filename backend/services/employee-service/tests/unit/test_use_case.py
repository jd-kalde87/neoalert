from datetime import date
from uuid import uuid4

import pytest

from application.dtos.createemployeedto import CreateEmployeeDTO
from application.use_cases.createemployeeusecase import CreateEmployeeUseCase
from infrastructure.repositories.in_memory_employeerepository import InMemoryEmployeeRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryEmployeeRepository()
    use_case_instance = CreateEmployeeUseCase(repo)
    tenant_id = uuid4()
    dto = CreateEmployeeDTO(first_name="test", last_name="test", position_id=uuid4())
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
