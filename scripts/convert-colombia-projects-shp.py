"""Convierte Municipios_Proyectos_2026.shp (UTM 18N) a GeoJSON WGS84."""
from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

import shapefile
from pyproj import Transformer
from shapely.geometry import mapping, shape
from shapely.ops import transform as shapely_transform
from shapely.ops import unary_union
from shapely.validation import make_valid

DEFAULT_SOURCE = Path(
    r"c:\Users\SALUD PUBLICA\Desktop\aplicacio movil\modificacion 3 cargue noticias\PROYECTOS WSP\Municipios_Proyectos_2026"
)
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "maps" / "colombia"
SOURCE_CRS = "EPSG:32618"  # WGS 84 / UTM zone 18N
TARGET_CRS = "EPSG:4326"
COORD_PRECISION = 5

PROJECT_PALETTE = [
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#059669",
    "#0891b2",
    "#4f46e5",
    "#c026d3",
    "#d97706",
    "#16a34a",
    "#0d9488",
    "#9333ea",
    "#e11d48",
    "#65a30d",
    "#0284c7",
    "#a21caf",
    "#ca8a04",
    "#15803d",
]

TRANSFORMER = Transformer.from_crs(SOURCE_CRS, TARGET_CRS, always_xy=True)


def round_coord(value: float) -> float:
    return round(value, COORD_PRECISION)


def reproject_geometry(geometry: dict) -> dict:
    geom = shape(geometry)
    if not geom.is_valid:
        geom = make_valid(geom)
    projected = shapely_transform(TRANSFORMER.transform, geom)
    simplified = projected.simplify(0.002, preserve_topology=True)
    return mapping(simplified)


def reproject_point(x: float, y: float) -> tuple[float, float]:
    lng, lat = TRANSFORMER.transform(x, y)
    return round_coord(lat), round_coord(lng)


def shape_to_geojson_geometry(shp) -> dict | None:
    if shp.shapeType == shapefile.POLYGON:
        rings = []
        for part_idx, part in enumerate(shp.parts):
            start = part
            end = shp.parts[part_idx + 1] if part_idx + 1 < len(shp.parts) else len(shp.points)
            ring = [[x, y] for x, y in shp.points[start:end]]
            if len(ring) >= 4:
                rings.append(ring)
        if not rings:
            return None
        return {"type": "Polygon", "coordinates": rings}

    if shp.shapeType == shapefile.MULTIPOLYGON:
        polygons = []
        for points, parts in shp.iterParts():
            rings = []
            for part_idx, part in enumerate(parts):
                start = part
                end = parts[part_idx + 1] if part_idx + 1 < len(parts) else len(points)
                ring = [[x, y] for x, y in points[start:end]]
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


def geometry_centroid_wgs84(geometry: dict) -> tuple[float, float] | None:
    geom = shape(geometry)
    if not geom.is_valid:
        geom = make_valid(geom)
    centroid = geom.centroid
    return round_coord(centroid.y), round_coord(centroid.x)


def clean_text(value) -> str:
    if value is None:
        return ""
    return str(value).strip()


def convert(source: Path, output_dir: Path) -> None:
    reader = shapefile.Reader(str(source))
    field_names = [field[0] for field in reader.fields[1:]]
    field_index = {name: idx for idx, name in enumerate(field_names)}

    municipality_features: list[dict] = []
    geometries_by_project: dict[str, list] = defaultdict(list)
    project_meta: dict[str, dict] = {}
    project_ids: set[str] = set()

    for shp, record in zip(reader.iterShapes(), reader.iterRecords(), strict=True):
        raw_geometry = shape_to_geojson_geometry(shp)
        if raw_geometry is None:
            continue

        geometry = reproject_geometry(raw_geometry)
        no_proyect = clean_text(record[field_index["No_Proyect"]])
        project_ids.add(no_proyect)
        props = {
            "noProyect": no_proyect,
            "nombre": clean_text(record[field_index["Nombre"]]),
            "empresa": clean_text(record[field_index["Empresa"]]),
            "segmento": clean_text(record[field_index["Segmento_"]]),
            "gerente": clean_text(record[field_index["Gerente"]]),
            "tipo": clean_text(record[field_index["Tipo"]]),
            "municipio": clean_text(record[field_index["NOMB_MPIO"]]),
            "departamento": clean_text(record[field_index["NOM_DEP"]]),
            "codDane": clean_text(record[field_index["COD_DANE"]]),
        }
        project_meta[no_proyect] = {
            "noProyect": props["noProyect"],
            "nombre": props["nombre"],
            "empresa": props["empresa"],
            "segmento": props["segmento"],
            "gerente": props["gerente"],
            "tipo": props["tipo"],
        }

        geom = shape(geometry)
        if not geom.is_valid:
            geom = make_valid(geom)
        geometries_by_project[no_proyect].append(geom)

        centroid = geometry_centroid_wgs84(geometry)
        if centroid:
            lat, lng = centroid
            municipality_features.append(
                {
                    "type": "Feature",
                    "properties": props,
                    "geometry": {"type": "Point", "coordinates": [lng, lat]},
                }
            )

    sorted_projects = sorted(project_ids, key=lambda value: (len(value), value))
    color_by_project = {
        project_id: PROJECT_PALETTE[index % len(PROJECT_PALETTE)]
        for index, project_id in enumerate(sorted_projects)
    }

    for feature in municipality_features:
        feature["properties"]["color"] = color_by_project[feature["properties"]["noProyect"]]

    area_features: list[dict] = []
    centers: list[dict] = []

    for no_proyect in sorted_projects:
        geoms = geometries_by_project[no_proyect]
        if not geoms:
            continue

        merged = unary_union(geoms)
        area_geom = merged.convex_hull.simplify(0.002, preserve_topology=True)
        color = color_by_project[no_proyect]
        meta = project_meta[no_proyect]
        centroid = area_geom.centroid

        area_features.append(
            {
                "type": "Feature",
                "properties": {**meta, "color": color, "municipios": len(geoms)},
                "geometry": mapping(area_geom),
            }
        )
        centers.append(
            {
                **meta,
                "color": color,
                "latitude": round_coord(centroid.y),
                "longitude": round_coord(centroid.x),
                "municipios": len(geoms),
            }
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    areas_path = output_dir / "proyectos-wsp-2026-areas.geojson"
    municipios_path = output_dir / "proyectos-wsp-2026-municipios.geojson"
    centers_path = output_dir / "proyectos-wsp-2026-centros.json"

    with areas_path.open("w", encoding="utf-8") as handle:
        json.dump(
            {"type": "FeatureCollection", "name": "Proyectos_WSP_2026_areas", "features": area_features},
            handle,
            ensure_ascii=False,
            separators=(",", ":"),
        )
    with municipios_path.open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "type": "FeatureCollection",
                "name": "Proyectos_WSP_2026_municipios",
                "features": municipality_features,
            },
            handle,
            ensure_ascii=False,
            separators=(",", ":"),
        )
    with centers_path.open("w", encoding="utf-8") as handle:
        json.dump(centers, handle, ensure_ascii=False, indent=2)

    sample = centers[0] if centers else {}
    print(f"Projects: {len(centers)} | Municipalities: {len(municipality_features)}")
    print(f"Sample center: {sample.get('nombre')} -> lat={sample.get('latitude')} lng={sample.get('longitude')}")
    print(f"Areas: {areas_path} ({areas_path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    source_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT_DIR
    convert(source_path, out_dir)
