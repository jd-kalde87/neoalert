from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from presentation.schemas.role_schemas import RoleResponse


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    email: EmailStr
    username: str | None
    full_name: str
    email_verified: bool
    is_active: bool
    is_superadmin: bool
    roles: list[str] = Field(default_factory=list)
    created_at: datetime


class CreateAdminUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=200)
    username: str | None = Field(default=None, min_length=3, max_length=64)
    email_verified: bool = True
    is_active: bool = True
    role_ids: list[UUID] = Field(default_factory=list)


class UpdateAdminUserRequest(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    username: str | None = Field(default=None, min_length=3, max_length=64)
    email_verified: bool | None = None
    is_active: bool | None = None
    role_ids: list[UUID] | None = None


class UserRolesResponse(BaseModel):
    user_id: UUID
    roles: list[RoleResponse]
