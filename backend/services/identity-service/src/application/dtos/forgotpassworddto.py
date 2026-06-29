from pydantic import BaseModel, EmailStr


class ForgotPasswordDTO(BaseModel):
    email: EmailStr
