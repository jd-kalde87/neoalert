# 02 — Database per service vs schemas

## Decisión: **13 bases de datos lógicas** (recomendado y adoptado)

NEOALERT adopta **database-per-microservice** sobre un **único cluster PostgreSQL** en desarrollo y staging inicial. En producción el mismo patrón escala a:

- Múltiples instancias PostgreSQL por criticidad (auth/audit aislados).
- RDS/Aurora con una instancia lógica por base.

## Comparativa

| Criterio | 1 DB + schemas por servicio | 1 DB por servicio (elegido) |
|----------|----------------------------|----------------------------|
| Aislamiento de fallos | Medio | Alto — un `DROP` erróneo no afecta otros dominios |
| Backup/restore granular | Requiere pg_dump por schema | Nativo por database |
| Conexiones | Un pool compartido | Pool dedicado por servicio |
| Migraciones | Riesgo de conflicto en schema `public` | Independientes |
| Coste operativo inicial | Menor | Moderado (aceptable en cluster compartido) |
| Camino a DB física separada | Migración dolorosa | Trivial (`pg_dump` + DNS) |

## Por qué NO un solo schema compartido

Los dominios **location** (millones de traces), **audit** (append-only) e **identity** (credenciales) tienen perfiles de carga, retención y compliance distintos. Mezclarlos complica particionado, RLS y ownership.

## Las 13 bases

```
api_gateway
identity_service
tenant_service
employee_service
attendance_service
location_service
incident_service
file_ingestion_service
template_configuration_service
notification_service
reporting_service
ai_service
audit_service
```

La base `neoalert` (default de Postgres) se usa solo para administración; los servicios **no** se conectan a ella.

## Cross-service data

| Necesidad | Patrón |
|-----------|--------|
| Nombre de empleado en incidente | Desnormalizar en payload o consultar employee-service |
| Geocerca en attendance | Réplica local `geofence_refs` sincronizada por evento |
| KPIs | reporting-service consume eventos y materializa snapshots |
| Auditoría | audit-service append-only desde eventos de dominio |

## Evolución enterprise

Para clientes con requisito de **aislamiento fuerte**:

1. Fase 1: DB lógica + RLS (actual).
2. Fase 2: Schema por tenant en servicios de alto volumen.
3. Fase 3: Cluster PostgreSQL dedicado por tenant enterprise (`data_residency` en tenant-service).

Ver `07-multi-tenant-strategy.md`.
