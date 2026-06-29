from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class CreateTemplateDTO(BaseModel):
    name: str
    structure_type: str
    columns: list[dict[str, str]]
