from typing import Any

from fastapi import APIRouter, Query

router = APIRouter(prefix="/maps", tags=["maps"])


@router.get("/incidents", summary="Map incidents data")
async def map_incidents(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, Any]:
    incidents: list[dict[str, Any]] = []
    if zoneId:
        incidents = [item for item in incidents if item.get("zoneId") == zoneId]
    if siteId:
        incidents = [item for item in incidents if item.get("siteId") == siteId]
    return {
        "incidents": incidents,
        "summary": {
            "total": len(incidents),
            "bySeverity": {"low": 0, "medium": 0, "high": 0, "critical": 0},
            "byZone": [],
            "blockingRoutes": 0,
        },
    }


@router.get("/heatmap", summary="Heatmap data points")
async def heatmap(
    zoneId: str | None = Query(default=None),
) -> dict[str, Any]:
    return {"points": [], "zoneId": zoneId}
