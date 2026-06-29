from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Notification:
    tenant_id: UUID
    channel: str
    recipient_id: UUID
    subject: str
    body: str
    status: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
