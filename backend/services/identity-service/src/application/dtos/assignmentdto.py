from pydantic import BaseModel
from uuid import UUID


class AssignPermissionsDTO(BaseModel):
    permission_ids: list[UUID]


class AssignRolesDTO(BaseModel):
    role_ids: list[UUID]
