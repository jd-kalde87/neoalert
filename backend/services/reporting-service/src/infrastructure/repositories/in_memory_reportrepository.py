from uuid import UUID

from application.interfaces.reportrepository import ReportRepository
from domain.entities.reportdefinition import ReportDefinition


class InMemoryReportRepository(ReportRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, ReportDefinition] = {}

    async def find_by_id(self, tenant_id: UUID, *args: object) -> ReportDefinition | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: ReportDefinition) -> ReportDefinition:
        self._store[entity.id] = entity
        return entity
