from uuid import UUID

from application.dtos.classificationrequestdto import ClassificationRequestDTO
from application.interfaces.aianalysisrepository import AiAnalysisRepository
from domain.entities.aianalysis import AiAnalysis


class ClassifyIncidentUseCase:
    def __init__(self, repository: AiAnalysisRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: ClassificationRequestDTO) -> AiAnalysis:
        entity = AiAnalysis(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
