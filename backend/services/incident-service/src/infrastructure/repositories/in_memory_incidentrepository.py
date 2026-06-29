from uuid import UUID

from application.interfaces.incidentrepository import IncidentRepository
from domain.entities.incident import Incident


class InMemoryIncidentRepository(IncidentRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, Incident] = {}

    async def save(self, tenant_id: UUID, *args: object) -> Incident | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: Incident) -> Incident:
        self._store[entity.id] = entity
        return entity
