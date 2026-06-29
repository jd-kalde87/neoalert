# NEOALERT Backend

Enterprise omnichannel backend platform built with FastAPI and a real microservices architecture.

## Structure

```
backend/
├── docs/architecture/     # Architecture documentation (15 deliverables)
├── shared/
│   ├── contracts/         # Event schemas and API contracts
│   └── observability/     # Correlation ID, structured logging
├── services/              # 13 independent microservices
└── docker-compose.yml     # Local development stack
```

## Quick Start

See **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** for the full Windows setup guide (venv, Docker, running services, and tests).

**Infrastructure only** (local dev with uvicorn on the host):

```powershell
docker compose up -d postgres redis rabbitmq
```

**All 13 microservices in Docker:**

```powershell
docker compose up -d --build
```

**All 13 microservices locally with hot reload** (venv + infra in Docker):

```powershell
.\scripts\start-all.ps1
```

Verify health: `.\scripts\check-health.ps1` or `curl http://localhost:8001/health`

Each service exposes `/health`, `/health/live`, and `/health/ready`.

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/GETTING_STARTED.md) | Install, run, and test the backend locally |
| [Architecture](docs/architecture/README.md) | Microservices design and patterns |
| [Database](docs/database/README.md) | Persistence strategy, schemas, and multi-tenant model |

## Services

| Service | Port | Responsibility |
|---------|------|----------------|
| api-gateway | 8000 | Routing, rate limiting, auth passthrough |
| identity-service | 8001 | Authentication, MFA, sessions, RBAC |
| tenant-service | 8002 | Multi-tenant config, branding, residency |
| employee-service | 8003 | Employees, crews, assignments |
| attendance-service | 8004 | Check-in/out, geofences, approvals |
| location-service | 8005 | Traces, geofences, geographic events |
| incident-service | 8006 | Incidents, evidence, territorial events |
| file-ingestion-service | 8007 | Metadata-driven file import |
| template-configuration-service | 8008 | Template versioning, canonical mapping |
| notification-service | 8009 | Push, email, internal notifications |
| reporting-service | 8010 | KPIs, exports, analytics |
| ai-service | 8011 | Classification, summaries, anomalies |
| audit-service | 8012 | Immutable audit trail |

## Development

```bash
cd services/identity-service
pip install -e ".[dev]"
pytest
```
