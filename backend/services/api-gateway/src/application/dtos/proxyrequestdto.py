from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class ProxyRequestDTO(BaseModel):
    path: str
    method: str
    headers: dict[str, str]
