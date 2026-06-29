from uuid import UUID

from application.dtos.auditlogdto import AuditLogDTO
from application.interfaces.auditlogrepository import AuditLogRepository
from domain.entities.auditlogentry import AuditLogEntry


class RecordAuditLogUseCase:
    def __init__(self, repository: AuditLogRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: AuditLogDTO) -> AuditLogEntry:
        entity = AuditLogEntry(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
