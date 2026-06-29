from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Employee:
    tenant_id: UUID
    first_name: str
    last_name: str
    position_id: UUID | None
    site_id: UUID | None
    supervisor_id: UUID | None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
