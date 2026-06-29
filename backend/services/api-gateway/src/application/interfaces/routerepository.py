from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.routedefinition import RouteDefinition


class RouteRepository(ABC):
    @abstractmethod
    async def find_by_path(self, tenant_id: UUID, *args: object) -> RouteDefinition | None:
        ...

    @abstractmethod
    async def save(self, entity: RouteDefinition) -> RouteDefinition:
        ...
