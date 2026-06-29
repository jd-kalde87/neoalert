from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class ClassificationRequestDTO(BaseModel):
    incident_id: UUID
    text: str
