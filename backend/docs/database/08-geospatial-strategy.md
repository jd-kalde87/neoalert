# 08 — Estrategia geoespacial (PostGIS)

## Bases con PostGIS habilitado

- `employee_service` — sites (puntos y polígonos)
- `attendance_service` — geofence_refs, GPS en check-in
- `location_service` — traces, geofences, heatmaps
- `incident_service` — incidentes y eventos territoriales

Extensión: `CREATE EXTENSION postgis;` (ver `02-extensions.sql`).

## Tipos de datos

| Uso | Tipo PostGIS | SRID |
|-----|--------------|------|
| Posición puntual (GPS, check-in) | `GEOGRAPHY(POINT, 4326)` | WGS84 — distancias en metros |
| Polígonos de sitio/geocerca | `GEOMETRY(POLYGON, 4326)` | WGS84 — operaciones topológicas |
| Área de incidente | `GEOMETRY(POLYGON, 4326)` | Opcional |

**Regla:** usar `GEOGRAPHY` para distancias/proximidad en datos globales; `GEOMETRY` para polígonos complejos y `ST_Contains`.

## Geocercas

### location_service.geofences
- Tipos: `polygon`, `circle`, `corridor`
- Evaluación: `ST_Contains(boundary, point)` o `ST_DWithin(center, point, radius_meters)`

### attendance_service.geofence_refs
Réplica desnormalizada sincronizada desde location-service para validación síncrona en check-in sin llamada HTTP en hot path.

## Trazas GPS (location_traces)

- Tabla particionada por `recorded_at` (mensual en producción).
- Índice GIST en `location`.
- Índice compuesto `(tenant_id, employee_id, recorded_at DESC)` para historial.

### last_known_locations
Upsert por `(tenant_id, employee_id)` — cache caliente complementado con Redis:

```
redis: {tenant_id}:location:last:{employee_id} → JSON {lat, lon, ts}
```

## Heatmaps

### Estrategia dual

1. **location_service.heatmap_cells** — agregación operativa (grid precomputado).
2. **reporting_service.heatmap_read_models** — payloads JSON listos para frontend.

Pipeline:

```
location_traces / incidents (con geom)
        ↓ worker batch (hourly)
ST_SnapToGrid + COUNT grouped by cell
        ↓
heatmap_cells INSERT ... ON CONFLICT UPDATE
        ↓ evento
reporting refresh materialized / read model
```

Resolución de grid configurable (`grid_resolution` 500m default).

## Consultas típicas

### Incidentes en bounding box

```sql
SELECT id, title, incident_date
FROM incidents
WHERE tenant_id = :tid
  AND location && ST_MakeEnvelope(:min_lon, :min_lat, :max_lon, :max_lat, 4326)
  AND deleted_at IS NULL;
```

### Empleados dentro de geocerca

```sql
SELECT employee_id
FROM attendance_records ar
JOIN geofence_refs gf ON gf.id = ar.geofence_id
WHERE ar.tenant_id = :tid
  AND ST_Contains(gf.boundary, ar.location::geometry);
```

## Índices GIST obligatorios

Ver `11-indexing-strategy.md`. Todo campo `GEOGRAPHY`/`GEOMETRY` consultado espacialmente lleva índice GIST.

## Precisión y calidad

- Rechazar puntos con `accuracy_meters > umbral` (config tenant).
- Suavizado de traces en worker (roadmap).
- No almacenar altitud salvo requisito explícito.
