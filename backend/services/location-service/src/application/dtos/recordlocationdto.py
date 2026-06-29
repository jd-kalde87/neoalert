from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class RecordLocationDTO(BaseModel):
    employee_id: UUID
    latitude: float
    longitude: float
