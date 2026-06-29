from uuid import UUID

from application.interfaces.tenantrepository import TenantRepository
from domain.entities.tenant import Tenant


class InMemoryTenantRepository(TenantRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, Tenant] = {}

    async def find_by_slug(self, tenant_id: UUID, *args: object) -> Tenant | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: Tenant) -> Tenant:
        self._store[entity.id] = entity
        return entity
