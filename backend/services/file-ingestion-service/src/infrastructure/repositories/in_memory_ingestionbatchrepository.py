from uuid import UUID

from application.interfaces.ingestionbatchrepository import IngestionBatchRepository
from domain.entities.ingestionbatch import IngestionBatch


class InMemoryIngestionBatchRepository(IngestionBatchRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, IngestionBatch] = {}

    async def save(self, tenant_id: UUID, *args: object) -> IngestionBatch | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: IngestionBatch) -> IngestionBatch:
        self._store[entity.id] = entity
        return entity
