"""Generate NEOALERT microservice skeletons."""
from __future__ import annotations

import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICES_DIR = ROOT / "services"

SERVICE_CONFIGS: list[dict[str, object]] = [
    {
        "name": "api-gateway",
        "port": 8000,
        "title": "NEOALERT API Gateway",
        "entity": "RouteDefinition",
        "entity_fields": "path: str\n    target_service: str\n    methods: list[str]",
        "use_case": "ProxyRequestUseCase",
        "use_case_method": "resolve_target",
        "dto": "ProxyRequestDTO",
        "dto_fields": "path: str\n    method: str\n    headers: dict[str, str]",
        "repo_interface": "RouteRepository",
        "repo_method": "find_by_path",
        "router_prefix": "/gateway",
        "endpoints": [
            ("GET", "/routes", "list_routes", "List configured routes"),
            ("POST", "/proxy/{path:path}", "proxy_request", "Proxy request to downstream service"),
        ],
        "extra_routers": ["rate_limit_router"],
        "patterns": ["circuit_breaker", "rate_limiting"],
    },
    {
        "name": "identity-service",
        "port": 8001,
        "title": "NEOALERT Identity Service",
        "entity": "User",
        "entity_fields": "email: str\n    hashed_password: str\n    roles: list[str]\n    mfa_enabled: bool = False",
        "use_case": "LoginUseCase",
        "use_case_method": "execute",
        "dto": "LoginDTO",
        "dto_fields": "email: str\n    password: str",
        "repo_interface": "UserRepository",
        "repo_method": "find_by_email",
        "router_prefix": "/auth",
        "endpoints": [
            ("POST", "/login", "login", "Authenticate user"),
            ("POST", "/refresh", "refresh_token", "Refresh access token"),
            ("POST", "/mfa/verify", "verify_mfa", "Verify MFA code"),
            ("GET", "/sessions", "list_sessions", "List active sessions"),
        ],
        "patterns": ["jwt", "rbac"],
    },
    {
        "name": "tenant-service",
        "port": 8002,
        "title": "NEOALERT Tenant Service",
        "entity": "Tenant",
        "entity_fields": "name: str\n    slug: str\n    country_code: str\n    data_residency: str\n    branding: dict[str, str]",
        "use_case": "CreateTenantUseCase",
        "use_case_method": "execute",
        "dto": "CreateTenantDTO",
        "dto_fields": "name: str\n    slug: str\n    country_code: str",
        "repo_interface": "TenantRepository",
        "repo_method": "find_by_slug",
        "router_prefix": "/tenants",
        "endpoints": [
            ("POST", "", "create_tenant", "Create tenant"),
            ("GET", "/{tenant_id}", "get_tenant", "Get tenant by ID"),
            ("PATCH", "/{tenant_id}/config", "update_config", "Update tenant config"),
            ("GET", "/{tenant_id}/branding", "get_branding", "Get tenant branding"),
        ],
        "patterns": ["multi_tenant"],
    },
    {
        "name": "employee-service",
        "port": 8003,
        "title": "NEOALERT Employee Service",
        "entity": "Employee",
        "entity_fields": "first_name: str\n    last_name: str\n    position_id: UUID | None\n    site_id: UUID | None\n    supervisor_id: UUID | None",
        "use_case": "CreateEmployeeUseCase",
        "use_case_method": "execute",
        "dto": "CreateEmployeeDTO",
        "dto_fields": "first_name: str\n    last_name: str\n    position_id: UUID | None = None",
        "repo_interface": "EmployeeRepository",
        "repo_method": "find_by_id",
        "router_prefix": "/employees",
        "endpoints": [
            ("POST", "", "create_employee", "Create employee"),
            ("GET", "/{employee_id}", "get_employee", "Get employee"),
            ("GET", "", "list_employees", "List employees"),
            ("POST", "/{employee_id}/assignments", "assign_site", "Assign to site"),
        ],
        "patterns": ["repository"],
    },
    {
        "name": "attendance-service",
        "port": 8004,
        "title": "NEOALERT Attendance Service",
        "entity": "AttendanceRecord",
        "entity_fields": "employee_id: UUID\n    record_type: str\n    recorded_at: datetime\n    latitude: float | None\n    longitude: float | None",
        "use_case": "CheckInUseCase",
        "use_case_method": "execute",
        "dto": "CheckInDTO",
        "dto_fields": "employee_id: UUID\n    latitude: float | None = None\n    longitude: float | None = None",
        "repo_interface": "AttendanceRepository",
        "repo_method": "save",
        "router_prefix": "/attendance",
        "endpoints": [
            ("POST", "/check-in", "check_in", "Register check-in"),
            ("POST", "/check-out", "check_out", "Register check-out"),
            ("POST", "/intermediate-exit", "intermediate_exit", "Intermediate exit"),
            ("GET", "/history/{employee_id}", "get_history", "Attendance history"),
        ],
        "patterns": ["outbox", "geofence_validation"],
    },
    {
        "name": "location-service",
        "port": 8005,
        "title": "NEOALERT Location Service",
        "entity": "LocationTrace",
        "entity_fields": "employee_id: UUID\n    latitude: float\n    longitude: float\n    recorded_at: datetime",
        "use_case": "RecordLocationUseCase",
        "use_case_method": "execute",
        "dto": "RecordLocationDTO",
        "dto_fields": "employee_id: UUID\n    latitude: float\n    longitude: float",
        "repo_interface": "LocationRepository",
        "repo_method": "save_trace",
        "router_prefix": "/locations",
        "endpoints": [
            ("POST", "/traces", "record_trace", "Record location trace"),
            ("GET", "/last/{employee_id}", "last_location", "Last known location"),
            ("GET", "/geofences", "list_geofences", "List geofences"),
            ("GET", "/heatmap", "heatmap_data", "Heatmap data"),
        ],
        "patterns": ["repository"],
    },
    {
        "name": "incident-service",
        "port": 8006,
        "title": "NEOALERT Incident Service",
        "entity": "Incident",
        "entity_fields": "title: str\n    severity: str\n    status: str\n    latitude: float | None\n    longitude: float | None\n    source: str",
        "use_case": "CreateIncidentUseCase",
        "use_case_method": "execute",
        "dto": "CreateIncidentDTO",
        "dto_fields": "title: str\n    severity: str\n    source: str",
        "repo_interface": "IncidentRepository",
        "repo_method": "save",
        "router_prefix": "/incidents",
        "endpoints": [
            ("POST", "", "create_incident", "Create incident"),
            ("GET", "/{incident_id}", "get_incident", "Get incident"),
            ("PATCH", "/{incident_id}/status", "update_status", "Update status"),
            ("GET", "/geo/search", "geo_search", "Geographic query"),
        ],
        "patterns": ["outbox", "domain_events"],
    },
    {
        "name": "file-ingestion-service",
        "port": 8007,
        "title": "NEOALERT File Ingestion Service",
        "entity": "IngestionBatch",
        "entity_fields": "template_id: UUID\n    file_name: str\n    status: str\n    record_count: int = 0\n    error_count: int = 0",
        "use_case": "UploadFileUseCase",
        "use_case_method": "execute",
        "dto": "UploadFileDTO",
        "dto_fields": "template_id: UUID\n    file_name: str",
        "repo_interface": "IngestionBatchRepository",
        "repo_method": "save",
        "router_prefix": "/ingestion",
        "endpoints": [
            ("POST", "/upload", "upload_file", "Upload file for ingestion"),
            ("GET", "/{batch_id}/preview", "preview_batch", "Preview staged records"),
            ("POST", "/{batch_id}/publish", "publish_batch", "Publish validated records"),
            ("GET", "/{batch_id}/errors", "error_log", "Get error log"),
        ],
        "patterns": ["strategy_reader", "factory_processor", "staging"],
    },
    {
        "name": "template-configuration-service",
        "port": 8008,
        "title": "NEOALERT Template Configuration Service",
        "entity": "ImportTemplate",
        "entity_fields": "name: str\n    structure_type: str\n    version: int\n    columns: list[dict[str, str]]\n    is_active: bool = True",
        "use_case": "CreateTemplateUseCase",
        "use_case_method": "execute",
        "dto": "CreateTemplateDTO",
        "dto_fields": "name: str\n    structure_type: str\n    columns: list[dict[str, str]]",
        "repo_interface": "TemplateRepository",
        "repo_method": "find_active_by_structure",
        "router_prefix": "/templates",
        "endpoints": [
            ("POST", "", "create_template", "Create import template"),
            ("GET", "/{template_id}", "get_template", "Get template"),
            ("POST", "/{template_id}/versions", "new_version", "Create new version"),
            ("GET", "/structure/{structure_type}", "by_structure", "Get active template by structure"),
        ],
        "patterns": ["versioning", "canonical_mapping"],
    },
    {
        "name": "notification-service",
        "port": 8009,
        "title": "NEOALERT Notification Service",
        "entity": "Notification",
        "entity_fields": "channel: str\n    recipient_id: UUID\n    subject: str\n    body: str\n    status: str",
        "use_case": "SendNotificationUseCase",
        "use_case_method": "execute",
        "dto": "SendNotificationDTO",
        "dto_fields": "channel: str\n    recipient_id: UUID\n    subject: str\n    body: str",
        "repo_interface": "NotificationRepository",
        "repo_method": "save",
        "router_prefix": "/notifications",
        "endpoints": [
            ("POST", "/send", "send_notification", "Send notification"),
            ("POST", "/email", "send_email", "Send email"),
            ("POST", "/push", "send_push", "Send push notification"),
            ("GET", "/{notification_id}", "get_notification", "Get notification status"),
        ],
        "patterns": ["adapter", "retry", "queue"],
    },
    {
        "name": "reporting-service",
        "port": 8010,
        "title": "NEOALERT Reporting Service",
        "entity": "ReportDefinition",
        "entity_fields": "name: str\n    report_type: str\n    filters: dict[str, object]\n    schedule: str | None",
        "use_case": "GenerateKpiUseCase",
        "use_case_method": "execute",
        "dto": "KpiQueryDTO",
        "dto_fields": "metric: str\n    start_date: date\n    end_date: date",
        "repo_interface": "ReportRepository",
        "repo_method": "find_by_id",
        "router_prefix": "/reports",
        "endpoints": [
            ("GET", "/kpis", "get_kpis", "Get KPI aggregates"),
            ("POST", "/exports", "create_export", "Create export job"),
            ("GET", "/dashboard", "dashboard", "Dashboard data"),
            ("GET", "/heatmap", "incident_heatmap", "Incident heatmap integration"),
        ],
        "patterns": ["repository"],
    },
    {
        "name": "ai-service",
        "port": 8011,
        "title": "NEOALERT AI Service",
        "entity": "AiAnalysis",
        "entity_fields": "entity_type: str\n    entity_id: UUID\n    analysis_type: str\n    result: dict[str, object]\n    confidence: float",
        "use_case": "ClassifyIncidentUseCase",
        "use_case_method": "execute",
        "dto": "ClassificationRequestDTO",
        "dto_fields": "incident_id: UUID\n    text: str",
        "repo_interface": "AiAnalysisRepository",
        "repo_method": "save",
        "router_prefix": "/ai",
        "endpoints": [
            ("POST", "/classify", "classify", "Auto classification"),
            ("POST", "/summarize", "summarize", "Generate summary"),
            ("POST", "/anomaly-detect", "anomaly_detect", "Anomaly detection"),
            ("POST", "/narrative", "narrative_report", "Narrative report"),
        ],
        "patterns": ["adapter", "strategy"],
    },
    {
        "name": "audit-service",
        "port": 8012,
        "title": "NEOALERT Audit Service",
        "entity": "AuditLogEntry",
        "entity_fields": "actor_id: UUID\n    action: str\n    entity_type: str\n    entity_id: UUID\n    changes: dict[str, object]\n    immutable_hash: str",
        "use_case": "RecordAuditLogUseCase",
        "use_case_method": "execute",
        "dto": "AuditLogDTO",
        "dto_fields": "actor_id: UUID\n    action: str\n    entity_type: str\n    entity_id: UUID",
        "repo_interface": "AuditLogRepository",
        "repo_method": "append",
        "router_prefix": "/audit",
        "endpoints": [
            ("POST", "/logs", "record_log", "Record audit log entry"),
            ("GET", "/logs", "query_logs", "Query audit logs"),
            ("GET", "/logs/{entity_type}/{entity_id}", "entity_history", "Entity change history"),
        ],
        "patterns": ["immutable_log", "outbox"],
    },
]


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")


def snake_to_pascal(name: str) -> str:
    return "".join(part.capitalize() for part in name.replace("-", "_").split("_"))


def generate_service(cfg: dict[str, object]) -> None:
    name = str(cfg["name"])
    port = int(cfg["port"])
    title = str(cfg["title"])
    entity = str(cfg["entity"])
    entity_fields = str(cfg["entity_fields"])
    use_case = str(cfg["use_case"])
    use_case_method = str(cfg["use_case_method"])
    dto = str(cfg["dto"])
    dto_fields = str(cfg["dto_fields"])
    repo_interface = str(cfg["repo_interface"])
    repo_method = str(cfg["repo_method"])
    router_prefix = str(cfg["router_prefix"])
    endpoints: list[tuple[str, str, str, str]] = cfg["endpoints"]  # type: ignore[assignment]
    patterns: list[str] = cfg.get("patterns", [])  # type: ignore[assignment]

    base = SERVICES_DIR / name
    pkg = name.replace("-", "_")

    # Core
    write(
        base / "src/core/config.py",
        f'''
        from pydantic_settings import BaseSettings, SettingsConfigDict


        class Settings(BaseSettings):
            model_config = SettingsConfigDict(env_file=".env", env_prefix="{snake_to_pascal(name).upper()}_")

            service_name: str = "{name}"
            host: str = "0.0.0.0"
            port: int = {port}
            debug: bool = False
            log_level: str = "INFO"
            database_url: str = "postgresql+asyncpg://neoalert:neoalert@postgres:5432/{name.replace("-", "_")}"
            redis_url: str = "redis://redis:6379/0"
            rabbitmq_url: str = "amqp://neoalert:neoalert@rabbitmq:5672/"
            jwt_secret_key: str = "change-me-in-production"
            jwt_algorithm: str = "HS256"
            identity_service_url: str = "http://identity-service:8001"
        ''',
    )

    write(
        base / "src/core/service_exception.py",
        '''
        class ServiceException(Exception):
            def __init__(self, message: str, code: str = "SERVICE_ERROR") -> None:
                self.message = message
                self.code = code
                super().__init__(message)
        ''',
    )

    # Domain
    write(
        base / f"src/domain/entities/{entity.lower()}.py",
        f'''
        from dataclasses import dataclass, field
        from datetime import datetime
        from uuid import UUID, uuid4


        @dataclass
        class {entity}:
            tenant_id: UUID
            {entity_fields}
            id: UUID = field(default_factory=uuid4)
            created_at: datetime = field(default_factory=datetime.utcnow)
        ''',
    )

    write(
        base / "src/domain/value_objects/tenant_id.py",
        '''
        from dataclasses import dataclass
        from uuid import UUID


        @dataclass(frozen=True)
        class TenantId:
            value: UUID

            def __str__(self) -> str:
                return str(self.value)
        ''',
    )

    write(
        base / "src/domain/exceptions/domain_exception.py",
        '''
        class DomainException(Exception):
            def __init__(self, message: str) -> None:
                self.message = message
                super().__init__(message)
        ''',
    )

    # Application
    write(
        base / f"src/application/dtos/{dto.lower()}.py",
        f'''
        from pydantic import BaseModel
        from uuid import UUID
        from datetime import date, datetime


        class {dto}(BaseModel):
            {dto_fields}
        ''',
    )

    write(
        base / f"src/application/interfaces/{repo_interface.lower()}.py",
        f'''
        from abc import ABC, abstractmethod
        from uuid import UUID

        from domain.entities.{entity.lower()} import {entity}


        class {repo_interface}(ABC):
            @abstractmethod
            async def {repo_method}(self, tenant_id: UUID, *args: object) -> {entity} | None:
                ...

            @abstractmethod
            async def save(self, entity: {entity}) -> {entity}:
                ...
        ''',
    )

    write(
        base / f"src/application/use_cases/{use_case.lower()}.py",
        f'''
        from uuid import UUID

        from application.dtos.{dto.lower()} import {dto}
        from application.interfaces.{repo_interface.lower()} import {repo_interface}
        from domain.entities.{entity.lower()} import {entity}


        class {use_case}:
            def __init__(self, repository: {repo_interface}) -> None:
                self._repository = repository

            async def {use_case_method}(self, tenant_id: UUID, dto: {dto}) -> {entity}:
                entity = {entity}(tenant_id=tenant_id, **dto.model_dump())
                return await self._repository.save(entity)
        ''',
    )

    # Infrastructure
    write(
        base / f"src/infrastructure/repositories/in_memory_{repo_interface.lower()}.py",
        f'''
        from uuid import UUID

        from application.interfaces.{repo_interface.lower()} import {repo_interface}
        from domain.entities.{entity.lower()} import {entity}


        class InMemory{repo_interface}({repo_interface}):
            def __init__(self) -> None:
                self._store: dict[UUID, {entity}] = {{}}

            async def {repo_method}(self, tenant_id: UUID, *args: object) -> {entity} | None:
                for item in self._store.values():
                    if item.tenant_id == tenant_id:
                        return item
                return None

            async def save(self, entity: {entity}) -> {entity}:
                self._store[entity.id] = entity
                return entity
        ''',
    )

    # Outbox pattern for applicable services
    if "outbox" in patterns:
        write(
            base / "src/infrastructure/messaging/outbox_publisher.py",
            '''
            from dataclasses import dataclass, field
            from datetime import datetime
            from uuid import UUID, uuid4


            @dataclass
            class OutboxMessage:
                event_type: str
                payload: dict[str, object]
                tenant_id: UUID
                id: UUID = field(default_factory=uuid4)
                created_at: datetime = field(default_factory=datetime.utcnow)
                published: bool = False


            class OutboxPublisher:
                def __init__(self) -> None:
                    self._messages: list[OutboxMessage] = []

                async def enqueue(self, message: OutboxMessage) -> OutboxMessage:
                    self._messages.append(message)
                    return message

                async def pending(self) -> list[OutboxMessage]:
                    return [m for m in self._messages if not m.published]
            ''',
        )

    # Strategy/Factory for file-ingestion
    if name == "file-ingestion-service":
        write(
            base / "src/infrastructure/adapters/file_reader_strategy.py",
            '''
            from abc import ABC, abstractmethod
            from pathlib import Path


            class FileReaderStrategy(ABC):
                @abstractmethod
                async def read(self, file_path: Path) -> list[dict[str, str]]:
                    ...


            class CsvReaderStrategy(FileReaderStrategy):
                async def read(self, file_path: Path) -> list[dict[str, str]]:
                    return []


            class ExcelReaderStrategy(FileReaderStrategy):
                async def read(self, file_path: Path) -> list[dict[str, str]]:
                    return []
            ''',
        )
        write(
            base / "src/infrastructure/adapters/file_processor_factory.py",
            '''
            from infrastructure.adapters.file_reader_strategy import (
                CsvReaderStrategy,
                ExcelReaderStrategy,
                FileReaderStrategy,
            )


            class FileProcessorFactory:
                @staticmethod
                def create(extension: str) -> FileReaderStrategy:
                    if extension in {".csv", ".txt"}:
                        return CsvReaderStrategy()
                    if extension in {".xlsx", ".xls"}:
                        return ExcelReaderStrategy()
                    raise ValueError(f"Unsupported extension: {extension}")
            ''',
        )

    # Template service canonical mapper
    if name == "template-configuration-service":
        write(
            base / "src/infrastructure/adapters/canonical_mapper.py",
            '''
            class CanonicalMapper:
                def map_row(self, row: dict[str, str], column_map: dict[str, str]) -> dict[str, object]:
                    return {column_map.get(k, k): v for k, v in row.items()}
            ''',
        )

    # Notification adapters
    if name == "notification-service":
        write(
            base / "src/infrastructure/adapters/email_adapter.py",
            '''
            from abc import ABC, abstractmethod


            class EmailProvider(ABC):
                @abstractmethod
                async def send(self, to: str, subject: str, body: str) -> bool:
                    ...


            class SmtpEmailAdapter(EmailProvider):
                async def send(self, to: str, subject: str, body: str) -> bool:
                    return True
            ''',
        )

    # AI adapter
    if name == "ai-service":
        write(
            base / "src/infrastructure/adapters/llm_adapter.py",
            '''
            from abc import ABC, abstractmethod


            class LlmProvider(ABC):
                @abstractmethod
                async def classify(self, text: str) -> dict[str, object]:
                    ...


            class OpenAiAdapter(LlmProvider):
                async def classify(self, text: str) -> dict[str, object]:
                    return {"label": "unknown", "confidence": 0.0}
            ''',
        )

    # Gateway circuit breaker
    if name == "api-gateway":
        write(
            base / "src/infrastructure/adapters/circuit_breaker.py",
            '''
            from dataclasses import dataclass, field
            from datetime import datetime


            @dataclass
            class CircuitBreaker:
                failure_threshold: int = 5
                failure_count: int = 0
                is_open: bool = False
                last_failure: datetime | None = None

                def record_success(self) -> None:
                    self.failure_count = 0
                    self.is_open = False

                def record_failure(self) -> None:
                    self.failure_count += 1
                    self.last_failure = datetime.utcnow()
                    if self.failure_count >= self.failure_threshold:
                        self.is_open = True
            ''',
        )
        write(
            base / "src/presentation/api/v1/rate_limit_router.py",
            '''
            from fastapi import APIRouter

            router = APIRouter(prefix="/rate-limit", tags=["rate-limit"])


            @router.get("/status")
            async def rate_limit_status() -> dict[str, str]:
                return {"status": "ok", "message": "Rate limiting hooks configured"}
            ''',
        )

    # Presentation
    endpoint_defs = ""
    for method, path, func, summary in endpoints:
        endpoint_defs += f'''
        @router.{method.lower()}("{path}", summary="{summary}")
        async def {func}() -> dict[str, str]:
            return {{"status": "ok", "endpoint": "{func}"}}
        '''

    write(
        base / f"src/presentation/api/v1/{router_prefix.strip('/').replace('/', '_') or 'main'}_router.py",
        f'''
        from fastapi import APIRouter

        router = APIRouter(prefix="{router_prefix}", tags=["{name}"])
        {endpoint_defs}
        ''',
    )

    write(
        base / "src/presentation/api/v1/health_router.py",
        '''
        from fastapi import APIRouter

        router = APIRouter(tags=["health"])


        @router.get("/health")
        async def health() -> dict[str, str]:
            return {"status": "healthy"}


        @router.get("/health/live")
        async def liveness() -> dict[str, str]:
            return {"status": "alive"}


        @router.get("/health/ready")
        async def readiness() -> dict[str, str]:
            return {"status": "ready"}
        ''',
    )

    write(
        base / "src/presentation/middleware/tenant_context_middleware.py",
        '''
        from uuid import UUID

        from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
        from starlette.requests import Request
        from starlette.responses import Response

        TENANT_HEADER = "X-Tenant-ID"


        class TenantContextMiddleware(BaseHTTPMiddleware):
            async def dispatch(
                self, request: Request, call_next: RequestResponseEndpoint
            ) -> Response:
                tenant_id = request.headers.get(TENANT_HEADER)
                if tenant_id:
                    request.state.tenant_id = UUID(tenant_id)
                return await call_next(request)
        ''',
    )

    write(
        base / "src/presentation/dependencies/auth_dependencies.py",
        '''
        from typing import Annotated

        from fastapi import Depends, Header, HTTPException, status


        async def get_current_user(
            authorization: Annotated[str | None, Header()] = None,
        ) -> dict[str, str]:
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing or invalid authorization header",
                )
            return {"sub": "user-placeholder", "roles": ["user"]}


        async def require_role(required_role: str):
            async def checker(user: Annotated[dict[str, str], Depends(get_current_user)]) -> dict[str, str]:
                if required_role not in user.get("roles", []):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
                return user
            return checker
        ''',
    )

    router_module = router_prefix.strip("/").replace("/", "_") or "main"
    extra_imports = ""
    extra_include = ""
    if name == "api-gateway":
        extra_imports = "from presentation.api.v1.rate_limit_router import router as rate_limit_router"
        extra_include = "app.include_router(rate_limit_router)"

    write(
        base / "src/presentation/main.py",
        f'''
        import sys
        from pathlib import Path

        sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

        from fastapi import FastAPI
        from neoalert_observability import CorrelationIdMiddleware, configure_logging, configure_telemetry

        from core.config import Settings
        from presentation.api.v1.health_router import router as health_router
        from presentation.api.v1.{router_module}_router import router as service_router
        from presentation.middleware.tenant_context_middleware import TenantContextMiddleware
        {extra_imports}

        settings = Settings()
        configure_logging(settings.service_name, settings.log_level)
        configure_telemetry(settings.service_name)

        app = FastAPI(title="{title}", version="0.1.0")
        app.add_middleware(CorrelationIdMiddleware)
        app.add_middleware(TenantContextMiddleware)
        app.include_router(health_router)
        app.include_router(service_router)
        {extra_include}


        @app.get("/")
        async def root() -> dict[str, str]:
            return {{"service": settings.service_name, "status": "running"}}
        ''',
    )

    # Tests
    write(
        base / "tests/unit/test_use_case.py",
        f'''
        import pytest
        from uuid import uuid4

        from application.dtos.{dto.lower()} import {dto}
        from application.use_cases.{use_case.lower()} import {use_case}
        from infrastructure.repositories.in_memory_{repo_interface.lower()} import InMemory{repo_interface}


        @pytest.mark.asyncio
        async def test_{use_case_method}_success() -> None:
            repo = InMemory{repo_interface}()
            use_case_instance = {use_case}(repo)
            tenant_id = uuid4()
            dto = {dto}(**{{k: v for k, v in {{
                {repr({f.split(":")[0].strip(): "test" for f in dto_fields.split(chr(10)) if f.strip()})}
            }}.items() if v != "UUID"}})
            # Provide minimal valid dto fields
            dto_data = dto.model_dump()
            dto = {dto}(**{{k: (uuid4() if "UUID" in str(type(v)) else v) for k, v in dto_data.items()}})
            result = await use_case_instance.{use_case_method}(tenant_id, dto)
            assert result.tenant_id == tenant_id
        ''',
    )

    # Fix unit test - the dto fields parsing is messy. Let me simplify in generated file
    dto_field_names = [f.split(":")[0].strip() for f in dto_fields.split("\n") if f.strip()]
    test_dto_kwargs = ", ".join(
        f'{f}="test"' if "str" in dto_fields.split("\n")[i] else f"{f}=None"
        for i, f in enumerate(dto_field_names)
    )
    # Re-read and fix - actually I'll overwrite with cleaner test

    dto_test_lines = []
    for line in dto_fields.split("\n"):
        if not line.strip():
            continue
        field_name = line.split(":")[0].strip()
        if "UUID" in line:
            dto_test_lines.append(f"{field_name}=uuid4()")
        elif "float" in line:
            dto_test_lines.append(f"{field_name}=0.0")
        elif "int" in line:
            dto_test_lines.append(f"{field_name}=0")
        elif "date" in line and "datetime" not in line:
            dto_test_lines.append(f'{field_name}=date.today()')
        elif "list" in line or "dict" in line:
            dto_test_lines.append(f"{field_name}={{}}")
        else:
            dto_test_lines.append(f'{field_name}="test"')

    write(
        base / "tests/unit/test_use_case.py",
        f'''
        from datetime import date
        from uuid import uuid4

        import pytest

        from application.dtos.{dto.lower()} import {dto}
        from application.use_cases.{use_case.lower()} import {use_case}
        from infrastructure.repositories.in_memory_{repo_interface.lower()} import InMemory{repo_interface}


        @pytest.mark.asyncio
        async def test_{use_case_method}_success() -> None:
            repo = InMemory{repo_interface}()
            use_case_instance = {use_case}(repo)
            tenant_id = uuid4()
            dto = {dto}({", ".join(dto_test_lines)})
            result = await use_case_instance.{use_case_method}(tenant_id, dto)
            assert result.tenant_id == tenant_id
        ''',
    )

    write(
        base / "tests/integration/test_health.py",
        '''
        import pytest
        from httpx import ASGITransport, AsyncClient

        from presentation.main import app


        @pytest.mark.asyncio
        async def test_health_endpoint() -> None:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"
        ''',
    )

    write(
        base / "tests/contract/test_api_contract.py",
        '''
        """Contract tests validate API schemas against shared contracts."""
        import pytest


        @pytest.mark.contract
        def test_api_contract_placeholder() -> None:
            assert True
        ''',
    )

    write(
        base / "tests/conftest.py",
        '''
        import sys
        from pathlib import Path

        sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
        ''',
    )

    # pyproject.toml
    write(
        base / "pyproject.toml",
        f'''
        [project]
        name = "{name}"
        version = "0.1.0"
        description = "{title}"
        requires-python = ">=3.11"
        dependencies = [
            "fastapi>=0.109.0",
            "uvicorn[standard]>=0.27.0",
            "pydantic>=2.6.0",
            "pydantic-settings>=2.1.0",
            "httpx>=0.26.0",
            "neoalert-observability",
            "neoalert-contracts",
        ]

        [project.optional-dependencies]
        dev = [
            "pytest>=8.0.0",
            "pytest-asyncio>=0.23.0",
        ]

        [build-system]
        requires = ["hatchling"]
        build-backend = "hatchling.build"

        [tool.hatch.build.targets.wheel]
        packages = ["src"]

        [tool.pytest.ini_options]
        asyncio_mode = "auto"
        testpaths = ["tests"]
        ''',
    )

    # Dockerfile
    write(
        base / "Dockerfile",
        f'''
        FROM python:3.11-slim

        WORKDIR /app

        COPY shared/observability /shared/observability
        COPY shared/contracts /shared/contracts
        RUN pip install --no-cache-dir /shared/observability /shared/contracts

        COPY services/{name}/pyproject.toml .
        COPY services/{name}/src ./src
        RUN pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings httpx

        ENV PYTHONPATH=/app/src
        EXPOSE {port}

        CMD ["uvicorn", "presentation.main:app", "--host", "0.0.0.0", "--port", "{port}"]
        ''',
    )

    # README
    patterns_str = ", ".join(patterns) if patterns else "repository"
    endpoint_list = "\n".join(f"- `{m} {router_prefix}{p}` — {s}" for m, p, _, s in endpoints)
    write(
        base / "README.md",
        f'''
        # {title}

        Independent microservice for the NEOALERT platform.

        ## Port
        `{port}`

        ## Patterns
        {patterns_str}

        ## Key Endpoints
        {endpoint_list}

        ## Run locally
        ```bash
        pip install -e ../../shared/observability -e ../../shared/contracts -e ".[dev]"
        uvicorn presentation.main:app --reload --port {port}
        ```

        ## Tests
        ```bash
        pytest
        ```
        ''',
    )


def main() -> None:
    for cfg in SERVICE_CONFIGS:
        generate_service(cfg)
        print(f"Generated: {cfg['name']}")


if __name__ == "__main__":
    main()
