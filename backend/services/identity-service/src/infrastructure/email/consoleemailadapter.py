import logging

from application.interfaces.emailservice import EmailService
from core.config import Settings
from infrastructure.email.emailtemplates import (
    password_reset_email_body,
    password_reset_email_link,
    password_reset_email_subject,
    verification_email_body,
    verification_email_link,
    verification_email_subject,
)

logger = logging.getLogger(__name__)

_BANNER = "=" * 72


class ConsoleEmailAdapter(EmailService):
    """Logs emails to stdout. No message is delivered to a real inbox."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def _log_dev_email(self, kind: str, to_email: str, subject: str, action_url: str, body: str) -> None:
        message = (
            f"\n{_BANNER}\n"
            f"[DEV EMAIL — NOT SENT TO INBOX] {kind}\n"
            f"Adapter: console (set IDENTITYSERVICE_EMAIL_ADAPTER=smtp for real delivery)\n"
            f"To: {to_email}\n"
            f"Subject: {subject}\n"
            f"Action URL (copy and open in browser):\n  {action_url}\n"
            f"{_BANNER}\n"
            f"{body}\n"
            f"{_BANNER}\n"
        )
        logger.warning(message)

    async def send_verification_email(self, to_email: str, token: str) -> None:
        action_url = verification_email_link(self._settings.frontend_url, token)
        self._log_dev_email(
            "Verification email",
            to_email,
            verification_email_subject(),
            action_url,
            verification_email_body(self._settings.frontend_url, token),
        )

    async def send_password_reset_email(self, to_email: str, token: str) -> None:
        action_url = password_reset_email_link(self._settings.frontend_url, token)
        self._log_dev_email(
            "Password reset email",
            to_email,
            password_reset_email_subject(),
            action_url,
            password_reset_email_body(self._settings.frontend_url, token),
        )
