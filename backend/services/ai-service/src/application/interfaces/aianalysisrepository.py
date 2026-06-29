from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.aianalysis import AiAnalysis


class AiAnalysisRepository(ABC):
    @abstractmethod
    async def save(self, tenant_id: UUID, *args: object) -> AiAnalysis | None:
        ...

    @abstractmethod
    async def save(self, entity: AiAnalysis) -> AiAnalysis:
        ...
