# 15 - Ejemplos de Skeleton de Microservicio

## Ejemplo: identity-service

### Entity (domain/entities/user.py)
```python
@dataclass
class User:
    tenant_id: UUID
    email: str
    hashed_password: str
    roles: list[str]
    mfa_enabled: bool = False
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
```

### Repository Port (application/interfaces/userrepository.py)
```python
class UserRepository(ABC):
    @abstractmethod
    async def find_by_email(self, tenant_id: UUID, *args) -> User | None: ...

    @abstractmethod
    async def save(self, entity: User) -> User: ...
```

### Use Case (application/use_cases/loginusecase.py)
```python
class LoginUseCase:
    def __init__(self, repository: UserRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: LoginDTO) -> User:
        entity = User(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
```

### Router (presentation/api/v1/auth_router.py)
```python
router = APIRouter(prefix="/auth", tags=["identity-service"])

@router.post("/login", summary="Authenticate user")
async def login() -> dict[str, str]:
    return {"status": "ok", "endpoint": "login"}
```

### Main App (presentation/main.py)
```python
app = FastAPI(title="NEOALERT Identity Service")
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(TenantContextMiddleware)
app.include_router(health_router)
app.include_router(service_router)
```

## Ejemplo: file-ingestion-service (Patterns)

### Strategy Pattern — FileReaderStrategy
```python
class FileReaderStrategy(ABC):
    @abstractmethod
    async def read(self, file_path: Path) -> list[dict[str, str]]: ...

class CsvReaderStrategy(FileReaderStrategy): ...
class ExcelReaderStrategy(FileReaderStrategy): ...
```

### Factory Pattern — FileProcessorFactory
```python
class FileProcessorFactory:
    @staticmethod
    def create(extension: str) -> FileReaderStrategy:
        if extension in {".csv", ".txt"}: return CsvReaderStrategy()
        if extension in {".xlsx", ".xls"}: return ExcelReaderStrategy()
        raise ValueError(f"Unsupported extension: {extension}")
```

## Ejemplo: api-gateway (Circuit Breaker)

```python
@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    failure_count: int = 0
    is_open: bool = False

    def record_failure(self) -> None:
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.is_open = True
```

## Ejemplo: Outbox Pattern (incident-service)

```python
@dataclass
class OutboxMessage:
    event_type: str
    payload: dict[str, object]
    tenant_id: UUID
    published: bool = False

class OutboxPublisher:
    async def enqueue(self, message: OutboxMessage) -> OutboxMessage: ...
    async def pending(self) -> list[OutboxMessage]: ...
```

## Ejemplo: Test Unitario

```python
@pytest.mark.asyncio
async def test_execute_success() -> None:
    repo = InMemoryUserRepository()
    use_case = LoginUseCase(repo)
    tenant_id = uuid4()
    dto = LoginDTO(email="test@example.com", password="secret123")
    result = await use_case.execute(tenant_id, dto)
    assert result.tenant_id == tenant_id
```

## Cómo Extender un Skeleton

1. Implementar repository PostgreSQL en `infrastructure/repositories/`
2. Conectar use case al router via dependency injection
3. Agregar validación de dominio en use case (no en router)
4. Publicar eventos via OutboxPublisher post-commit
5. Agregar tests para cada capa nueva

## Referencia de Archivos Generados

Ver servicios en `services/` — cada uno contiene un skeleton funcional con:
- FastAPI app arrancable
- Health endpoints
- 1 entity, 1 use case, 1 repository interface + in-memory impl
- Middleware tenant + auth hooks
- Observability integrada
