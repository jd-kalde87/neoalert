from uuid import UUID

from application.dtos.createincidentdto import CreateIncidentDTO
from application.interfaces.incidentrepository import IncidentRepository
from domain.entities.incident import Incident


class CreateIncidentUseCase:
    def __init__(self, repository: IncidentRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: CreateIncidentDTO) -> Incident:
        entity = Incident(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
