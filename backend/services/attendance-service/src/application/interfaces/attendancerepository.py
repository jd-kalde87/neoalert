from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.attendancerecord import AttendanceRecord


class AttendanceRepository(ABC):
    @abstractmethod
    async def save(self, tenant_id: UUID, *args: object) -> AttendanceRecord | None:
        ...

    @abstractmethod
    async def save(self, entity: AttendanceRecord) -> AttendanceRecord:
        ...
