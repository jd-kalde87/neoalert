from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.locationtrace import LocationTrace


class LocationRepository(ABC):
    @abstractmethod
    async def save_trace(self, tenant_id: UUID, *args: object) -> LocationTrace | None:
        ...

    @abstractmethod
    async def save(self, entity: LocationTrace) -> LocationTrace:
        ...
