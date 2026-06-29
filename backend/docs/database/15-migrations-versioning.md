# 15 — Migraciones y versionado

## Enfoque dual

| Capa | Herramienta | Ubicación |
|------|-------------|-----------|
| Bootstrap infra | SQL scripts ordenados | `infrastructure/database/init/` |
| Evolución por servicio | Alembic + SQLAlchemy 2 | `services/{svc}/alembic/` (roadmap) |
| Referencia DDL | Flyway-style naming | `infrastructure/database/schemas/{svc}/V00N__*.sql` |

## Bootstrap (Docker first run)

Orden de ejecución en `/docker-entrypoint-initdb.d/`:

1. `01-create-databases.sql` — 13 bases lógicas
2. `02-extensions.sql` — postgis, uuid-ossp, pgcrypto
3. `03-apply-schemas.sh` — aplica todas las migraciones `V*.sql` por servicio (V001, V002, …)

**Importante:** scripts init solo corren con volumen vacío. Para reset:

```powershell
docker compose down -v
docker compose up -d postgres
```

## Versionado V001, V002, ...

Cada cambio schema incrementa versión:

```
infrastructure/database/schemas/incident-service/
├── V001__initial_schema.sql
├── V002__add_incident_tags.sql
└── V003__incident_tags_index.sql
```

`03-apply-schemas.sh` aplica todas las migraciones versionadas en bootstrap. Para volúmenes existentes, usa `scripts/init-db.ps1` o Alembic por servicio.

## Alembic por servicio (implementación Python)

Estructura recomendada:

```
services/incident-service/
├── alembic.ini
├── alembic/
│   ├── env.py          # async engine, DATABASE_URL from settings
│   └── versions/
│       └── 001_initial.py
└── src/infrastructure/persistence/models/
```

Reglas:
- Una cadena Alembic **independiente** por servicio.
- Nunca migrar base de otro servicio.
- Migraciones backward-compatible cuando hay deploy rolling.

## CI/CD pipeline

```yaml
migrate:
  matrix:
    service: [identity-service, tenant-service, ...]
  steps:
    - alembic upgrade head  # against staging DB
    - pytest integration    # smoke tests
```

## Compatibilidad expand-contract

Para cambios breaking:

1. **Expand** — add column/table nullable.
2. **Deploy** — código lee/escribe nuevo campo.
3. **Contract** — backfill + NOT NULL + drop old.

Ejemplo: renombrar `event_type` → requiere columna nueva + sync + deprecación.

## Rollback

- Alembic: `alembic downgrade -1` en staging antes de prod.
- Producción: preferir forward-fix; downgrade solo si no hay data loss.
- audit_events nunca se downgradea con DELETE — solo forward migrations.

## Seeds vs migraciones

| Tipo | Cuándo |
|------|--------|
| Seed | Datos demo (Structure A/B templates) — manual o job post-init |
| Migration | Cambio estructural — versionado obligatorio |

Seeds en `infrastructure/database/seeds/` no se ejecutan automáticamente en Docker.

## Checklist pre-deploy

- [ ] Migración probada en DB clone con volumen producción anonymizado
- [ ] Tiempo de ejecución < maintenance window (o CONCURRENTLY para índices)
- [ ] RLS policies recreadas si nueva tabla tenant-scoped
- [ ] Documentación `05-core-tables.md` actualizada si cambio visible
