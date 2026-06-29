import os
from typing import Any, Literal, Self
from uuid import UUID

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_LEGACY_SMTP_ENV = {
    "smtp_host": "SMTP_HOST",
    "smtp_port": "SMTP_PORT",
    "smtp_user": "SMTP_USER",
    "smtp_password": "SMTP_PASSWORD",
    "smtp_from_email": "SMTP_FROM_EMAIL",
    "smtp_use_tls": "SMTP_USE_TLS",
}

_LEGACY_GOOGLE_ENV = {
    "google_client_id": "GOOGLE_CLIENT_ID",
    "google_client_secret": "GOOGLE_CLIENT_SECRET",
    "google_redirect_uri": "GOOGLE_REDIRECT_URI",
}


def _env_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="IDENTITYSERVICE_")

    service_name: str = "identity-service"
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = False
    log_level: str = "INFO"
    storage_backend: Literal["postgres", "memory"] = "postgres"
    auto_apply_schema: bool = False
    schema_dir: str = "/app/schemas/identity-service"
    database_url: str = "postgresql+asyncpg://neoalert:neoalert@postgres:5432/identity_service"
    redis_url: str = "redis://redis:6379/0"
    rabbitmq_url: str = "amqp://neoalert:neoalert@rabbitmq:5672/"
    jwt_secret_key: str = "change-me-in-production-use-32-chars-min"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    identity_service_url: str = "http://identity-service:8001"
    frontend_url: str = "http://localhost:5173"
    default_tenant_id: UUID = UUID("00000000-0000-0000-0000-000000000001")
    email_adapter: Literal["console", "smtp"] = "console"
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@neoalert.local"
    smtp_use_tls: bool = True
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8001/auth/google/callback"
    verification_token_expire_hours: int = 24
    password_reset_token_expire_hours: int = 1

    @model_validator(mode="before")
    @classmethod
    def _apply_legacy_env_aliases(cls, data: Any) -> Any:
        """Accept unprefixed SMTP_* / EMAIL_ADAPTER vars used in older .env examples."""
        merged: dict[str, Any] = dict(data) if isinstance(data, dict) else {}

        for field_name, legacy_key in _LEGACY_SMTP_ENV.items():
            prefixed_key = f"IDENTITYSERVICE_{legacy_key}"
            if merged.get(field_name) not in (None, ""):
                continue
            raw = os.environ.get(prefixed_key) or os.environ.get(legacy_key)
            if raw is None or raw == "":
                continue
            if field_name == "smtp_port":
                merged[field_name] = int(raw)
            elif field_name == "smtp_use_tls":
                merged[field_name] = _env_bool(raw)
            else:
                merged[field_name] = raw

        for field_name, legacy_key in _LEGACY_GOOGLE_ENV.items():
            prefixed_key = f"IDENTITYSERVICE_{legacy_key}"
            if merged.get(field_name) not in (None, ""):
                continue
            raw = os.environ.get(prefixed_key) or os.environ.get(legacy_key)
            if raw is None or raw == "":
                continue
            merged[field_name] = raw

        if merged.get("email_adapter") in (None, ""):
            raw_adapter = os.environ.get("IDENTITYSERVICE_EMAIL_ADAPTER") or os.environ.get(
                "EMAIL_ADAPTER"
            )
            if raw_adapter:
                merged["email_adapter"] = raw_adapter.strip().lower()

        if merged.get("frontend_url") in (None, ""):
            raw_frontend = (
                os.environ.get("IDENTITYSERVICE_FRONTEND_URL")
                or os.environ.get("FRONTEND_URL")
                or os.environ.get("APP_URL")
            )
            if raw_frontend:
                merged["frontend_url"] = raw_frontend.strip().rstrip("/")

        return merged

    @model_validator(mode="after")
    def _normalize_frontend_url(self) -> Self:
        self.frontend_url = self.frontend_url.strip().rstrip("/")
        return self

    @model_validator(mode="after")
    def _auto_select_smtp_adapter(self) -> Self:
        if (
            self.email_adapter == "console"
            and self.smtp_user
            and self.smtp_password
            and self.smtp_host
            and self.smtp_host not in {"mailpit", "localhost"}
        ):
            self.email_adapter = "smtp"
        elif (
            self.email_adapter == "console"
            and self.smtp_user
            and self.smtp_password
            and self.smtp_host == "localhost"
            and self.smtp_port not in {1025, 25}
        ):
            # Credentials with a non-dev port on localhost still imply real SMTP.
            self.email_adapter = "smtp"
        return self

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)
