# 03 - Responsabilidades por Servicio

## api-gateway (8000)
- Punto de entrada único para clientes externos
- Enrutamiento a microservicios downstream
- Rate limiting hooks
- Circuit breaker para servicios degradados
- Propagación de headers: Authorization, X-Tenant-ID, X-Correlation-ID

## identity-service (8001)
- Login (email/password), refresh tokens
- MFA (TOTP/SMS hooks)
- Gestión de credenciales y sesiones activas
- Roles y permisos (RBAC)
- Emisión y validación de JWT

## tenant-service (8002)
- CRUD de empresas/clientes (tenants)
- Países, regiones, configuración por tenant
- Branding (logo, colores, dominio)
- Estado del tenant (activo, suspendido)
- Data residency por región

## employee-service (8003)
- Empleados, cargos (positions), cuadrillas (crews)
- Sitios (sites), supervisores
- Datos personales y laborales
- Asignaciones empleado ↔ sitio/cuadrilla

## attendance-service (8004)
- Check-in / check-out
- Salida intermedia y reingreso
- Turnos especiales
- Validaciones temporales y geocercas
- Justificaciones y flujos de aprobación
- Historial y reglas de asistencia

## location-service (8005)
- Ubicación actual y última conocida
- Trazas GPS (traces)
- Geocercas (CRUD + evaluación)
- Eventos geográficos
- Datos para mapas y heatmaps

## incident-service (8006)
- Incidentes y actividades operativas
- Eventos territoriales
- Estados, severidad, actores, fuente
- Evidencias adjuntas (referencias a file service)
- Consultas geográficas

## file-ingestion-service (8007)
- Upload Excel/CSV/TXT
- Parsing metadata-driven (Strategy Pattern)
- Validación en capas (syntax → schema → business)
- Staging, preview, publish
- Log de errores por fila
- Factory Pattern para procesadores por extensión

## template-configuration-service (8008)
- Templates editables (Structure A, Structure B)
- Columnas, aliases, tipos, campos requeridos
- Versionado de templates
- Mapeo a modelo canónico (`CanonicalIncidentRecord`)

## notification-service (8009)
- Push, email, notificaciones internas
- Reglas de envío por evento/canal
- Colas con reintentos (Adapter Pattern para proveedores)
- Estado de entrega

## reporting-service (8010)
- Agregados y KPIs
- Exports (CSV, PDF hooks)
- Endpoints de analytics
- Integración heatmap/dashboard

## ai-service (8011)
- Clasificación automática de incidentes
- Resúmenes y detección de anomalías
- Explicaciones y reportes narrativos
- Adapter Pattern para proveedores LLM

## audit-service (8012)
- Log de auditoría inmutable (append-only)
- Trazabilidad de acciones por tenant/usuario/entidad/fecha
- Historial de cambios (before/after)
- Consumidor de eventos de dominio
