# 04 - Estructura de Carpetas por Servicio

Cada microservicio sigue la misma estructura hexagonal:

```
services/<service-name>/
├── src/
│   ├── presentation/
│   │   ├── api/v1/              # Routers (un archivo por router)
│   │   ├── middleware/          # Tenant context, etc.
│   │   ├── dependencies/        # Auth, RBAC hooks
│   │   └── main.py              # FastAPI app factory
│   ├── application/
│   │   ├── use_cases/           # Un use case por archivo
│   │   ├── dtos/                # Pydantic DTOs (input/output)
│   │   └── interfaces/          # Repository ports (ABC)
│   ├── domain/
│   │   ├── entities/            # Entidades de dominio
│   │   ├── value_objects/       # Value objects inmutables
│   │   └── exceptions/          # Excepciones de dominio
│   ├── infrastructure/
│   │   ├── repositories/        # Implementaciones de repos
│   │   ├── adapters/              # Proveedores externos
│   │   └── messaging/           # Outbox, event publishers
│   └── core/
│       ├── config.py            # Settings (pydantic-settings)
│       └── service_exception.py
├── tests/
│   ├── unit/                    # Use cases, domain logic
│   ├── integration/             # HTTP endpoints
│   └── contract/                # Schema validation vs contracts
├── pyproject.toml
├── Dockerfile
└── README.md
```

## Reglas de Organización

1. **Una clase por archivo** — `login_use_case.py` contiene solo `LoginUseCase`
2. **Routers delgados** — delegan inmediatamente al use case
3. **Domain no importa infrastructure** — dependencia invertida via interfaces
4. **DTOs ≠ Entities** — mapeo explícito en use cases
5. **Tests espejan capas** — unit (application/domain), integration (presentation), contract (shared/contracts)

## Servicios con Adaptadores Adicionales

| Servicio | infrastructure/adapters/ |
|----------|-------------------------|
| api-gateway | circuit_breaker.py |
| file-ingestion-service | file_reader_strategy.py, file_processor_factory.py |
| template-configuration-service | canonical_mapper.py |
| notification-service | email_adapter.py |
| ai-service | llm_adapter.py |

## Servicios con Outbox

| Servicio | infrastructure/messaging/ |
|----------|------------------------|
| attendance-service | outbox_publisher.py |
| incident-service | outbox_publisher.py |
| audit-service | outbox_publisher.py |
