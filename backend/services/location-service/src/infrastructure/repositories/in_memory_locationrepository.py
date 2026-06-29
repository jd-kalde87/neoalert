from uuid import UUID

from application.interfaces.locationrepository import LocationRepository
from domain.entities.locationtrace import LocationTrace


class InMemoryLocationRepository(LocationRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, LocationTrace] = {}

    async def save_trace(self, tenant_id: UUID, *args: object) -> LocationTrace | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: LocationTrace) -> LocationTrace:
        self._store[entity.id] = entity
        return entity
