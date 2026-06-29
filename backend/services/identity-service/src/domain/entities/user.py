from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4


@dataclass
class User:
    tenant_id: UUID
    email: str
    hashed_password: str
    full_name: str = ""
    username: str | None = None
    roles: list[str] = field(default_factory=list)
    mfa_enabled: bool = False
    is_active: bool = True
    email_verified: bool = False
    google_id: str | None = None
    is_superadmin: bool = False
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
