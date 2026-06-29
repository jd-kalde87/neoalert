from pydantic import BaseModel, EmailStr, model_validator


class LoginDTO(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str

    @model_validator(mode="after")
    def validate_identifier(self) -> "LoginDTO":
        if not self.username and not self.email:
            raise ValueError("username or email is required")
        return self
