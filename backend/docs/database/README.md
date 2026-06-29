# NEOALERT — Documentación de base de datos

Índice de la estrategia de persistencia enterprise para la plataforma NEOALERT.

## Decisión principal

**Database-per-microservice** sobre un **cluster PostgreSQL compartido** (fase inicial), con **13 bases de datos lógicas** alineadas a los 13 microservicios. PostGIS en dominios geoespaciales. Redis para caché/ephemeral. Object storage para archivos/evidencia.

## Documentos

| # | Archivo | Contenido |
|---|---------|-----------|
| 01 | [01-persistence-strategy.md](01-persistence-strategy.md) | Estrategia general de persistencia |
| 02 | [02-database-per-service.md](02-database-per-service.md) | DB por servicio vs schemas |
| 03 | [03-conceptual-model.md](03-conceptual-model.md) | Modelo conceptual y diagramas ER |
| 04 | [04-logical-model.md](04-logical-model.md) | Modelo lógico por dominio |
| 05 | [05-core-tables.md](05-core-tables.md) | Tablas principales, columnas, PKs/FKs |
| 06 | [06-relationships.md](06-relationships.md) | Relaciones clave cross-domain |
| 07 | [07-multi-tenant-strategy.md](07-multi-tenant-strategy.md) | tenant_id, RLS, aislamiento |
| 08 | [08-geospatial-strategy.md](08-geospatial-strategy.md) | PostGIS, geocercas, heatmaps |
| 09 | [09-import-staging-strategy.md](09-import-staging-strategy.md) | Structure A/B, staging, canónico |
| 10 | [10-audit-strategy.md](10-audit-strategy.md) | Auditoría inmutable y compliance |
| 11 | [11-indexing-strategy.md](11-indexing-strategy.md) | Índices compuestos, parciales, GIST |
| 12 | [12-partitioning-archiving.md](12-partitioning-archiving.md) | Particionado time-series |
| 13 | [13-risks-mitigations.md](13-risks-mitigations.md) | Riesgos y mitigaciones |
| 14 | [14-naming-conventions.md](14-naming-conventions.md) | Convenciones de nombres |
| 15 | [15-migrations-versioning.md](15-migrations-versioning.md) | Migraciones y versionado |

## Artefactos SQL

```
infrastructure/database/
├── init/
│   ├── 01-create-databases.sql
│   ├── 02-extensions.sql
│   └── 03-apply-schemas.sh
├── schemas/
│   └── {service}/V001__initial_schema.sql
└── seeds/
    ├── structure_a_template.sql
    └── structure_b_template.sql
```

## Mapa servicio → base de datos

| Microservicio | Base de datos | PostGIS |
|---------------|---------------|---------|
| api-gateway | `api_gateway` | No |
| identity-service | `identity_service` | No |
| tenant-service | `tenant_service` | No |
| employee-service | `employee_service` | Sí (sites) |
| attendance-service | `attendance_service` | Sí (geofences, check-in GPS) |
| location-service | `location_service` | Sí |
| incident-service | `incident_service` | Sí |
| file-ingestion-service | `file_ingestion_service` | No |
| template-configuration-service | `template_configuration_service` | No |
| notification-service | `notification_service` | No |
| reporting-service | `reporting_service` | No (read models) |
| ai-service | `ai_service` | No |
| audit-service | `audit_service` | No |

## Guía operativa

Ver [GETTING_STARTED.md](../GETTING_STARTED.md) para levantar Docker y verificar las bases.
