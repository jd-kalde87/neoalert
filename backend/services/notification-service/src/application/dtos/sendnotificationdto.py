from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class SendNotificationDTO(BaseModel):
    channel: str
    recipient_id: UUID
    subject: str
    body: str
