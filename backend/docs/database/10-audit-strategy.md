# 10 — Estrategia de auditoría

## Objetivos

- Trazabilidad **inmutable** de acciones por tenant/usuario/entidad.
- Soporte compliance (quién cambió qué, cuándo, desde dónde).
- Historial field-level para investigaciones.

## Tablas (audit_service)

### audit_events (append-only)

| Campo | Descripción |
|-------|-------------|
| tenant_id | Scope obligatorio |
| actor_id | UUID usuario o `system` |
| action | create, update, delete, login, publish, export |
| entity_type | incident, employee, template, ... |
| entity_id | UUID del registro |
| payload_before / payload_after | Snapshots JSONB |
| checksum | SHA-256 del payload para integridad |
| correlation_id | Trazabilidad request distribuido |

**Protección DB:** triggers `trg_audit_events_no_update` y `trg_audit_events_no_delete`.

### entity_change_history

Desglose por campo derivado de audit_events para queries tipo "historial de status de incidente X".

## Auditoría en tablas operativas

Además del servicio central, tablas OLTP llevan:

| Columna | Uso |
|---------|-----|
| created_at / updated_at | Timestamps automáticos |
| created_by / updated_by | UUID actor |
| deleted_at | Soft delete (employees, sites, incidents, geofences) |

Soft delete **no** reemplaza audit_events — siempre registrar DELETE lógico como acción audit.

## Flujo de ingesta

```
Servicio OLTP (use case)
    ├─ Transacción local (UPDATE incident)
    ├─ Outbox / evento audit.action_logged
    └─ audit-service persiste audit_events
```

Preferir **eventos async** para no bloquear latencia del request; audit crítico (login, export masivo) puede ser sync.

## Qué auditar (mínimo)

| Dominio | Acciones |
|---------|----------|
| identity | login, logout, failed_login, mfa, role_change |
| tenant | config_change, suspend, branding |
| employee | create, assign, terminate |
| incident | create, status_change, evidence_attach |
| ingestion | upload, publish, cancel |
| template | version_publish |
| reporting | export_job |

## Retención

`audit_retention_policies` por tenant:

- **Hot** (90 días): queries frecuentes en PostgreSQL.
- **Warm** (1 año): particionado + compresión.
- **Cold**: archive a object storage Parquet; índice de metadatos en audit DB.

## Consultas típicas

```sql
-- Historial de una entidad
SELECT occurred_at, action, actor_id, payload_after
FROM audit_events
WHERE tenant_id = :tid
  AND entity_type = 'incident'
  AND entity_id = :iid
ORDER BY occurred_at DESC;

-- Actividad de usuario
SELECT * FROM audit_events
WHERE tenant_id = :tid AND actor_id = :uid
  AND occurred_at >= NOW() - INTERVAL '30 days';
```

## Compliance notes

- No almacenar passwords ni tokens en payload_after.
- IP y user_agent opcionales según regulación local.
- checksum permite detección de tampering offline.
