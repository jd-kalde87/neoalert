# 02 - Diagrama Textual de Microservicios

```
                                    ┌─────────────────┐
                                    │    Clientes     │
                                    │ Web / Mobile /  │
                                    │   Integraciones │
                                    └────────┬────────┘
                                             │ HTTPS
                                             ▼
                              ┌──────────────────────────┐
                              │      API Gateway :8000    │
                              │  Routing | Rate Limit    │
                              │  JWT passthrough         │
                              └────────────┬─────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│ Identity :8001  │              │  Tenant :8002   │              │ Employee :8003  │
│ Auth MFA RBAC   │              │ Multi-tenant    │              │ Crews Sites     │
└────────┬────────┘              └────────┬────────┘              └────────┬────────┘
         │                                │                                │
         └────────────────────────────────┼────────────────────────────────┘
                                          │
    ┌──────────────┬──────────────┬───────┴───────┬──────────────┬──────────────┐
    ▼              ▼              ▼               ▼              ▼              ▼
┌─────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐
│Attendance│  │ Location  │  │ Incident │  │File Ingest │  │ Template │  │  AI     │
│  :8004   │  │  :8005    │  │  :8006   │  │   :8007    │  │ Config   │  │ :8011   │
└────┬────┘  └─────┬─────┘  └────┬─────┘  └─────┬──────┘  │  :8008   │  └────┬────┘
     │             │             │              │         └────┬─────┘       │
     │             │             │              └──────────────┘             │
     │             │             │                                           │
     └─────────────┴─────────────┴───────────────────┬───────────────────────┘
                                                     │
                              ┌──────────────────────┼──────────────────────┐
                              ▼                      ▼                      ▼
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │ Notification    │    │   Reporting     │    │     Audit       │
                    │     :8009       │    │     :8010       │    │     :8012       │
                    └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                             │                      │                      │
                             └──────────────────────┼──────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    ▼                               ▼                               ▼
            ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
            │  PostgreSQL   │               │     Redis     │               │   RabbitMQ    │
            │  (13 DBs)     │               │ Cache/Rate    │               │  Event Bus    │
            └───────────────┘               └───────────────┘               └───────────────┘
```

## Leyenda de Comunicación

- **Línea sólida (sync)**: HTTP/REST entre servicios
- **Eventos (async)**: RabbitMQ — `incident.created`, `attendance.recorded`, `file_ingestion.completed`, `notification.requested`, `audit.action_logged`
- **Shared libs**: `neoalert-contracts`, `neoalert-observability` (sin lógica de negocio)

## Puertos Asignados

| Servicio | Puerto |
|----------|--------|
| api-gateway | 8000 |
| identity-service | 8001 |
| tenant-service | 8002 |
| employee-service | 8003 |
| attendance-service | 8004 |
| location-service | 8005 |
| incident-service | 8006 |
| file-ingestion-service | 8007 |
| template-configuration-service | 8008 |
| notification-service | 8009 |
| reporting-service | 8010 |
| ai-service | 8011 |
| audit-service | 8012 |
