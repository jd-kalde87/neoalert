from pydantic import BaseModel, EmailStr, Field


class RegisterDTO(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=200)
    username: str | None = Field(default=None, min_length=3, max_length=64)
