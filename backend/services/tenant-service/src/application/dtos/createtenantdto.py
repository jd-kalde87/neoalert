from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class CreateTenantDTO(BaseModel):
    name: str
    slug: str
    country_code: str
