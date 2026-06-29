# 14 - Riesgos y Mitigaciones

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|--------|---------|--------------|------------|
| 1 | **Complejidad operacional** de 13 servicios | Alto | Alta | docker-compose dev; Helm charts prod; service mesh gradual |
| 2 | **Consistencia eventual** entre servicios | Medio | Alta | Outbox pattern; idempotent consumers; saga para flujos críticos |
| 3 | **Latencia** en cadenas sync gateway→N services | Medio | Media | Cache Redis; API composition en gateway; async donde posible |
| 4 | **Schema drift** en contratos de eventos | Alto | Media | Versionado en BaseEvent; contract tests; consumer tolerance |
| 5 | **Cross-tenant data leak** | Crítico | Baja | tenant_id obligatorio; middleware; tests de aislamiento; code review |
| 6 | **Import malformado** corrompe datos | Alto | Alta | Staging obligatorio; validación 3 capas; preview antes de publish |
| 7 | **JWT secret compromise** | Crítico | Baja | Secrets manager; rotación; short-lived tokens; refresh rotation |
| 8 | **RabbitMQ downtime** pierde eventos | Alto | Baja | Outbox persistente; DLQ; retry con backoff; monitoring queue depth |
| 9 | **Over-engineering** retrasa delivery | Medio | Media | Skeleton minimal; implementar features verticalmente (slice) |
| 10 | **Vendor lock-in LLM** (AI service) | Medio | Media | Adapter pattern; interface LlmProvider; multi-provider support |
| 11 | **PostgreSQL single point** | Alto | Baja | Read replicas; per-service DB; backup automatizado |
| 12 | **Observability gaps** dificultan debug | Medio | Media | Correlation ID desde día 1; structured logs; distributed tracing |

## Estrategias Transversales

### Degradación Graceful
- Circuit breaker en gateway
- Fallback responses cuando downstream no disponible
- Queue buffering para async operations

### Disaster Recovery
- Backups PostgreSQL diarios por DB
- RabbitMQ mirrored queues
- Redis persistence (AOF)

### Seguridad
- Penetration testing pre-producción
- Dependency scanning (Dependabot/Snyk)
- Rate limiting + WAF

### Equipo
- Documentación viva en `docs/architecture/`
- ADRs (Architecture Decision Records) por decisión mayor
- Ownership claro: 1-2 servicios por developer
