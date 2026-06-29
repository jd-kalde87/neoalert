from uuid import UUID

from application.dtos.kpiquerydto import KpiQueryDTO
from application.interfaces.reportrepository import ReportRepository
from domain.entities.reportdefinition import ReportDefinition


class GenerateKpiUseCase:
    def __init__(self, repository: ReportRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: KpiQueryDTO) -> ReportDefinition:
        entity = ReportDefinition(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
