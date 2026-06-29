from datetime import date
from uuid import uuid4

import pytest

from application.dtos.checkindto import CheckInDTO
from application.use_cases.checkinusecase import CheckInUseCase
from infrastructure.repositories.in_memory_attendancerepository import InMemoryAttendanceRepository


@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryAttendanceRepository()
    use_case_instance = CheckInUseCase(repo)
    tenant_id = uuid4()
    dto = CheckInDTO(employee_id=uuid4(), latitude=0.0, longitude=0.0)
    result = await use_case_instance.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
