# 14 — Convenciones de nombres

## Bases de datos

- snake_case, singular descriptivo + sufijo `_service` excepto `api_gateway`.
- Alineado al nombre del microservicio: `identity-service` → `identity_service`.

## Tablas

| Regla | Ejemplo |
|-------|---------|
| snake_case plural | `employees`, `attendance_records` |
| Sin prefijo de servicio | `incidents` (no `inc_incidents`) |
| Junction tables | `{a}_{b}` o `{entity}_{role}` | `user_roles`, `crew_members` |
| Historial | `{entity}_status_history` | `incident_status_history` |
| Staging | `staging_rows`, `staging_row_errors` |
| Read models | `{domain}_read_models` | `heatmap_read_models` |

## Columnas

| Tipo | Convención |
|------|------------|
| PK | `id` UUID |
| FK lógico cross-service | `{entity}_id` | `employee_id`, `tenant_id` |
| Timestamps | `{action}_at` | `created_at`, `published_at` |
| Booleanos | `is_{adj}` / `has_{noun}` | `is_active`, `mfa_enabled` |
| JSON flexible | `metadata`, `extra_fields`, `{purpose}_json` |
| Geometría | `location`, `boundary`, `center`, `area` |
| Hash | `{thing}_hash` | `password_hash`, `token_hash` |
| Enumeraciones | VARCHAR + CHECK constraint (no ENUM PG en fase 1) |

## Índices

```
idx_{table}_{columns}           -- B-tree
idx_{table}_{column}_gist       -- GIST espacial
uq_{table}_{columns}            -- UNIQUE constraint name
```

Ejemplos:
- `idx_incidents_tenant_date`
- `idx_traces_location_gist`
- `uq_employees_tenant_code`

## Migraciones SQL

Flyway-style en infra:

```
V001__initial_schema.sql
V002__add_incident_tags.sql
```

Alembic en código Python (por servicio):

```
alembic/versions/20260628_001_initial.py
```

## Eventos RabbitMQ

```
{domain}.{action}   -- incident.created, attendance.recorded
```

## Redis keys

```
{tenant_id}:{namespace}:{key}
```

Ejemplo: `550e8400-...:session:user:abc123`

## Object storage keys

```
{tenant_id}/{domain}/{yyyy}/{mm}/{uuid}/{filename}
```

Ejemplo: `{tid}/evidence/2026/06/{uuid}/foto.jpg`

## Código Python (referencia)

- Entidades: PascalCase (`Employee`, `IngestionBatch`)
- Repos: `{Entity}Repository`
- Tablas SQL no necesitan mapeo 1:1 a nombre de clase pero sí consistente
