from typing import Any

from fastapi import APIRouter, Query

router = APIRouter(prefix="/reports", tags=["reporting-service"])

REPORT_BUILDERS: dict[str, dict[str, Any]] = {
    "attendance": {
        "type": "attendance",
        "title": "Reporte de asistencia en ruta",
        "description": "Marcaciones validadas contra incidentes de seguridad activos.",
    },
    "security-incidents": {
        "type": "security-incidents",
        "title": "Reporte de incidentes de seguridad",
        "description": "Registro de riesgos en vías hacia sitios de trabajo.",
    },
    "route-safety": {
        "type": "route-safety",
        "title": "Reporte de seguridad de rutas",
        "description": "Estado operativo planta central → sitios de trabajo.",
    },
}


@router.get("", summary="List available reports")
async def list_reports() -> list[dict[str, str]]:
    return [
        {"type": key, "title": value["title"]}
        for key, value in REPORT_BUILDERS.items()
    ]


@router.get("/{report_type}", summary="Get report data")
async def get_report(
    report_type: str,
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, Any]:
    base = REPORT_BUILDERS.get(report_type)
    if base is None:
        return {"type": report_type, "title": report_type, "kpis": [], "series": [], "breakdown": []}
    return {
        **base,
        "generatedAt": "2026-06-28T12:00:00Z",
        "kpis": [],
        "series": [],
        "breakdown": [],
    }


@router.post("/{report_type}/export", summary="Export report")
async def export_report(report_type: str, format: str = Query(default="pdf")) -> dict[str, Any]:
    extension = "xlsx" if format == "excel" else format
    return {
        "filename": f"neoalert-{report_type}-export.{extension}",
        "success": True,
    }
