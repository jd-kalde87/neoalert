from uuid import UUID

from application.dtos.checkindto import CheckInDTO
from application.interfaces.attendancerepository import AttendanceRepository
from domain.entities.attendancerecord import AttendanceRecord


class CheckInUseCase:
    def __init__(self, repository: AttendanceRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: CheckInDTO) -> AttendanceRecord:
        entity = AttendanceRecord(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
