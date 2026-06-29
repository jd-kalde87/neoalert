# 11 — Estrategia de indexación

## Reglas generales

1. **Leading column `tenant_id`** en índices de tablas multi-tenant.
2. **Índices parciales** para filas activas (`WHERE deleted_at IS NULL`).
3. **GIST** en toda columna geoespacial usada en filtros.
4. Evitar over-indexing en tablas append-only de alto volumen (traces).

## Índices compuestos por dominio

### identity_service
```sql
idx_users_tenant_active     ON users (tenant_id, is_active) WHERE deleted_at IS NULL
idx_users_tenant_email      ON users (tenant_id, email) WHERE deleted_at IS NULL
idx_refresh_tokens_user     ON refresh_tokens (tenant_id, user_id, expires_at)
```

### employee_service
```sql
idx_employees_tenant_status ON employees (tenant_id, status) WHERE deleted_at IS NULL
idx_assignments_employee    ON employee_assignments (tenant_id, employee_id, valid_from DESC)
```

### incident_service
```sql
idx_incidents_tenant_date   ON incidents (tenant_id, incident_date DESC)
idx_incidents_tenant_status ON incidents (tenant_id, status) WHERE deleted_at IS NULL
idx_incidents_tenant_type   ON incidents (tenant_id, event_type)
```

### file_ingestion_service
```sql
idx_batches_tenant_status   ON ingestion_batches (tenant_id, status, uploaded_at DESC)
idx_staging_validation      ON staging_rows (tenant_id, batch_id, validation_status)
```

## Índices GIST (PostGIS)

```sql
-- Puntos
CREATE INDEX idx_traces_location_gist ON location_traces USING GIST (location);
CREATE INDEX idx_incidents_location_gist ON incidents USING GIST (location);

-- Polígonos
CREATE INDEX idx_geofences_boundary_gist ON geofences USING GIST (boundary);
CREATE INDEX idx_sites_boundary_gist ON sites USING GIST (boundary);
```

### Operador && para bounding box

Combine GIST con filtro `tenant_id` en aplicación; para map tiles considerar índice compuesto BRIN en `recorded_at` + GIST en location.

## Índices parciales

Útiles cuando la mayoría de queries excluyen filas:

```sql
-- Solo geocercas activas
CREATE INDEX idx_geofences_active ON geofences (tenant_id, code)
    WHERE is_active AND deleted_at IS NULL;

-- Notificaciones pendientes
CREATE INDEX idx_notifications_pending ON notifications (tenant_id, created_at)
    WHERE status IN ('pending', 'queued');
```

## audit_service

```sql
idx_audit_tenant_time   ON audit_events (tenant_id, occurred_at DESC)
idx_audit_entity        ON audit_events (tenant_id, entity_type, entity_id, occurred_at DESC)
idx_audit_correlation   ON audit_events (correlation_id) WHERE correlation_id IS NOT NULL
```

## JSONB (uso selectivo)

Indexar solo claves consultadas frecuentemente:

```sql
CREATE INDEX idx_incidents_extra_gin ON incidents USING GIN (extra_fields jsonb_path_ops);
-- Solo si hay queries @> frecuentes
```

Evitar GIN en `raw_payload` de staging salvo herramientas de debug.

## Mantenimiento

- `ANALYZE` automático (autovacuum default).
- Traces: `REINDEX` partición antigua solo si degradación medida.
- Monitorear `pg_stat_user_indexes` para índices unused > 30 días.

## Covering indexes (roadmap)

Para dashboards de reporting:

```sql
CREATE INDEX idx_incidents_kpi ON incidents (tenant_id, incident_date, status)
    INCLUDE (severity, event_type);
```
