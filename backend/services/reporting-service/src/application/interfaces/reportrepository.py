from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.reportdefinition import ReportDefinition


class ReportRepository(ABC):
    @abstractmethod
    async def find_by_id(self, tenant_id: UUID, *args: object) -> ReportDefinition | None:
        ...

    @abstractmethod
    async def save(self, entity: ReportDefinition) -> ReportDefinition:
        ...
