from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class AiAnalysis:
    tenant_id: UUID
    entity_type: str
    entity_id: UUID
    analysis_type: str
    result: dict[str, object]
    confidence: float
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
