from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    code: str
    name: str
    description: str | None
    is_system: bool
    created_at: datetime


class CreateRoleRequest(BaseModel):
    code: str = Field(min_length=2, max_length=64)
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class UpdateRoleRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
