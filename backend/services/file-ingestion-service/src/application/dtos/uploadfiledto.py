from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class UploadFileDTO(BaseModel):
    template_id: UUID
    file_name: str
