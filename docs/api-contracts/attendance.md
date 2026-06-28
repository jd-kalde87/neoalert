# API — Asistencia laboral en ruta

## Endpoints previstos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/attendance` | Historial / supervisión |
| `POST` | `/api/attendance/mark` | Registrar marcación |
| `GET` | `/api/attendance/route-safety` | Validar ruta vs incidentes activos |
| `PATCH` | `/api/attendance/:id/approve` | Aprobar marcación excepcional |

## Validación de ruta (`GET /route-safety`)

Query: `routeName`, `targetWorkSite`

Respuesta:

```json
{
  "allowed": false,
  "level": "blocked",
  "message": "Ruta bloqueada...",
  "blockingIncidents": [{ "id": "...", "code": "SEG-001", "title": "..." }],
  "warningIncidents": []
}
```

Reglas:
- Incidentes activos (`open`, `in_review`, `in_progress`) en la misma ruta o sitio
- `blocksTransit: true` → nivel `blocked`, marcación rechazada salvo excepcional con justificación
- Severidad alta/crítica sin bloqueo → nivel `warning`, puede requerir aprobación

## Marcación (`POST /mark`)

Body incluye: `markType`, `routeName`, `targetWorkSite`, `latitude`, `longitude`, `gpsAccuracyMeters`, `networkOnline`, `justification?`, `forceExceptional?`

Estados de sync: `synced`, `offline_pending`, `rejected`, `requires_approval`
