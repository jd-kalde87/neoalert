from uuid import UUID

from application.interfaces.auditlogrepository import AuditLogRepository
from domain.entities.auditlogentry import AuditLogEntry


class InMemoryAuditLogRepository(AuditLogRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, AuditLogEntry] = {}

    async def append(self, tenant_id: UUID, *args: object) -> AuditLogEntry | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: AuditLogEntry) -> AuditLogEntry:
        self._store[entity.id] = entity
        return entity
