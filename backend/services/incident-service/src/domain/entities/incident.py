from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Incident:
    tenant_id: UUID
    title: str
    severity: str
    status: str
    latitude: float | None
    longitude: float | None
    source: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
