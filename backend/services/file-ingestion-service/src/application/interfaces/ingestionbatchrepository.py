from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.ingestionbatch import IngestionBatch


class IngestionBatchRepository(ABC):
    @abstractmethod
    async def save(self, tenant_id: UUID, *args: object) -> IngestionBatch | None:
        ...

    @abstractmethod
    async def save(self, entity: IngestionBatch) -> IngestionBatch:
        ...
