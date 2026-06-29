from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class LocationTrace:
    tenant_id: UUID
    employee_id: UUID
    latitude: float
    longitude: float
    recorded_at: datetime
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
