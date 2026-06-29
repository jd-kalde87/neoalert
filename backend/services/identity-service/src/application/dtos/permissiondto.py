from pydantic import BaseModel, Field


class CreatePermissionDTO(BaseModel):
    code: str = Field(min_length=3, max_length=128)
    name: str = Field(min_length=1, max_length=160)
    resource: str = Field(min_length=1, max_length=64)
    action: str = Field(min_length=1, max_length=32)
    description: str | None = None


class UpdatePermissionDTO(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    resource: str | None = Field(default=None, min_length=1, max_length=64)
    action: str | None = Field(default=None, min_length=1, max_length=32)
    description: str | None = None
