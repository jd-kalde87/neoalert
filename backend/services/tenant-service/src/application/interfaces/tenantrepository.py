from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.tenant import Tenant


class TenantRepository(ABC):
    @abstractmethod
    async def find_by_slug(self, tenant_id: UUID, *args: object) -> Tenant | None:
        ...

    @abstractmethod
    async def save(self, entity: Tenant) -> Tenant:
        ...
