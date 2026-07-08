"""Generate territory catalog for filters and news matching."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NEWS_PATH = ROOT / "public/data/noticias-interes.json"
CENTROS_PATH = ROOT / "public/maps/colombia/proyectos-wsp-2026-centros.json"
MUNICIPIOS_PATH = ROOT / "public/maps/colombia/proyectos-wsp-2026-municipios.geojson"
RISK_PATH = ROOT / "public/maps/colombia/niveles-riesgo-2026.geojson"
OUT_PATH = ROOT / "src/shared/constants/territory-catalog.generated.ts"


def slug(value: str) -> str:
    text = (
        value.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ñ", "n")
    )
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def normalize_key(value: str) -> str:
    import unicodedata

    text = unicodedata.normalize("NFD", value)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    return re.sub(r"\s+", " ", text).strip()


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def main() -> None:
    news = json.loads(NEWS_PATH.read_text(encoding="utf-8"))["items"]
    centros = json.loads(CENTROS_PATH.read_text(encoding="utf-8"))
    municipios = json.loads(MUNICIPIOS_PATH.read_text(encoding="utf-8"))["features"]
    risk = json.loads(RISK_PATH.read_text(encoding="utf-8"))["features"]

    dept_by_key: dict[str, str] = {}
    muni_by_key: dict[str, dict[str, str]] = defaultdict(dict)

    for item in news:
        if item.get("departmentKey") and item.get("department"):
            dept_by_key[item["departmentKey"]] = item["department"].strip()
        if item.get("municipalityKey") and item.get("municipality") and item.get("departmentKey"):
            muni_by_key[item["departmentKey"]][item["municipalityKey"]] = item["municipality"].strip()

    muni_coords: dict[str, dict[str, float]] = {}
    for feature in risk:
        props = feature.get("properties") or {}
        dept = str(props.get("DPTO") or props.get("departamento") or "").strip()
        muni = str(props.get("MPIO") or props.get("municipio") or "").strip()
        if not dept or not muni:
            continue
        dept_key = normalize_key(dept)
        muni_key = normalize_key(muni)
        geom = feature.get("geometry") or {}
        coords = geom.get("coordinates")
        if not coords:
            continue

        def ring_center(ring: list) -> tuple[float, float]:
            lngs = [pt[0] for pt in ring]
            lats = [pt[1] for pt in ring]
            return sum(lats) / len(lats), sum(lngs) / len(lngs)

        if geom.get("type") == "Polygon":
            lat, lng = ring_center(coords[0])
        elif geom.get("type") == "MultiPolygon":
            ring = coords[0][0]
            lat, lng = ring_center(ring)
        else:
            continue
        muni_coords.setdefault(dept_key, {})[muni_key] = {"latitude": lat, "longitude": lng}

    project_departments: dict[str, set[str]] = defaultdict(set)
    for feature in municipios:
        props = feature["properties"]
        project_id = f"project-{props['noProyect']}"
        dept_name = str(props.get("departamento") or "").strip()
        if dept_name:
            project_departments[project_id].add(normalize_key(dept_name))

    departments = [
        {
            "id": f"dept-{slug(key)}",
            "label": label,
            "departmentKey": key,
            "countryCode": "CO",
        }
        for key, label in sorted(dept_by_key.items(), key=lambda item: item[1])
    ]

    municipalities: list[dict] = []
    for dept_key, munis in sorted(muni_by_key.items()):
        dept_label = dept_by_key.get(dept_key, dept_key)
        for muni_key, muni_label in sorted(munis.items(), key=lambda item: item[1]):
            coords = muni_coords.get(dept_key, {}).get(muni_key, {})
            municipalities.append(
                {
                    "id": f"muni-{slug(muni_key)}",
                    "label": muni_label,
                    "municipalityKey": muni_key,
                    "departmentKey": dept_key,
                    "departmentLabel": dept_label,
                    "countryCode": "CO",
                    "latitude": coords.get("latitude", 4.57),
                    "longitude": coords.get("longitude", -75.5),
                }
            )

    projects = []
    for centro in centros:
        project_id = f"project-{centro['noProyect']}"
        projects.append(
            {
                "id": project_id,
                "label": centro["nombre"].strip() or f"Proyecto {centro['noProyect']}",
                "noProyect": centro["noProyect"],
                "countryCode": "CO",
                "latitude": centro["latitude"],
                "longitude": centro["longitude"],
                "departmentKeys": sorted(project_departments.get(project_id, set())),
            }
        )

    dept_primary_project: dict[str, str] = {}
    for project in projects:
        for dept_key in project["departmentKeys"]:
            dept_primary_project.setdefault(dept_key, project["id"])

    seed_departments = []
    for dept in departments:
        seed_departments.append(
            {
                "id": dept["id"],
                "name": dept["label"],
                "departmentKey": dept["departmentKey"],
                "projectId": dept_primary_project.get(dept["departmentKey"], projects[0]["id"] if projects else ""),
                "countryCode": "CO",
            }
        )

    project_hints = {
        project["id"]: project["departmentKeys"] for project in projects if project["departmentKeys"]
    }

    lines = [
        "// Auto-generated by scripts/generate-territory-catalog.py — do not edit manually.",
        "",
        "export interface TerritoryDepartment {",
        "  id: string",
        "  label: string",
        "  departmentKey: string",
        "  countryCode: string",
        "}",
        "",
        "export interface TerritoryMunicipality {",
        "  id: string",
        "  label: string",
        "  municipalityKey: string",
        "  departmentKey: string",
        "  departmentLabel: string",
        "  countryCode: string",
        "  latitude: number",
        "  longitude: number",
        "}",
        "",
        "export interface TerritoryProject {",
        "  id: string",
        "  label: string",
        "  noProyect: string",
        "  countryCode: string",
        "  latitude: number",
        "  longitude: number",
        "  departmentKeys: string[]",
        "}",
        "",
        f"export const TERRITORY_DEPARTMENTS: TerritoryDepartment[] = {json.dumps(departments, ensure_ascii=False, indent=2)}",
        "",
        f"export const TERRITORY_MUNICIPALITIES: TerritoryMunicipality[] = {json.dumps(municipalities, ensure_ascii=False, indent=2)}",
        "",
        f"export const TERRITORY_PROJECTS: TerritoryProject[] = {json.dumps(projects, ensure_ascii=False, indent=2)}",
        "",
        f"export const PROJECT_DEPARTMENT_KEYS: Record<string, string[]> = {json.dumps(project_hints, ensure_ascii=False, indent=2)}",
        "",
        f"export const DEPARTMENT_PRIMARY_PROJECT: Record<string, string> = {json.dumps(dept_primary_project, ensure_ascii=False, indent=2)}",
        "",
    ]

    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(f"  departments: {len(departments)}")
    print(f"  municipalities: {len(municipalities)}")
    print(f"  projects: {len(projects)}")


if __name__ == "__main__":
    main()
