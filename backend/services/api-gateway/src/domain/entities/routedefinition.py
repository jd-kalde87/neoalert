from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class RouteDefinition:
    tenant_id: UUID
    path: str
    target_service: str
    methods: list[str]
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
