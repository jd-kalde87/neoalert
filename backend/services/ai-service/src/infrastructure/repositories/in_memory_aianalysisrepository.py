from uuid import UUID

from application.interfaces.aianalysisrepository import AiAnalysisRepository
from domain.entities.aianalysis import AiAnalysis


class InMemoryAiAnalysisRepository(AiAnalysisRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, AiAnalysis] = {}

    async def save(self, tenant_id: UUID, *args: object) -> AiAnalysis | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: AiAnalysis) -> AiAnalysis:
        self._store[entity.id] = entity
        return entity
