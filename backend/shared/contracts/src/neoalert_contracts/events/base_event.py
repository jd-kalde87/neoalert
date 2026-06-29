from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BaseEvent(BaseModel):
    event_id: UUID
    event_type: str
    tenant_id: UUID
    correlation_id: str
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0"
