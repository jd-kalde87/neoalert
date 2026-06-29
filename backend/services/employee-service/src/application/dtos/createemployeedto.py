from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class CreateEmployeeDTO(BaseModel):
    first_name: str
    last_name: str
    position_id: UUID | None = None
