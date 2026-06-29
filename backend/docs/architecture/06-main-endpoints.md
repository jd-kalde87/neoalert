# 06 - Endpoints Principales

## API Gateway (:8000)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health`, `/health/live`, `/health/ready` | Probes |
| GET | `/gateway/routes` | Rutas configuradas |
| POST | `/gateway/proxy/{path}` | Proxy downstream |
| GET | `/rate-limit/status` | Estado rate limiting |

## Identity Service (:8001)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Autenticación |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/mfa/verify` | Verificar MFA |
| GET | `/auth/sessions` | Sesiones activas |

## Tenant Service (:8002)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/tenants` | Crear tenant |
| GET | `/tenants/{id}` | Obtener tenant |
| PATCH | `/tenants/{id}/config` | Actualizar config |
| GET | `/tenants/{id}/branding` | Branding |

## Employee Service (:8003)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/employees` | Crear empleado |
| GET | `/employees/{id}` | Obtener empleado |
| GET | `/employees` | Listar |
| POST | `/employees/{id}/assignments` | Asignar sitio |

## Attendance Service (:8004)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/attendance/check-in` | Check-in |
| POST | `/attendance/check-out` | Check-out |
| POST | `/attendance/intermediate-exit` | Salida intermedia |
| GET | `/attendance/history/{employee_id}` | Historial |

## Location Service (:8005)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/locations/traces` | Registrar traza |
| GET | `/locations/last/{employee_id}` | Última ubicación |
| GET | `/locations/geofences` | Listar geocercas |
| GET | `/locations/heatmap` | Datos heatmap |

## Incident Service (:8006)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/incidents` | Crear incidente |
| GET | `/incidents/{id}` | Obtener |
| PATCH | `/incidents/{id}/status` | Cambiar estado |
| GET | `/incidents/geo/search` | Búsqueda geográfica |

## File Ingestion Service (:8007)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ingestion/upload` | Subir archivo |
| GET | `/ingestion/{batch_id}/preview` | Preview staging |
| POST | `/ingestion/{batch_id}/publish` | Publicar validados |
| GET | `/ingestion/{batch_id}/errors` | Log de errores |

## Template Configuration Service (:8008)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/templates` | Crear template |
| GET | `/templates/{id}` | Obtener template |
| POST | `/templates/{id}/versions` | Nueva versión |
| GET | `/templates/structure/{type}` | Template activo A/B |

## Notification Service (:8009)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/notifications/send` | Enviar notificación |
| POST | `/notifications/email` | Email |
| POST | `/notifications/push` | Push |
| GET | `/notifications/{id}` | Estado |

## Reporting Service (:8010)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/reports/kpis` | KPIs |
| POST | `/reports/exports` | Export job |
| GET | `/reports/dashboard` | Dashboard |
| GET | `/reports/heatmap` | Heatmap incidentes |

## AI Service (:8011)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ai/classify` | Clasificación |
| POST | `/ai/summarize` | Resumen |
| POST | `/ai/anomaly-detect` | Anomalías |
| POST | `/ai/narrative` | Reporte narrativo |

## Audit Service (:8012)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/audit/logs` | Registrar log |
| GET | `/audit/logs` | Consultar logs |
| GET | `/audit/logs/{entity_type}/{entity_id}` | Historial entidad |
