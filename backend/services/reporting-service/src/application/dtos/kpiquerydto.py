from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class KpiQueryDTO(BaseModel):
    metric: str
    start_date: date
    end_date: date
