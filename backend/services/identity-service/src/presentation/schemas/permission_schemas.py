from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    resource: str
    action: str
    description: str | None
    created_at: datetime


class CreatePermissionRequest(BaseModel):
    code: str = Field(min_length=3, max_length=128)
    name: str = Field(min_length=1, max_length=160)
    resource: str = Field(min_length=1, max_length=64)
    action: str = Field(min_length=1, max_length=32)
    description: str | None = None


class UpdatePermissionRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    resource: str | None = Field(default=None, min_length=1, max_length=64)
    action: str | None = Field(default=None, min_length=1, max_length=32)
    description: str | None = None


class AssignPermissionsRequest(BaseModel):
    permission_ids: list[UUID]


class AssignRolesRequest(BaseModel):
    role_ids: list[UUID]


class UserPermissionsResponse(BaseModel):
    user_id: UUID
    permissions: list[str]


class RolePermissionsResponse(BaseModel):
    role_id: UUID
    permissions: list[PermissionResponse]


class AccessRouteResponse(BaseModel):
    route: str
    label: str
    group: str
    permission_code: str
    write_permission_code: str | None = None
