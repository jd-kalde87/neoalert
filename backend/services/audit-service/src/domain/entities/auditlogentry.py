from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class AuditLogEntry:
    tenant_id: UUID
    actor_id: UUID
    action: str
    entity_type: str
    entity_id: UUID
    changes: dict[str, object]
    immutable_hash: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
