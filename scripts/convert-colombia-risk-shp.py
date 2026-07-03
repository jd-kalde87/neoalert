"""Convierte el shapefile de niveles de riesgo Colombia 2026 a GeoJSON optimizado."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import shapefile

DEFAULT_SOURCE = Path(
    r"c:\Users\SALUD PUBLICA\Desktop\aplicacio movil\archivos cargue\Archivos prueba 1\Niveles_de_riesgo_Colombia_2026"
)
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "public" / "maps" / "colombia" / "niveles-riesgo-2026.geojson"
COORD_PRECISION = 4


def round_coord(value: float) -> float:
    return round(value, COORD_PRECISION)


def shape_to_geojson_geometry(shape) -> dict | None:
    if shape.shapeType == shapefile.POLYGON:
        rings = []
        for part_idx, part in enumerate(shape.parts):
            start = part
            end = shape.parts[part_idx + 1] if part_idx + 1 < len(shape.parts) else len(shape.points)
            ring = [[round_coord(x), round_coord(y)] for x, y in shape.points[start:end]]
            if len(ring) >= 4:
                rings.append(ring)
        if not rings:
            return None
        return {"type": "Polygon", "coordinates": rings}

    if shape.shapeType == shapefile.MULTIPOLYGON:
        polygons = []
        for points, parts in shape.iterParts():
            rings = []
            for part_idx, part in enumerate(parts):
                start = part
                end = parts[part_idx + 1] if part_idx + 1 < len(parts) else len(points)
                ring = [[round_coord(x), round_coord(y)] for x, y in points[start:end]]
                if len(ring) >= 4:
                    rings.append(ring)
            if rings:
                polygons.append(rings)
        if not polygons:
            return None
        if len(polygons) == 1:
            return {"type": "Polygon", "coordinates": polygons[0]}
        return {"type": "MultiPolygon", "coordinates": polygons}

    return None


def normalize_criticidad(value: str | None) -> str:
    if not value:
        return "unknown"
    normalized = value.strip().upper()
    mapping = {
        "1. EXTREMO": "extremo",
        "2. ALTO": "alto",
        "3. MEDIO": "medio",
        "4. BAJA": "bajo",
    }
    return mapping.get(normalized, normalized.lower())


def convert(source: Path, output: Path) -> None:
    reader = shapefile.Reader(str(source))
    field_names = [field[0] for field in reader.fields[1:]]
    field_index = {name: idx for idx, name in enumerate(field_names)}

    features: list[dict] = []
    for shape, record in zip(reader.iterShapes(), reader.iterRecords(), strict=True):
        geometry = shape_to_geojson_geometry(shape)
        if geometry is None:
            continue

        nombre = record[field_index["NOMBRE_ENT"]] if "NOMBRE_ENT" in field_index else ""
        departamento = record[field_index["DEPARTAMEN"]] if "DEPARTAMEN" in field_index else ""
        cod_dane = record[field_index["COD_DANE"]] if "COD_DANE" in field_index else ""
        criticidad_raw = record[field_index["CRITICIDAD"]] if "CRITICIDAD" in field_index else ""

        features.append(
            {
                "type": "Feature",
                "properties": {
                    "nombre": (nombre or "").strip(),
                    "departamento": (departamento or "").strip(),
                    "codDane": (cod_dane or "").strip(),
                    "criticidad": normalize_criticidad(criticidad_raw),
                    "criticidadLabel": (criticidad_raw or "").strip(),
                },
                "geometry": geometry,
            }
        )

    collection = {
        "type": "FeatureCollection",
        "name": "Niveles_de_riesgo_Colombia_2026",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": features,
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(collection, handle, ensure_ascii=False, separators=(",", ":"))

    size_mb = output.stat().st_size / (1024 * 1024)
    print(f"Wrote {len(features)} features (raw) to {output} ({size_mb:.2f} MB)")

    try:
        from shapely.geometry import shape, mapping
        from shapely.validation import make_valid

        simplified_features: list[dict] = []
        tolerance = 0.012
        for feature in features:
            geom = shape(feature["geometry"])
            if not geom.is_valid:
                geom = make_valid(geom)
            simplified_features.append(
                {
                    "type": "Feature",
                    "properties": feature["properties"],
                    "geometry": mapping(geom.simplify(tolerance, preserve_topology=True)),
                }
            )

        simplified_collection = {
            "type": "FeatureCollection",
            "name": collection["name"],
            "features": simplified_features,
        }
        with output.open("w", encoding="utf-8") as handle:
            json.dump(simplified_collection, handle, ensure_ascii=False, separators=(",", ":"))

        size_mb = output.stat().st_size / (1024 * 1024)
        print(f"Simplified to {output} ({size_mb:.2f} MB)")
    except ImportError:
        print("Install shapely for geometry simplification: pip install shapely")


if __name__ == "__main__":
    source_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    convert(source_path, output_path)
