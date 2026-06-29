import os
from unittest.mock import patch

from core.config import Settings


def test_auto_selects_smtp_when_credentials_configured() -> None:
    env = {
        "IDENTITYSERVICE_EMAIL_ADAPTER": "console",
        "IDENTITYSERVICE_SMTP_HOST": "smtp.gmail.com",
        "IDENTITYSERVICE_SMTP_PORT": "587",
        "IDENTITYSERVICE_SMTP_USER": "user@gmail.com",
        "IDENTITYSERVICE_SMTP_PASSWORD": "secret",
        "IDENTITYSERVICE_SMTP_FROM_EMAIL": "user@gmail.com",
        "IDENTITYSERVICE_SMTP_USE_TLS": "true",
    }
    with patch.dict(os.environ, env, clear=False):
        settings = Settings()
    assert settings.email_adapter == "smtp"


def test_legacy_smtp_env_aliases_are_honored() -> None:
    env = {
        "EMAIL_ADAPTER": "smtp",
        "SMTP_HOST": "smtp.example.com",
        "SMTP_PORT": "587",
        "SMTP_USER": "noreply@example.com",
        "SMTP_PASSWORD": "secret",
        "SMTP_FROM_EMAIL": "noreply@example.com",
        "SMTP_USE_TLS": "true",
    }
    with patch.dict(os.environ, env, clear=True):
        settings = Settings()
    assert settings.email_adapter == "smtp"
    assert settings.smtp_host == "smtp.example.com"
    assert settings.smtp_user == "noreply@example.com"
