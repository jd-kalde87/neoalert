from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class IngestionBatch:
    tenant_id: UUID
    template_id: UUID
    file_name: str
    status: str
    record_count: int = 0
    error_count: int = 0
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
