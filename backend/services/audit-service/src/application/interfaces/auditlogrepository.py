from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.auditlogentry import AuditLogEntry


class AuditLogRepository(ABC):
    @abstractmethod
    async def append(self, tenant_id: UUID, *args: object) -> AuditLogEntry | None:
        ...

    @abstractmethod
    async def save(self, entity: AuditLogEntry) -> AuditLogEntry:
        ...
