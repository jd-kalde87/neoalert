from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class ImportTemplate:
    tenant_id: UUID
    name: str
    structure_type: str
    version: int
    columns: list[dict[str, str]]
    is_active: bool = True
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
