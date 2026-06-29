from datetime import date
from uuid import uuid4

import pytest

from application.dtos.kpiquerydto import KpiQueryDTO
from application.use_cases.generatekpiusecase import GenerateKpiUseCase
from infrastructure.repositories.in_memory_reportrepository import InMemoryReportRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryReportRepository()
    use_case_instance = GenerateKpiUseCase(repo)
    tenant_id = uuid4()
    dto = KpiQueryDTO(metric="test", start_date=date.today(), end_date=date.today())
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
