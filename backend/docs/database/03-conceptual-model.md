# 03 — Modelo conceptual

Descripción de entidades de negocio y sus relaciones a nivel conceptual (sin atarse a una sola base física).

## Dominios

```mermaid
erDiagram
    TENANT ||--o{ USER : has
    TENANT ||--o{ EMPLOYEE : employs
    TENANT ||--o{ SITE : operates
    TENANT ||--o{ INCIDENT : records
    TENANT ||--o{ IMPORT_TEMPLATE : configures

    USER ||--o{ USER_ROLE : assigned
    ROLE ||--o{ USER_ROLE : grants
    ROLE ||--o{ ROLE_PERMISSION : includes
    PERMISSION ||--o{ ROLE_PERMISSION : defines

    EMPLOYEE ||--o{ ATTENDANCE_RECORD : generates
    EMPLOYEE ||--o{ LOCATION_TRACE : emits
    EMPLOYEE }o--o{ CREW : member_of
    EMPLOYEE ||--o{ EMPLOYEE_ASSIGNMENT : assigned_to
    SITE ||--o{ EMPLOYEE_ASSIGNMENT : hosts

    GEOFENCE ||--o{ GEOFENCE_EVENT : triggers
    GEOFENCE ||--o{ ATTENDANCE_RECORD : validates

    INCIDENT ||--o{ INCIDENT_ACTIVITY : tracks
    INCIDENT ||--o{ EVIDENCE_REF : attaches
    INCIDENT ||--o{ TERRITORIAL_EVENT : maps

    IMPORT_TEMPLATE ||--o{ TEMPLATE_VERSION : versions
    TEMPLATE_VERSION ||--o{ TEMPLATE_COLUMN : defines
    INGESTION_BATCH ||--o{ STAGING_ROW : contains
    STAGING_ROW ||--o{ STAGING_ROW_ERROR : may_have
    INGESTION_BATCH ||--o{ CANONICAL_IMPORTED_EVENT : publishes

    NOTIFICATION ||--o{ DELIVERY_ATTEMPT : retries
    AUDIT_EVENT ||--o{ ENTITY_CHANGE_HISTORY : details
```

## Entidades núcleo

### Plataforma
- **Tenant** — cliente empresa; ancla de multi-tenancy.
- **User** — credenciales y perfil de acceso (identity-service).
- **Role / Permission** — RBAC.

### Operaciones de campo
- **Employee** — trabajador con código, documento, cargo.
- **Site** — instalación con geolocalización.
- **Crew** — cuadrilla operativa.
- **AttendanceRecord** — evento check-in/out con validación geográfica opcional.

### Territorio y seguridad
- **LocationTrace** — punto GPS en el tiempo.
- **Geofence** — polígono o círculo de control.
- **Incident** — hecho operativo o de seguridad.
- **TerritorialEvent** — evento geográfico para capas de mapa.

### Importación flexible
- **ImportTemplate** — Structure A o B editable.
- **TemplateVersion** — snapshot inmutable de columnas.
- **IngestionBatch** — archivo subido.
- **StagingRow** — fila parseada con payload original + normalizado.
- **CanonicalImportedEvent** — registro listo para publicar a incidentes.

### Transversal
- **AuditEvent** — acción auditable append-only.
- **Notification** — mensaje outbound multi-canal.

## Agregados (DDD)

| Agregado | Raíz | Servicio dueño |
|----------|------|----------------|
| Tenant | Tenant | tenant-service |
| UserAccount | User | identity-service |
| Workforce | Employee | employee-service |
| AttendanceSession | AttendanceRecord | attendance-service |
| TraceStream | LocationTrace | location-service |
| IncidentCase | Incident | incident-service |
| ImportJob | IngestionBatch | file-ingestion-service |
| TemplateDefinition | ImportTemplate | template-configuration-service |

## Identificadores

- Todos los IDs primarios: **UUID v4** (`gen_random_uuid()`).
- `tenant_id` es UUID propagado en JWT, header `X-Tenant-ID` y eventos.
