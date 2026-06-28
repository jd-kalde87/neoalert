# API — Notificaciones de seguridad

Contrato previsto para integración **backend ↔ web ↔ app móvil**.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/notifications` | Listado paginado con filtros |
| `GET` | `/api/notifications/unread-count` | Contador no leídas |
| `PATCH` | `/api/notifications/:id/read` | Marcar una como leída |
| `PATCH` | `/api/notifications/read-all` | Marcar todas como leídas |

## Query params (`GET /notifications`)

| Param | Tipo | Descripción |
|-------|------|-------------|
| `read` | `all \| read \| unread` | Estado de lectura |
| `severity` | `low \| medium \| high \| critical` | Nivel de riesgo |
| `type` | ver tipos abajo | Categoría |
| `zoneId` | string | Corredor operativo |
| `siteId` | string | Sitio de trabajo |
| `search` | string | Búsqueda texto |
| `page` | number | Paginación |
| `pageSize` | number | Tamaño página |

## Tipos de notificación

- `security_incident` — Incidente de seguridad en ruta
- `route_block` — Ruta bloqueada (no transitar)
- `risk_alert` — Alerta de precaución
- `status_update` — Cambio de estado de incidente
- `system` — Mensajes del sistema

## Modelo `Notification`

```json
{
  "id": "uuid",
  "title": "Ruta bloqueada — Sitio Alpha",
  "message": "Descripción para el colaborador",
  "type": "route_block",
  "severity": "critical",
  "timestamp": "2026-06-28T09:15:00Z",
  "read": false,
  "incidentId": "inc-001",
  "routeName": "Ruta Planta → Sitio Alpha",
  "zoneId": "zone-norte",
  "siteId": "site-alpha",
  "blocksTransit": true
}
```

## Push móvil (fase 2)

Al crear o actualizar un incidente de seguridad con `blocksTransit: true` o `severity: critical | high`, el backend debe:

1. Persistir la notificación
2. Enviar push FCM/APNs al tópico del tenant + corredor
3. Payload mínimo para deep link: `{ incidentId, routeName, blocksTransit }`

## Web actual (mock)

- Polling cada 15–30 s vía TanStack Query
- Al registrar incidente en web → `createSecurityNotification()` local
- Reemplazar por `POST` backend cuando esté disponible
