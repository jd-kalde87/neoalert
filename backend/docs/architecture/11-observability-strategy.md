# 11 - Estrategia de Observabilidad

## Pilares

1. **Logging** — Structured JSON logs
2. **Tracing** — OpenTelemetry distributed traces
3. **Metrics** — Prometheus-compatible (futuro)
4. **Health** — Liveness, readiness, health endpoints

## Shared Library: neoalert_observability

Ubicación: `shared/observability/`

| Módulo | Función |
|--------|---------|
| `correlation_id.py` | Middleware + ContextVar propagation |
| `logging.py` | structlog JSON con correlation_id automático |
| `telemetry.py` | OpenTelemetry TracerProvider setup |

## Correlation ID

```
Request → CorrelationIdMiddleware → ContextVar → Logs + Events + Downstream headers
```

Header: `X-Correlation-ID`
- Generado si no presente
- Retornado en response
- Propagado en llamadas inter-servicio

## Structured Logging

Formato JSON:
```json
{
  "event": "incident_created",
  "level": "info",
  "timestamp": "2026-06-28T10:00:00Z",
  "service": "incident-service",
  "correlation_id": "abc-123",
  "tenant_id": "uuid",
  "incident_id": "uuid"
}
```

## Health Endpoints (todos los servicios)

| Endpoint | Propósito |
|----------|-----------|
| `GET /health` | General health |
| `GET /health/live` | Kubernetes liveness probe |
| `GET /health/ready` | Kubernetes readiness (DB, Redis, MQ) |

## OpenTelemetry (skeleton)

- `configure_telemetry(service_name)` en startup
- ConsoleSpanExporter para dev
- Producción: OTLP exporter → Jaeger/Tempo/Datadog

## Métricas Recomendadas (roadmap)

- Request latency p50/p95/p99 por endpoint
- Error rate por servicio
- Queue depth (RabbitMQ)
- Outbox pending count
- Import batch success/failure rate

## Alerting (producción)

- Error rate > threshold → PagerDuty
- Outbox lag > 5 min → warning
- Service readiness fail → critical
