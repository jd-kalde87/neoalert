from fastapi import APIRouter

router = APIRouter(prefix="/locations", tags=["location-service"])

@router.post("/traces", summary="Record location trace")
async def record_trace() -> dict[str, str]:
    return {"status": "ok", "endpoint": "record_trace"}

@router.get("/last/{employee_id}", summary="Last known location")
async def last_location() -> dict[str, str]:
    return {"status": "ok", "endpoint": "last_location"}

@router.get("/geofences", summary="List geofences")
async def list_geofences() -> dict[str, str]:
    return {"status": "ok", "endpoint": "list_geofences"}

@router.get("/heatmap", summary="Heatmap data")
async def heatmap_data() -> dict[str, str]:
    return {"status": "ok", "endpoint": "heatmap_data"}
