from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class AttendanceRecord:
    tenant_id: UUID
    employee_id: UUID
    record_type: str
    recorded_at: datetime
    latitude: float | None
    longitude: float | None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
