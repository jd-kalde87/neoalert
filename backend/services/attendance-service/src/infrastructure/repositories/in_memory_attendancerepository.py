from uuid import UUID

from application.interfaces.attendancerepository import AttendanceRepository
from domain.entities.attendancerecord import AttendanceRecord


class InMemoryAttendanceRepository(AttendanceRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, AttendanceRecord] = {}

    async def save(self, tenant_id: UUID, *args: object) -> AttendanceRecord | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: AttendanceRecord) -> AttendanceRecord:
        self._store[entity.id] = entity
        return entity
