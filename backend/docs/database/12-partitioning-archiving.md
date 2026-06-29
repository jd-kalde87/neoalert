# 12 — Particionado y archivado

## Tablas candidatas a particionado

| Tabla | Servicio | Estrategia | Retención hot |
|-------|----------|------------|---------------|
| location_traces | location | RANGE por `recorded_at` mensual | 90 días |
| audit_events | audit | RANGE por `occurred_at` mensual | 90–365 días |
| gateway_audit_log | api-gateway | RANGE por `occurred_at` semanal | 30 días |
| notifications | notification | RANGE por `created_at` trimestral | 180 días |

## location_traces (crítico)

DDL inicial usa particionado declarado:

```sql
CREATE TABLE location_traces (...)
PARTITION BY RANGE (recorded_at);
```

### Creación proactiva de particiones

Job mensual (pg_cron o worker):

```sql
CREATE TABLE location_traces_2026_07
    PARTITION OF location_traces
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

Automatizar 3 meses adelante + default partition para safety.

## Archivado cold

### Traces > 90 días

1. `COPY` partición a Parquet en S3 (`s3://neoalert-archive/traces/tenant={id}/year=2026/month=07/`).
2. Verificar row count checksum.
3. `DROP TABLE location_traces_2026_04` (o detach + archive).
4. Registrar en tabla de control `archive_manifest`.

### Audit > política tenant

Según `audit_retention_policies.warm_days`:
- Detach partición → comprimir → Glacier.
- Mantener índice de búsqueda (entity_id, date range) en metadata table.

## reporting_service

No particionar agresivamente — volumen bajo. Snapshots son agregados pequeños.

Refresh de read models:

```sql
-- Worker reemplaza heatmap_read_models por periodo
DELETE FROM heatmap_read_models WHERE tenant_id = :tid AND period_start = :ps;
INSERT INTO heatmap_read_models ...
```

## Rehydration

Consultas históricas sobre traces archivados:
- API async `/reports/traces/historical` dispara query Athena/Spark sobre Parquet.
- Resultado no reintegra a OLTP salvo investigación puntual.

## Vacuum y bloat

Particiones dropeadas eliminan bloat automáticamente. Particiones activas:

```sql
ALTER TABLE location_traces_2026_06 SET (autovacuum_vacuum_scale_factor = 0.05);
```

## Monitoreo

| Métrica | Alerta |
|---------|--------|
| Tamaño partición default | > 1M filas — crear particiones |
| Partición futura inexistente | Error insert |
| Lag archivado | > 7 días tras fin de mes |
