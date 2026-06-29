# 05 - Modelo de Comunicación Sync/Async

## Comunicación Síncrona (HTTP/REST)

Usada para operaciones que requieren respuesta inmediata:

| Origen | Destino | Caso de uso |
|--------|---------|-------------|
| Cliente | API Gateway | Todas las peticiones externas |
| API Gateway | Identity Service | Validación de token (opcional cache Redis) |
| API Gateway | *-service | Proxy con headers propagados |
| File Ingestion | Template Configuration | Obtener template activo por structure_type |
| Reporting | Incident/Attendance | Agregaciones on-demand |
| AI Service | Incident Service | Contexto para clasificación |

### Headers Estándar

```
Authorization: Bearer <jwt>
X-Tenant-ID: <uuid>
X-Correlation-ID: <uuid>
Content-Type: application/json
```

## Comunicación Asíncrona (RabbitMQ)

Usada para side-effects, desacoplamiento y resiliencia:

| Evento | Productor | Consumidores |
|--------|-----------|--------------|
| `incident.created` | incident-service | notification, audit, reporting, ai |
| `attendance.recorded` | attendance-service | notification, audit, reporting |
| `file_ingestion.completed` | file-ingestion-service | incident-service, audit, notification |
| `notification.requested` | * (via outbox) | notification-service |
| `audit.action_logged` | audit-service | reporting (compliance dashboards) |

## Outbox Pattern

Servicios críticos (attendance, incident, audit) escriben eventos en tabla outbox dentro de la misma transacción DB, luego un worker publica a RabbitMQ:

```
Use Case → Repository.save() + OutboxPublisher.enqueue() → COMMIT
Background Worker → OutboxPublisher.pending() → RabbitMQ → mark published
```

## Retry y Circuit Breaker

- **Retry**: notification-service reintenta envíos fallidos (exponential backoff)
- **Circuit Breaker**: api-gateway abre circuito tras N fallos consecutivos a un downstream

## Cuándo Usar Cada Modelo

| Criterio | Sync | Async |
|----------|------|-------|
| Usuario espera respuesta | ✓ | |
| Side-effect (email, audit) | | ✓ |
| Consistencia fuerte inmediata | ✓ | |
| Alto volumen / picos | | ✓ |
| Desacoplamiento temporal | | ✓ |
