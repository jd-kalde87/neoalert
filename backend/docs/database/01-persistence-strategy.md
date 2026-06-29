# 01 — Estrategia de persistencia

## Objetivo

Persistir datos operativos de seguridad física y operaciones territoriales con **aislamiento multi-tenant**, **trazabilidad geoespacial** e **importación flexible** de incidentes (Structure A/B), sin acoplar el esquema de cada dominio.

## Stack

| Capa | Tecnología | Uso |
|------|------------|-----|
| OLTP principal | PostgreSQL 16 + PostGIS 3.4 | Transacciones por dominio |
| Caché / ephemeral | Redis 7 | Sesiones, rate limit, last-known-location hot cache |
| Mensajería | RabbitMQ 3.13 | Eventos de dominio, outbox |
| Archivos | S3-compatible (MinIO/AWS) | Excel/CSV subidos, evidencias |
| Analytics | Read models en `reporting_service` | KPIs, heatmaps denormalizados |

## Principios

1. **Propiedad de datos por servicio** — cada microservicio es dueño de su base lógica; no hay JOINs cross-DB en runtime.
2. **Referencias por UUID** — `employee_id`, `tenant_id`, `incident_id` se propagan como identificadores opacos entre servicios.
3. **tenant_id obligatorio** en tablas tenant-scoped; índices compuestos `(tenant_id, ...)`.
4. **Eventual consistency** — sincronización vía eventos (`incident.created`, `attendance.recorded`, etc.).
5. **Esquema evolutivo** — migraciones versionadas por servicio (`V001__`, Alembic en código Python).

## Fases de madurez

| Fase | Estado | Descripción |
|------|--------|-------------|
| Skeleton | **Actual** | SQL inicial + repos in-memory en Python |
| Integración DB | Próximo | SQLAlchemy async + Alembic por servicio |
| RLS activo | Producción | `SET app.current_tenant_id` en cada request |
| Escala | Enterprise | Particiones mensuales en traces; réplicas de lectura |

## Anti-patrones evitados

- Base de datos monolítica compartida con FKs entre dominios distintos.
- Duplicar lógica de negocio en triggers cross-DB.
- Almacenar binarios en PostgreSQL (solo referencias + metadata).

## Conexión desde servicios

Cada servicio usa `DATABASE_URL` async (`postgresql+asyncpg://...`) apuntando a **su** base. Ver `.env.example` y `docs/database/02-database-per-service.md`.
