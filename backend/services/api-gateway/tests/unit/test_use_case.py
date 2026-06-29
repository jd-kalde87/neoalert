from datetime import date
from uuid import uuid4

import pytest

from application.dtos.proxyrequestdto import ProxyRequestDTO
from application.use_cases.proxyrequestusecase import ProxyRequestUseCase
from infrastructure.repositories.in_memory_routerepository import InMemoryRouteRepository


@pytest.mark.asyncio
async def test_resolve_target_success() -> None:
    repo = InMemoryRouteRepository()
    use_case_instance = ProxyRequestUseCase(repo)
    tenant_id = uuid4()
    dto = ProxyRequestDTO(path="test", method="test", headers={})
    result = await use_case_instance.resolve_target(tenant_id, dto)
    assert result.tenant_id == tenant_id
