# 13 — Riesgos y mitigaciones

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|--------|---------|--------------|------------|
| R1 | Fuga cross-tenant por query sin filtro | Crítico | Media | RLS + code review + tests multi-tenant |
| R2 | Volumen traces satura PostgreSQL | Alto | Alta | Particionado mensual + archivado S3 + Redis last-known |
| R3 | Drift schema entre servicios | Medio | Media | Migraciones versionadas por servicio; contract tests |
| R4 | Pérdida integridad audit log | Crítico | Baja | Append-only triggers; checksum; backup WORM |
| R5 | Import malicioso (CSV bomb) | Alto | Media | Límite filas/tamaño; parsing streaming; timeout |
| R6 | Geocerca desincronizada attendance vs location | Medio | Media | Evento `geofence.updated`; TTL + full sync nocturno |
| R7 | Single PostgreSQL SPOF | Alto | Media | Réplicas streaming; failover managed (RDS); backups PITR |
| R8 | JSONB unbounded growth en extra_fields | Medio | Media | Límite tamaño payload; validación en ingest |
| R9 | Credenciales en DATABASE_URL | Crítico | Media | Secrets manager; rotación; no commit .env |
| R10 | PostGIS queries lentas sin índice | Medio | Alta | GIST obligatorio; EXPLAIN en CI para queries geo |
| R11 | 13 DBs — operación compleja | Medio | Media | Scripts init automatizados; IaC; documentación |
| R12 | Eventual consistency confunde usuarios | Bajo | Alta | UI muestra estado "procesando"; idempotencia publish |

## Planes de contingencia

### R1 — Data leak
1. Deshabilitar endpoint afectado.
2. Query forense en audit_events.
3. Notificación según regulación.

### R2 — Traces overload
1. Aumentar frecuencia muestreo móvil (config tenant).
2. Crear partición emergency.
3. Throttle ingest API.

### R7 — Postgres down
1. Servicios degradados: solo lectura cache Redis donde exista.
2. Cola RabbitMQ bufferiza eventos.
3. Restore PITR desde backup < RPO 15 min.

## Deuda técnica aceptada (skeleton)

- Repos Python in-memory (sin RLS activo aún).
- Gateway proxy stub.
- Particiones mensuales solo documentadas + default partition.
- Object storage no incluido en docker-compose local.

## Señales de alerta (producción)

- `pg_stat_database.blks_hit` ratio drop en location_service.
- Lag replicación > 30s.
- `staging_rows` invalid ratio > 20% por batch.
- audit_events insert rate drop (consumidor caído).
