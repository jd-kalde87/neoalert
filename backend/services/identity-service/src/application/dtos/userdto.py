from dataclasses import dataclass, field
from uuid import UUID


@dataclass
class CreateAdminUserDTO:
    email: str
    password: str
    full_name: str
    username: str | None = None
    email_verified: bool = True
    is_active: bool = True
    role_ids: list[UUID] = field(default_factory=list)


@dataclass
class UpdateAdminUserDTO:
    email: str | None = None
    password: str | None = None
    full_name: str | None = None
    username: str | None = None
    email_verified: bool | None = None
    is_active: bool | None = None
    role_ids: list[UUID] | None = None
