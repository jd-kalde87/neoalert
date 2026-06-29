from uuid import UUID

from application.dtos.recordlocationdto import RecordLocationDTO
from application.interfaces.locationrepository import LocationRepository
from domain.entities.locationtrace import LocationTrace


class RecordLocationUseCase:
    def __init__(self, repository: LocationRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: RecordLocationDTO) -> LocationTrace:
        entity = LocationTrace(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
