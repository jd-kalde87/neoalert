from datetime import date
from uuid import uuid4

import pytest

from application.dtos.classificationrequestdto import ClassificationRequestDTO
from application.use_cases.classifyincidentusecase import ClassifyIncidentUseCase
from infrastructure.repositories.in_memory_aianalysisrepository import InMemoryAiAnalysisRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryAiAnalysisRepository()
    use_case_instance = ClassifyIncidentUseCase(repo)
    tenant_id = uuid4()
    dto = ClassificationRequestDTO(incident_id=uuid4(), text="test")
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
