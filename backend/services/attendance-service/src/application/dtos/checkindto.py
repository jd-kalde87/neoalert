from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class CheckInDTO(BaseModel):
    employee_id: UUID
    latitude: float | None = None
    longitude: float | None = None
