import asyncio
import logging
import smtplib
from email.message import EmailMessage

from application.interfaces.emailservice import EmailService
from core.config import Settings
from infrastructure.email.emailtemplates import (
    password_reset_email_body,
    password_reset_email_subject,
    verification_email_body,
    verification_email_subject,
)

logger = logging.getLogger(__name__)


class SmtpEmailAdapter(EmailService):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def _connect(self) -> smtplib.SMTP | smtplib.SMTP_SSL:
        host = self._settings.smtp_host
        port = self._settings.smtp_port
        timeout = 30
        if port == 465:
            logger.debug("Connecting via SMTP_SSL to %s:%s", host, port)
            return smtplib.SMTP_SSL(host, port, timeout=timeout)
        logger.debug("Connecting via SMTP to %s:%s (TLS=%s)", host, port, self._settings.smtp_use_tls)
        return smtplib.SMTP(host, port, timeout=timeout)

    def _send(self, to_email: str, subject: str, body: str) -> None:
        if not self._settings.smtp_from_email:
            raise ValueError("IDENTITYSERVICE_SMTP_FROM_EMAIL is required for SMTP delivery")

        message = EmailMessage()
        message["From"] = self._settings.smtp_from_email
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        try:
            with self._connect() as server:
                if self._settings.smtp_port != 465 and self._settings.smtp_use_tls:
                    server.starttls()
                if self._settings.smtp_user:
                    server.login(self._settings.smtp_user, self._settings.smtp_password)
                refused = server.send_message(message)
                if refused:
                    raise smtplib.SMTPException(f"SMTP server refused recipients: {refused}")
        except Exception:
            logger.exception(
                "Failed to send email via SMTP (%s:%s, TLS=%s, user=%s) to %s",
                self._settings.smtp_host,
                self._settings.smtp_port,
                self._settings.smtp_use_tls,
                self._settings.smtp_user or "(none)",
                to_email,
            )
            raise

        logger.info(
            "Email sent via SMTP (%s:%s) to %s: %s",
            self._settings.smtp_host,
            self._settings.smtp_port,
            to_email,
            subject,
        )

    async def send_verification_email(self, to_email: str, token: str) -> None:
        await asyncio.to_thread(
            self._send,
            to_email,
            verification_email_subject(),
            verification_email_body(self._settings.frontend_url, token),
        )

    async def send_password_reset_email(self, to_email: str, token: str) -> None:
        await asyncio.to_thread(
            self._send,
            to_email,
            password_reset_email_subject(),
            password_reset_email_body(self._settings.frontend_url, token),
        )
