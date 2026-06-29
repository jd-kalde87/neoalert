from datetime import date
from uuid import uuid4

import pytest

from application.dtos.createtenantdto import CreateTenantDTO
from application.use_cases.createtenantusecase import CreateTenantUseCase
from infrastructure.repositories.in_memory_tenantrepository import InMemoryTenantRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryTenantRepository()
    use_case_instance = CreateTenantUseCase(repo)
    tenant_id = uuid4()
    dto = CreateTenantDTO(name="test", slug="test", country_code="test")
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
