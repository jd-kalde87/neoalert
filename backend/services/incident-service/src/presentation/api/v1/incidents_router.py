from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from infrastructure.seed.incidents_seed import INCIDENTS

router = APIRouter(prefix="/incidents", tags=["incident-service"])


class CreateIncidentRequest(BaseModel):
    title: str
    description: str
    type: str
    severity: str
    source: str
    location: str
    latitude: float
    longitude: float
    blocksTransit: bool = False
    routeName: str | None = None
    targetWorkSite: str | None = None
    reportedBy: str | None = None


class UpdateStatusRequest(BaseModel):
    status: str
    note: str | None = None


def _filter_incidents(
    zone_id: str | None,
    site_id: str | None,
    severity: str | None,
    status: str | None,
    search: str | None,
) -> list[dict[str, Any]]:
    items = INCIDENTS
    if zone_id:
        items = [item for item in items if item.get("zoneId") == zone_id]
    if site_id:
        items = [item for item in items if item.get("siteId") == site_id]
    if severity:
        items = [item for item in items if item.get("severity") == severity]
    if status:
        items = [item for item in items if item.get("status") == status]
    if search:
        term = search.lower()
        items = [
            item
            for item in items
            if term
            in f"{item['code']} {item['title']} {item['location']} {item.get('routeName', '')}".lower()
        ]
    return sorted(items, key=lambda item: item["updatedAt"], reverse=True)


@router.get("", summary="List incidents")
async def list_incidents(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _filter_incidents(zoneId, siteId, severity, status, search)


@router.post("", summary="Create incident")
async def create_incident(body: CreateIncidentRequest) -> dict[str, Any]:
    next_number = len(INCIDENTS) + 1
    incident_id = f"inc-{next_number:03d}"
    incident = {
        "id": incident_id,
        "code": f"SEG-{next_number:03d}",
        "title": body.title,
        "description": body.description,
        "type": body.type,
        "severity": body.severity,
        "status": "open",
        "source": body.source,
        "location": body.location,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "blocksTransit": body.blocksTransit,
        "routeName": body.routeName,
        "targetWorkSite": body.targetWorkSite,
        "reportedBy": body.reportedBy,
        "reportedAt": "2026-06-28T12:00:00Z",
        "updatedAt": "2026-06-28T12:00:00Z",
        "timeline": [
            {
                "id": str(uuid4()),
                "timestamp": "2026-06-28T12:00:00Z",
                "actor": body.reportedBy or body.source,
                "action": "Incidente registrado",
            }
        ],
    }
    INCIDENTS.insert(0, incident)
    return incident


@router.get("/geo/search", summary="Geographic query")
async def geo_search(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, Any]:
    incidents = _filter_incidents(zoneId, siteId, None, None, None)
    return {"incidents": incidents, "total": len(incidents)}


@router.get("/{incident_id}", summary="Get incident")
async def get_incident(incident_id: str) -> dict[str, Any]:
    for item in INCIDENTS:
        if item["id"] == incident_id:
            return item
    raise HTTPException(status_code=404, detail="Incident not found")


@router.patch("/{incident_id}/status", summary="Update status")
async def update_status(incident_id: str, body: UpdateStatusRequest) -> dict[str, Any]:
    for item in INCIDENTS:
        if item["id"] == incident_id:
            item["status"] = body.status
            item["updatedAt"] = "2026-06-28T12:00:00Z"
            item["timeline"].append(
                {
                    "id": str(uuid4()),
                    "timestamp": "2026-06-28T12:00:00Z",
                    "actor": "Supervisor",
                    "action": "Estado actualizado",
                    "note": body.note,
                }
            )
            return item
    raise HTTPException(status_code=404, detail="Incident not found")
