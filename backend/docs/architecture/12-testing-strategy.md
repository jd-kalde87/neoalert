# 12 - Estrategia de Testing

## Pirámide de Tests

```
        ┌─────────────┐
        │  Contract   │  ← Schemas vs shared/contracts
       ┌┴─────────────┴┐
       │  Integration  │  ← HTTP endpoints (httpx + ASGI)
      ┌┴───────────────┴┐
      │      Unit        │  ← Use cases, domain, mappers
      └──────────────────┘
```

## Por Servicio

```
tests/
├── unit/           # test_use_case.py — use cases con repos in-memory
├── integration/    # test_health.py — endpoints via AsyncClient
└── contract/       # test_api_contract.py — validación de schemas
```

## Unit Tests

- Use cases con `InMemory*Repository`
- Sin dependencias externas (DB, Redis, MQ)
- Rápidos, aislados, determinísticos

Ejemplo: `tests/unit/test_use_case.py`

## Integration Tests

- `httpx.AsyncClient` con `ASGITransport`
- Testean routers + middleware + app factory
- DB: testcontainers PostgreSQL (roadmap)

Ejemplo: `tests/integration/test_health.py`

## Contract Tests

- Validan que responses cumplen schemas de `shared/contracts`
- Evolucionan con versionado de contratos
- Marker pytest: `@pytest.mark.contract`

## Configuración Root

`pyproject.toml`:
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["services"]
```

## CI Pipeline (recomendado)

```yaml
steps:
  - lint: ruff, black --check, isort --check, mypy
  - test: pytest services/*/tests/unit services/*/tests/integration
  - contract: pytest -m contract
  - build: docker build per service
```

## Cobertura Objetivo

| Capa | Target |
|------|--------|
| Use cases | 80%+ |
| Domain entities/VOs | 90%+ |
| Routers | Integration tests key paths |
| Adapters | Mock external providers |

## Test Data

- Factories para entidades (futuro: `tests/factories/`)
- Tenant ID fijo en tests: `uuid4()` generado por test
- No usar datos de producción
