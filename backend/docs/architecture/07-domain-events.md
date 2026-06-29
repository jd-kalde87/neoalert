# 07 - Eventos de Dominio

Todos los eventos extienden `BaseEvent` en `shared/contracts`:

```python
class BaseEvent(BaseModel):
    event_id: UUID
    event_type: str
    tenant_id: UUID
    correlation_id: str
    occurred_at: datetime
    version: str = "1.0"
```

## Catálogo de Eventos

### incident.created
- **Productor**: incident-service
- **Payload**: `incident_id`, `severity`, `source`
- **Consumidores**: notification-service, audit-service, reporting-service, ai-service

### attendance.recorded
- **Productor**: attendance-service
- **Payload**: `employee_id`, `record_type`, `site_id`
- **Consumidores**: notification-service, audit-service, reporting-service, location-service

### file_ingestion.completed
- **Productor**: file-ingestion-service
- **Payload**: `batch_id`, `template_id`, `record_count`, `error_count`
- **Consumidores**: incident-service (bulk create), audit-service, notification-service

### notification.requested
- **Productor**: cualquier servicio vía outbox
- **Payload**: `channel`, `recipient_id`, `template_code`
- **Consumidor**: notification-service

### audit.action_logged
- **Productor**: audit-service
- **Payload**: `actor_id`, `action`, `entity_type`, `entity_id`, `changes`
- **Consumidores**: reporting-service (compliance)

## Convenciones

| Regla | Detalle |
|-------|---------|
| Naming | `<aggregate>.<past_tense_verb>` |
| Versionado | Campo `version` para evolución de schema |
| Idempotencia | Consumidores usan `event_id` como clave dedup |
| Correlation | Siempre propagar `correlation_id` del request original |
| Tenant scope | Todo evento incluye `tenant_id` |

## Exchange/Queue RabbitMQ (propuesto)

```
Exchange: neoalert.events (topic)
Queues:
  - notification.events
  - audit.events
  - reporting.events
  - ai.events
Routing keys: incident.created, attendance.recorded, etc.
```

## Outbox → Event Flow

```
[Domain Action] → [Outbox Table INSERT] → [Worker Poll] → [RabbitMQ Publish] → [Consumer Handler]
```
