from types import TracebackType
from typing import Self

from application.interfaces.attendancerepository import AttendanceRepository
from application.interfaces.unitofwork import UnitOfWork
from infrastructure.messaging.outbox_publisher import OutboxPublisher


class InMemoryUnitOfWork(UnitOfWork):
    def __init__(
        self,
        attendance_repository: AttendanceRepository,
        outbox_publisher: OutboxPublisher,
    ) -> None:
        self.attendance_repository = attendance_repository
        self.outbox_publisher = outbox_publisher
        self._committed = False

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        if exc_type is not None:
            await self.rollback()

    async def commit(self) -> None:
        self._committed = True

    async def rollback(self) -> None:
        self._committed = False
