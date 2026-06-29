from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APIGATEWAY_")

    service_name: str = "api-gateway"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    log_level: str = "INFO"
    database_url: str = "postgresql+asyncpg://neoalert:neoalert@postgres:5432/api_gateway"
    redis_url: str = "redis://redis:6379/0"
    rabbitmq_url: str = "amqp://neoalert:neoalert@rabbitmq:5672/"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    identity_service_url: str = "http://identity-service:8001"
    tenant_service_url: str = "http://tenant-service:8002"
    employee_service_url: str = "http://employee-service:8003"
    attendance_service_url: str = "http://attendance-service:8004"
    location_service_url: str = "http://location-service:8005"
    incident_service_url: str = "http://incident-service:8006"
    file_ingestion_service_url: str = "http://file-ingestion-service:8007"
    template_configuration_service_url: str = "http://template-configuration-service:8008"
    notification_service_url: str = "http://notification-service:8009"
    reporting_service_url: str = "http://reporting-service:8010"
    ai_service_url: str = "http://ai-service:8011"
    audit_service_url: str = "http://audit-service:8012"
    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
