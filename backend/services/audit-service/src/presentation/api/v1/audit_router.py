from typing import Any

from fastapi import APIRouter, HTTPException, Query

from infrastructure.seed.audit_seed import AUDIT_LOGS

router = APIRouter(prefix="/audit", tags=["audit-service"])


def _filter_logs(
    zone_id: str | None,
    site_id: str | None,
    entity: str | None,
    action: str | None,
    outcome: str | None,
    actor: str | None,
    search: str | None,
) -> list[dict[str, Any]]:
    items = AUDIT_LOGS
    if zone_id:
        items = [item for item in items if item.get("zoneId") == zone_id]
    if site_id:
        items = [item for item in items if item.get("siteId") == site_id]
    if entity:
        items = [item for item in items if item.get("entity") == entity]
    if action:
        items = [item for item in items if item.get("action") == action]
    if outcome:
        items = [item for item in items if item.get("outcome") == outcome]
    if actor:
        items = [item for item in items if actor.lower() in item.get("actor", "").lower()]
    if search:
        term = search.lower()
        items = [
            item
            for item in items
            if term
            in f"{item['summary']} {item['entityLabel']} {item['actor']} {item['entityId']}".lower()
        ]
    return sorted(items, key=lambda item: item["timestamp"], reverse=True)


@router.get("", summary="Query audit logs")
async def query_logs(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
    entity: str | None = Query(default=None),
    action: str | None = Query(default=None),
    outcome: str | None = Query(default=None),
    actor: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> list[dict[str, Any]]:
    return _filter_logs(zoneId, siteId, entity, action, outcome, actor, search)


@router.get("/summary", summary="Audit summary metrics")
async def audit_summary(
    zoneId: str | None = Query(default=None),
    siteId: str | None = Query(default=None),
) -> dict[str, int]:
    entries = _filter_logs(zoneId, siteId, None, None, None, None, None)
    return {
        "totalEvents": len(entries),
        "todayEvents": len(entries),
        "criticalActions": len(
            [
                item
                for item in entries
                if item.get("outcome") == "failure" or item.get("action") in {"create", "reject"}
            ]
        ),
        "failedEvents": len([item for item in entries if item.get("outcome") == "failure"]),
    }


@router.get("/logs/{entity_type}/{entity_id}", summary="Entity change history")
async def entity_history(entity_type: str, entity_id: str) -> list[dict[str, Any]]:
    return [
        item
        for item in AUDIT_LOGS
        if item.get("entity") == entity_type and item.get("entityId") == entity_id
    ]


@router.get("/{log_id}", summary="Get audit log entry")
async def get_log(log_id: str) -> dict[str, Any]:
    for item in AUDIT_LOGS:
        if item["id"] == log_id:
            return item
    raise HTTPException(status_code=404, detail="Audit log not found")


@router.post("/logs", summary="Record audit log entry")
async def record_log(payload: dict[str, Any]) -> dict[str, Any]:
    AUDIT_LOGS.insert(0, payload)
    return payload
