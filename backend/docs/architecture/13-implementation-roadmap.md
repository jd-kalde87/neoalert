# 13 - Roadmap de Implementación

## Fase 0 — Skeleton (COMPLETADO)
- [x] Estructura monorepo con 13 microservicios
- [x] Clean Architecture por servicio
- [x] Shared contracts + observability
- [x] docker-compose con PostgreSQL, Redis, RabbitMQ
- [x] Documentación de arquitectura (15 deliverables)
- [x] Tests skeleton (unit, integration, contract)

## Fase 1 — Foundation (4-6 semanas)
- [ ] PostgreSQL async (SQLAlchemy 2.0 + asyncpg) por servicio
- [ ] Migraciones Alembic independientes por servicio
- [ ] JWT real en identity-service (python-jose, passlib)
- [ ] Gateway proxy funcional con httpx
- [ ] Redis rate limiting en gateway
- [ ] CI/CD pipeline (lint + test + build)

## Fase 2 — Core Business (6-8 semanas)
- [ ] CRUD completo: tenant, employee, incident
- [ ] Attendance check-in/out con validación geofence
- [ ] Location traces + geofence evaluation
- [ ] RBAC enforcement en todos los servicios
- [ ] Outbox worker + RabbitMQ consumers

## Fase 3 — Import Pipeline (4-6 semanas)
- [ ] Template CRUD con versionado real
- [ ] CSV/Excel parsing (openpyxl, pandas)
- [ ] Staging tables + preview API
- [ ] Publish flow → incident bulk create
- [ ] Error log detallado por fila

## Fase 4 — Notifications & Reporting (4 semanas)
- [ ] Email adapter (SMTP/SendGrid)
- [ ] Push notifications (FCM)
- [ ] Event-driven notification rules
- [ ] KPI aggregations + export jobs
- [ ] Dashboard endpoints

## Fase 5 — AI & Advanced (4-6 semanas)
- [ ] LLM adapter (OpenAI/Azure)
- [ ] Auto-classification pipeline
- [ ] Anomaly detection baselines
- [ ] Narrative report generation

## Fase 6 — Production Hardening (ongoing)
- [ ] Kubernetes manifests / Helm charts
- [ ] mTLS inter-service
- [ ] Secrets manager integration
- [ ] OpenTelemetry OTLP export
- [ ] Load testing + performance tuning
- [ ] Disaster recovery + backup strategy

## Prioridades Inmediatas

1. **Identity + Gateway** — auth end-to-end funcional
2. **Tenant + Employee** — base multi-tenant operativa
3. **Incident + Import** — flujo Structure A/B completo
4. **Audit** — trazabilidad desde día 1 de producción
