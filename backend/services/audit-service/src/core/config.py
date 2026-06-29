from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="AUDITSERVICE_")

    service_name: str = "audit-service"
    host: str = "0.0.0.0"
    port: int = 8012
    debug: bool = False
    log_level: str = "INFO"
    database_url: str = "postgresql+asyncpg://neoalert:neoalert@postgres:5432/audit_service"
    redis_url: str = "redis://redis:6379/0"
    rabbitmq_url: str = "amqp://neoalert:neoalert@rabbitmq:5672/"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    identity_service_url: str = "http://identity-service:8001"
