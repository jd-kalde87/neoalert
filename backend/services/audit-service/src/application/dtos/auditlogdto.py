from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class AuditLogDTO(BaseModel):
    actor_id: UUID
    action: str
    entity_type: str
    entity_id: UUID
