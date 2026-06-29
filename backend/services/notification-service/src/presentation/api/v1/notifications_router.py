from typing import Any

from fastapi import APIRouter, HTTPException, Query

from infrastructure.seed.notifications_seed import NOTIFICATIONS

router = APIRouter(prefix="/notifications", tags=["notification-service"])


def _filter_notifications(
    zone_id: str | None,
    site_id: str | None,
    read: str | None,
    severity: str | None,
    type_: str | None,
    search: str | None,
) -> list[dict[str, Any]]:
    items = NOTIFICATIONS
    if zone_id:
        items = [item for item in items if item.get("zoneId") == zone_id]
    if site_id:
        items = [item for item in items if item.get("siteId") == site_id]
    if read == "read":
        items = [item for item in items if item.get("read")]
    if read == "unread":
        items = [item for item in items if not item.get("read")]
    if severity:
        items = [item for item in items if item.get("severity") == severity]
    if type_:
        items = [item for item in items if item.get("type") == type_]
    if search:
        term = search.lower()
        items = [
            item
            for item in items
            if term in f"{item['title']} {item['message']} {item.get('routeName', '')}".lower()
        ]
    return sorted(items, key=lambda item: item["timestamp"], reverse=True)


@router.get("", summary="List notifications")
async def list_notifications(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
    read: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    type: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _filter_notifications(zoneId, siteId, read, severity, type, search)


@router.patch("/{notification_id}/read", summary="Mark notification as read")
async def mark_read(notification_id: str) -> dict[str, Any]:
    for item in NOTIFICATIONS:
        if item["id"] == notification_id:
            item["read"] = True
            return item
    raise HTTPException(status_code=404, detail="Notification not found")


@router.post("/send", summary="Send notification")
async def send_notification() -> dict[str, str]:
    return {"status": "ok", "endpoint": "send_notification"}


@router.post("/email", summary="Send email")
async def send_email() -> dict[str, str]:
    return {"status": "ok", "endpoint": "send_email"}


@router.post("/push", summary="Send push notification")
async def send_push() -> dict[str, str]:
    return {"status": "ok", "endpoint": "send_push"}


@router.get("/{notification_id}", summary="Get notification status")
async def get_notification(notification_id: str) -> dict[str, Any]:
    for item in NOTIFICATIONS:
        if item["id"] == notification_id:
            return item
    raise HTTPException(status_code=404, detail="Notification not found")
