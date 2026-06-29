from dataclasses import dataclass

from domain.entities.user import User


@dataclass(frozen=True)
class RegisterResult:
    user: User
    verification_email_sent: bool
    warning: str | None = None
