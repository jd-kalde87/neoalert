from uuid import UUID

from application.interfaces.routerepository import RouteRepository
from domain.entities.routedefinition import RouteDefinition


class InMemoryRouteRepository(RouteRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, RouteDefinition] = {}

    async def find_by_path(self, tenant_id: UUID, *args: object) -> RouteDefinition | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: RouteDefinition) -> RouteDefinition:
        self._store[entity.id] = entity
        return entity
