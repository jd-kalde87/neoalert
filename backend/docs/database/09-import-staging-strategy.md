# 09 — Importación flexible: Structure A & B

## Problema de negocio

Clientes cargan incidentes operativos desde Excel/CSV con **dos layouts distintos** (Structure A y B). Las columnas difieren pero convergen en un **modelo canónico** (`CanonicalIncidentRecord` en `shared/contracts`).

## Arquitectura metadata-driven

```
[Upload] → file-ingestion-service
              ├─ Obtiene template_id + version (template-configuration-service)
              ├─ Parse Strategy (CSV/XLSX)
              ├─ Alias → canonical_field (column_aliases)
              ├─ Validación: syntax → schema → business
              ├─ staging_rows (raw + normalized + errors)
              └─ Publish → canonical_imported_events → incident-service
```

## Structure A — columnas

| Header fuente | Campo canónico | Tipo |
|---------------|----------------|------|
| Fecha | incident_date | date |
| Ubicación | location | string |
| Tipo de Evento o Acción | event_type | string |
| Detalle del Aseguramiento o Resultado | detail | text |
| Instituciones Involucradas | involved_institutions | string |
| Monto de Inversión | investment_amount | decimal |
| Fuente | source | string |

## Structure B — columnas

| Header fuente | Campo canónico | Tipo |
|---------------|----------------|------|
| Fecha del Incidente | incident_date | date |
| Ubicación Específica | location | string |
| Tipo de Operativo | event_type | string |
| Fuerzas de Seguridad | security_forces | string |
| Detalle de Aseguramiento | detail | text |
| Cantidad de Artefactos | artifact_count | integer |
| Autoridad Investigación | investigation_authority | string |
| Fuente | source | string |

## Versionado de templates

1. `import_templates.current_version` apunta a versión activa.
2. Cambio de columnas → nueva fila en `template_versions` (inmutable).
3. `ingestion_batches` guarda `template_id` + `template_version` para reproducibilidad.

## Staging model

### staging_rows

| Campo | Contenido |
|-------|-----------|
| `raw_payload` | JSONB `{ "Fecha": "2024-01-15", ... }` headers originales |
| `normalized_payload` | JSONB con claves canónicas post-mapper |
| `canonical_payload` | JSONB validado listo para publish |
| `validation_status` | pending → valid / invalid |

### staging_row_errors

```json
{ "row_number": 42, "field": "incident_date", "error_code": "INVALID_DATE", "message": "..." }
```

## JSONB para columnas extra

Columnas no definidas en template se preservan:

- En staging: dentro de `raw_payload`.
- En publish: `canonical_imported_events.extra_fields` e `incidents.extra_fields`.

Permite evolución sin migración por cada columna cliente.

## canonical_imported_events

Registro intermedio desnormalizado antes de crear `incidents`:

- Campos core como columnas tipadas (fecha, location, event_type, ...).
- `canonical_fields` JSONB con el objeto completo.
- `incident_id` se rellena post-publish.

## Validación en capas

| Capa | Ejemplo |
|------|---------|
| Syntax | `"abc"` no es date |
| Schema | `incident_date` required ausente |
| Business | `artifact_count < 0` |

## Seeds

Scripts listos en:
- `infrastructure/database/seeds/structure_a_template.sql`
- `infrastructure/database/seeds/structure_b_template.sql`

## Partial publish

Opción: publicar solo filas `validation_status = valid`; filas inválidas quedan en staging con errors exportables vía `/ingestion/{batch_id}/errors`.
