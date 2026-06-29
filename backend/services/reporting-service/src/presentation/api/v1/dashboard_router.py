from typing import Any

from fastapi import APIRouter, Query

from infrastructure.seed.dashboard_seed import DASHBOARD_ALERTS, DASHBOARD_KPIS

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _scale_kpis(zone_id: str | None, site_id: str | None) -> list[dict[str, Any]]:
    multiplier = 1.0
    if zone_id:
        multiplier *= 0.72
    if site_id:
        multiplier *= 0.85
    scaled: list[dict[str, Any]] = []
    for kpi in DASHBOARD_KPIS:
        item = dict(kpi)
        if isinstance(item.get("value"), int):
            item["value"] = max(0, round(item["value"] * multiplier))
        scaled.append(item)
    return scaled


def _filter_alerts(zone_id: str | None, site_id: str | None) -> list[dict[str, Any]]:
    alerts = DASHBOARD_ALERTS
    if zone_id:
        alerts = [item for item in alerts if item.get("zoneId") == zone_id]
    if site_id:
        alerts = [item for item in alerts if item.get("siteId") == site_id]
    return alerts


@router.get("/kpis", summary="Dashboard KPIs")
async def get_dashboard_kpis(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, Any]:
    kpis = _scale_kpis(zoneId, siteId)
    return {"kpis": kpis}


@router.get("/alerts", summary="Dashboard alerts")
async def get_dashboard_alerts(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, Any]:
    alerts = _filter_alerts(zoneId, siteId)
    return {"alerts": alerts}


@router.get("", summary="Dashboard summary")
async def get_dashboard_summary(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, Any]:
    kpis = _scale_kpis(zoneId, siteId)
    alerts = _filter_alerts(zoneId, siteId)
    active_incidents = next(
        (item["value"] for item in kpis if item["id"] == "active-incidents"),
        0,
    )
    return {
        "kpis": kpis,
        "alerts": alerts,
        "mapSummary": {
            "activeIncidents": active_incidents,
            "zonesMonitored": 0,
            "crewsOnField": 0,
        },
    }
