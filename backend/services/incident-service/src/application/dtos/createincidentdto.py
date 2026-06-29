from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class CreateIncidentDTO(BaseModel):
    title: str
    severity: str
    source: str
