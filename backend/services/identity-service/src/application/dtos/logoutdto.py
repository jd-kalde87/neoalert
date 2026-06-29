from pydantic import BaseModel


class LogoutDTO(BaseModel):
    refresh_token: str
