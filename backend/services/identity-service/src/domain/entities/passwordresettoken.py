from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4


@dataclass
class PasswordResetToken:
    tenant_id: UUID
    user_id: UUID
    token_hash: str
    expires_at: datetime
    used_at: datetime | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
