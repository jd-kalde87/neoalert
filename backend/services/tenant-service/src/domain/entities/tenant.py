from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Tenant:
    tenant_id: UUID
    name: str
    slug: str
    country_code: str
    data_residency: str
    branding: dict[str, str]
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
