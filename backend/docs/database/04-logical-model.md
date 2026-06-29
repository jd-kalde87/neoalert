# 04 — Modelo lógico por dominio

Esquemas lógicos dentro de cada base de datos (schema PostgreSQL `public` en fase 1).

## identity_service

```
users ──┬── user_roles ── roles ── role_permissions ── permissions
        ├── refresh_tokens
        ├── user_sessions
        └── mfa_factors
```

**Invariantes:** email único por tenant; password solo como hash; tokens almacenados hasheados.

## tenant_service

```
countries ── regions
tenants ──┬── tenant_configurations
          ├── tenant_branding
          ├── tenant_feature_flags
          └── catalog_items (por catalog_type)
```

**Invariantes:** `slug` global único; `tenant_id` en tenants es la referencia cross-service.

## employee_service

```
positions
crews ── crew_members ── employees
sites (GEOGRAPHY/GEOMETRY)
employees ── employee_assignments ── sites
```

**Invariantes:** `employee_code` único por tenant; soft delete en employees/sites.

## attendance_service

```
geofence_refs (réplica local)
attendance_shifts
employees (UUID ref only)
attendance_records ── attendance_justifications ── attendance_approval_workflows
```

**Invariantes:** records append-only; geofence evaluación contra `geofence_refs.boundary`.

## location_service

```
geofences
location_traces (PARTITION BY recorded_at)
last_known_locations (PK tenant_id + employee_id)
geofence_events
heatmap_cells
```

**Invariantes:** traces nunca se actualizan; last_known es upsert.

## incident_service

```
incidents ──┬── incident_activities
            ├── incident_evidence_refs
            ├── incident_status_history
            └── territorial_events (optional FK)
```

**Invariantes:** `canonical_payload` + `extra_fields` JSONB para campos flexibles post-import.

## file_ingestion_service

```
ingestion_batches ── staging_rows ── staging_row_errors
                 └── canonical_imported_events ── published_event_refs
```

**Invariantes:** batch status machine; publish solo filas `validation_status = valid`.

## template_configuration_service

```
import_templates ── template_versions ── template_columns ── column_aliases
canonical_field_mappings (por structure_type)
```

**Invariantes:** versiones publicadas son inmutables; nueva versión al cambiar columnas.

## notification_service

```
notification_templates
notification_rules
notifications ── delivery_attempts
```

## reporting_service (read models)

```
kpi_snapshots
export_jobs
dashboard_widgets
heatmap_read_models
```

Sin FKs cross-DB; datos ingeridos por workers desde eventos.

## ai_service

```
model_configurations
ai_analysis_jobs ── ai_analysis_results
```

## audit_service

```
audit_events (append-only, trigger anti-mutación)
entity_change_history
audit_retention_policies
```

## api_gateway

```
route_definitions
gateway_audit_log
```

Rate limiting principalmente en Redis; tabla de rutas para configuración declarativa.
