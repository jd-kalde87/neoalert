# 10 - Estrategia de Importación Flexible (Structure A & B)

## Problema

Dos estructuras de datos diferentes para incidentes operativos:

### Structure A
| Columna | Campo Canónico |
|---------|----------------|
| Fecha | incident_date |
| Ubicación | location |
| Tipo de Evento o Acción | event_type |
| Detalle del Aseguramiento o Resultado | detail |
| Instituciones Involucradas | involved_institutions |
| Monto de Inversión | investment_amount |
| Fuente | source |

### Structure B
| Columna | Campo Canónico |
|---------|----------------|
| Fecha del Incidente | incident_date |
| Ubicación Específica | location |
| Tipo de Operativo | event_type |
| Fuerzas de Seguridad | security_forces |
| Detalle de Aseguramiento | detail |
| Cantidad de Artefactos | artifact_count |
| Autoridad Investigación | investigation_authority |
| Fuente | source |

## Arquitectura Metadata-Driven

```
[Upload File] → [File Ingestion Service]
                      │
                      ├─ Factory: selecciona reader (.csv, .xlsx)
                      ├─ Template Config Service: obtiene column map + version
                      ├─ Strategy: reader parsea filas raw
                      ├─ Canonical Mapper: alias → canonical field
                      ├─ Validación en capas:
                      │     1. Syntax (tipos de dato)
                      │     2. Schema (campos requeridos)
                      │     3. Business (reglas de dominio)
                      ├─ Staging table (preview)
                      └─ Publish → Incident Service (bulk)
```

## Componentes

| Componente | Servicio | Patrón |
|------------|----------|--------|
| Template CRUD + versioning | template-configuration-service | Repository |
| Column alias mapping | template-configuration-service | CanonicalMapper |
| File parsing | file-ingestion-service | Strategy (CsvReader, ExcelReader) |
| Processor selection | file-ingestion-service | Factory |
| Staging/preview/publish | file-ingestion-service | Use cases |
| Canonical model | shared/contracts | `CanonicalIncidentRecord` |

## Versionado de Templates

- Cada cambio de columnas genera nueva versión (inmutable)
- Batches referencian `template_id` + `template_version`
- Reprocesamiento posible con versión anterior

## Validación en Capas

1. **Syntax**: tipos (date, decimal, integer, text)
2. **Schema**: campos required vs optional del template
3. **Business**: reglas cross-field (ej. artifact_count >= 0)

## Error Handling

- Errores por fila almacenados con `{row_number, field, error_code, message}`
- Preview muestra filas válidas vs inválidas
- Publish solo filas validadas (partial publish opcional)

## Contratos Compartidos

Definidos en:
- `shared/contracts/templates/structure_a.py`
- `shared/contracts/templates/structure_b.py`
- `shared/contracts/api/canonical_models.py`

Templates editables vía API sin redeploy de código.
