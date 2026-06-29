from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.incident import Incident


class IncidentRepository(ABC):
    @abstractmethod
    async def save(self, tenant_id: UUID, *args: object) -> Incident | None:
        ...

    @abstractmethod
    async def save(self, entity: Incident) -> Incident:
        ...
