# 01 - Arquitectura General NEOALERT

## Visión

NEOALERT es una plataforma backend omnicanal empresarial construida como **microservicios reales** (no monolito disfrazado). Cada servicio tiene su propio ciclo de vida, base de datos lógica, contenedor Docker y despliegue independiente.

## Principios Arquitectónicos

| Principio | Implementación |
|-----------|----------------|
| Clean/Hexagonal Architecture | Capas `presentation → application → domain ← infrastructure` por servicio |
| Domain-Driven Design | Entidades, value objects, eventos de dominio, excepciones de dominio |
| SOLID | Una clase por archivo, interfaces (ports) en application, adapters en infrastructure |
| Multi-tenant | `tenant_id` en entidades, header `X-Tenant-ID`, aislamiento por tenant |
| Event-Driven | RabbitMQ para eventos asíncronos, Outbox Pattern en operaciones críticas |
| API-First | Contratos compartidos en `shared/contracts/` |
| Observabilidad | Correlation ID, structured logging, OpenTelemetry hooks |
| Cloud-ready | Contenedores stateless, escalado horizontal, health/readiness probes |

## Stack Tecnológico

- **Runtime**: Python 3.11+, FastAPI, Uvicorn
- **Validación/Tipado**: Pydantic v2, mypy strict
- **Persistencia**: PostgreSQL (una DB lógica por servicio)
- **Cache/Rate limiting**: Redis
- **Mensajería**: RabbitMQ
- **Contenedores**: Docker, docker-compose (dev)
- **Calidad**: ruff, black, isort, pytest

## Capas por Microservicio

```
presentation/     → Routers delgados, middleware, dependencies (sin lógica de negocio)
application/      → Use cases, DTOs, interfaces (ports)
domain/           → Entidades, value objects, excepciones, eventos
infrastructure/   → Repositories, adapters, messaging, persistence
core/             → Config, excepciones transversales
```

## Flujo de Petición Típico

1. Cliente → **API Gateway** (rate limit, routing)
2. Gateway valida JWT vía **Identity Service** (o token cacheado)
3. Gateway propaga `Authorization`, `X-Tenant-ID`, `X-Correlation-ID`
4. Microservicio destino ejecuta use case → repository
5. Eventos críticos → Outbox → RabbitMQ → consumidores (Notification, Audit, Reporting)
6. **Audit Service** registra acción inmutable

## Estructura del Monorepo

```
backend/
├── docs/architecture/          # 15 documentos de arquitectura
├── shared/
│   ├── contracts/              # Event schemas, API contracts, Structure A/B
│   └── observability/          # Correlation ID, logging, telemetry
├── services/                   # 13 microservicios independientes
├── infrastructure/             # Scripts de infra (PostgreSQL init)
├── docker-compose.yml
└── pyproject.toml              # Config root: ruff, black, isort, mypy
```

## Decisiones Clave

1. **Sin lógica de negocio compartida** — solo contratos y observabilidad en `shared/`
2. **Bases de datos separadas** — cada servicio posee su schema/DB
3. **Comunicación síncrona** para consultas; **asíncrona** para side-effects
4. **Importación metadata-driven** — Template Configuration + File Ingestion desacoplados
5. **Canonical model** — Structure A/B mapean a `CanonicalIncidentRecord`
