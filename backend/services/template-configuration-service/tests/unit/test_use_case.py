from datetime import date
from uuid import uuid4

import pytest

from application.dtos.createtemplatedto import CreateTemplateDTO
from application.use_cases.createtemplateusecase import CreateTemplateUseCase
from infrastructure.repositories.in_memory_templaterepository import InMemoryTemplateRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryTemplateRepository()
    use_case_instance = CreateTemplateUseCase(repo)
    tenant_id = uuid4()
    dto = CreateTemplateDTO(name="test", structure_type="test", columns={})
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
