from uuid import UUID

from application.dtos.uploadfiledto import UploadFileDTO
from application.interfaces.ingestionbatchrepository import IngestionBatchRepository
from domain.entities.ingestionbatch import IngestionBatch


class UploadFileUseCase:
    def __init__(self, repository: IngestionBatchRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: UploadFileDTO) -> IngestionBatch:
        entity = IngestionBatch(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
