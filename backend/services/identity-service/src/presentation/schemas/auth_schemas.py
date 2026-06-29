from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class LoginRequest(BaseModel):
    username: str | None = Field(default=None, examples=["admin"])
    email: EmailStr | None = Field(default=None, examples=["admin@neoalert.com"])
    password: str = Field(min_length=1, examples=["Admin123!"])

    @model_validator(mode="after")
    def validate_identifier(self) -> "LoginRequest":
        if not self.username and not self.email:
            raise ValueError("username or email is required")
        return self


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=200)
    username: str | None = Field(default=None, min_length=3, max_length=64)


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class MessageResponse(BaseModel):
    message: str


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    email: EmailStr
    username: str | None
    full_name: str
    email_verified: bool
    roles: list[str]
    permissions: list[str]


class RegisterResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    message: str = "Verification email sent"
    verification_email_sent: bool = True


class GoogleAuthResponse(BaseModel):
    authorization_url: str
    state: str


class GoogleIdTokenRequest(BaseModel):
    id_token: str = Field(min_length=1)
