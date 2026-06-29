from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from infrastructure.seed.attendance_seed import ATTENDANCE_RECORDS

router = APIRouter(prefix="/attendance", tags=["attendance-service"])


class AttendanceMarkRequest(BaseModel):
    markType: str
    routeName: str
    targetWorkSite: str
    siteId: str | None = None
    locationLabel: str
    latitude: float
    longitude: float
    gpsAccuracyMeters: float | None = None
    networkOnline: bool = True
    justification: str | None = None
    forceExceptional: bool = False


def _filter_records(
    zone_id: str | None,
    site_id: str | None,
    status: str | None,
    mark_type: str | None,
    search: str | None,
) -> list[dict[str, Any]]:
    items = ATTENDANCE_RECORDS
    if site_id:
        items = [item for item in items if item.get("siteId") == site_id]
    if status:
        items = [item for item in items if item.get("status") == status]
    if mark_type:
        items = [item for item in items if item.get("markType") == mark_type]
    if search:
        term = search.lower()
        items = [
            item
            for item in items
            if term in f"{item['userName']} {item['routeName']} {item['locationLabel']}".lower()
        ]
    return sorted(items, key=lambda item: item["markedAt"], reverse=True)


@router.get("", summary="List attendance records")
async def list_attendance(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
    status: str | None = Query(default=None),
    markType: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _filter_records(zoneId, siteId, status, markType, search)


@router.get("/history/{employee_id}", summary="Attendance history")
async def get_history(employee_id: str) -> list[dict[str, Any]]:
    return [item for item in ATTENDANCE_RECORDS if item["userId"] == employee_id]


@router.get("/{user_id}", summary="Attendance records by user")
async def get_user_attendance(user_id: str) -> list[dict[str, Any]]:
    return [item for item in ATTENDANCE_RECORDS if item["userId"] == user_id]


@router.post("/mark", summary="Create attendance mark")
async def mark_attendance(body: AttendanceMarkRequest) -> dict[str, Any]:
    record = {
        "id": str(uuid4()),
        "userId": "current-user",
        "userName": "Usuario actual",
        "markType": body.markType,
        "status": "synced" if body.networkOnline else "offline_pending",
        "routeName": body.routeName,
        "targetWorkSite": body.targetWorkSite,
        "siteId": body.siteId,
        "locationLabel": body.locationLabel,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "gpsAccuracyMeters": body.gpsAccuracyMeters,
        "networkOnline": body.networkOnline,
        "markedAt": "2026-06-28T12:00:00Z",
        "justification": body.justification,
        "validation": {
            "allowed": True,
            "level": "clear",
            "message": "Ruta validada",
            "blockingIncidents": [],
            "warningIncidents": [],
        },
    }
    ATTENDANCE_RECORDS.insert(0, record)
    return record


@router.post("/check-in", summary="Register check-in")
async def check_in() -> dict[str, str]:
    return {"status": "ok", "endpoint": "check_in"}


@router.post("/check-out", summary="Register check-out")
async def check_out() -> dict[str, str]:
    return {"status": "ok", "endpoint": "check_out"}


@router.post("/intermediate-exit", summary="Intermediate exit")
async def intermediate_exit() -> dict[str, str]:
    return {"status": "ok", "endpoint": "intermediate_exit"}
