from datetime import date
from uuid import uuid4

import pytest

from application.dtos.uploadfiledto import UploadFileDTO
from application.use_cases.uploadfileusecase import UploadFileUseCase
from infrastructure.repositories.in_memory_ingestionbatchrepository import InMemoryIngestionBatchRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryIngestionBatchRepository()
    use_case_instance = UploadFileUseCase(repo)
    tenant_id = uuid4()
    dto = UploadFileDTO(template_id=uuid4(), file_name="test")
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
