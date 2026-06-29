from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class ReportDefinition:
    tenant_id: UUID
    name: str
    report_type: str
    filters: dict[str, object]
    schedule: str | None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
