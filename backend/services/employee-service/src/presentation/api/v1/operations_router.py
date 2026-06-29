from typing import Any

from uuid import uuid4



from fastapi import APIRouter, HTTPException

from pydantic import BaseModel, Field



from infrastructure.seed.operations_seed import PLANTS, ROUTES, WORK_SITES



router = APIRouter(prefix="/operations", tags=["operations"])





class CoordinatePoint(BaseModel):

    lat: float

    lng: float





class PlantRequest(BaseModel):

    name: str

    code: str | None = None

    latitude: float

    longitude: float

    address: str = ""

    description: str | None = None

    isPrimary: bool = False

    active: bool = True





class WorkSiteRequest(BaseModel):

    name: str

    plantId: str

    zoneId: str

    description: str | None = None

    latitude: float

    longitude: float

    active: bool = True





class RouteRequest(BaseModel):

    name: str

    plantId: str

    workSiteId: str

    zoneId: str

    color: str = "#3b82f6"

    coordinates: list[CoordinatePoint] = Field(default_factory=list)

    estimatedMinutes: int | None = None

    roadSnapped: bool = False

    active: bool = True





def _slug_code(name: str) -> str:

    base = "".join(ch if ch.isalnum() else "-" for ch in name.strip().upper()).strip("-")

    return (base[:12] or "PLT")





def _clear_primary_plants(except_id: str | None = None) -> None:

    for index, item in enumerate(PLANTS):

        if except_id and item["id"] == except_id:

            continue

        if item.get("isPrimary"):

            PLANTS[index] = {**item, "isPrimary": False}





def _plant_payload(body: PlantRequest, plant_id: str | None = None) -> dict[str, Any]:

    payload = body.model_dump(exclude_none=True)

    if plant_id:
        existing = next((item for item in PLANTS if item["id"] == plant_id), None)
        if existing and not payload.get("code"):
            payload["code"] = existing.get("code") or _slug_code(body.name)
    elif not payload.get("code"):
        payload["code"] = _slug_code(body.name)

    if body.isPrimary:

        _clear_primary_plants(plant_id)

    return payload





@router.get("/plants", summary="List plants")

async def list_plants() -> list[dict[str, Any]]:

    return PLANTS





@router.post("/plants", summary="Create plant")

async def create_plant(body: PlantRequest) -> dict[str, Any]:

    plant = {"id": str(uuid4()), **_plant_payload(body)}

    PLANTS.append(plant)

    return plant





@router.get("/plants/{plant_id}", summary="Get plant")

async def get_plant(plant_id: str) -> dict[str, Any]:

    for item in PLANTS:

        if item["id"] == plant_id:

            return item

    raise HTTPException(status_code=404, detail="Plant not found")





@router.put("/plants/{plant_id}", summary="Update plant")

async def update_plant(plant_id: str, body: PlantRequest) -> dict[str, Any]:

    for index, item in enumerate(PLANTS):

        if item["id"] == plant_id:

            PLANTS[index] = {"id": plant_id, **_plant_payload(body, plant_id)}

            return PLANTS[index]

    raise HTTPException(status_code=404, detail="Plant not found")





@router.delete("/plants/{plant_id}", summary="Delete plant")

async def delete_plant(plant_id: str) -> dict[str, str]:

    for index, item in enumerate(PLANTS):

        if item["id"] == plant_id:

            if any(route.get("plantId") == plant_id for route in ROUTES):

                raise HTTPException(

                    status_code=409,

                    detail="Cannot delete plant with associated routes",

                )

            PLANTS.pop(index)

            return {"status": "deleted"}

    raise HTTPException(status_code=404, detail="Plant not found")





@router.get("/sites", summary="List work sites")

async def list_sites() -> list[dict[str, Any]]:

    return WORK_SITES





@router.post("/sites", summary="Create work site")

async def create_site(body: WorkSiteRequest) -> dict[str, Any]:

    if not any(item["id"] == body.plantId for item in PLANTS):

        raise HTTPException(status_code=400, detail="Plant not found")

    site = {"id": str(uuid4()), **body.model_dump(exclude_none=True)}

    WORK_SITES.append(site)

    return site





@router.get("/sites/{site_id}", summary="Get work site")

async def get_site(site_id: str) -> dict[str, Any]:

    for item in WORK_SITES:

        if item["id"] == site_id:

            return item

    raise HTTPException(status_code=404, detail="Work site not found")





@router.put("/sites/{site_id}", summary="Update work site")

async def update_site(site_id: str, body: WorkSiteRequest) -> dict[str, Any]:

    if not any(item["id"] == body.plantId for item in PLANTS):

        raise HTTPException(status_code=400, detail="Plant not found")

    for index, item in enumerate(WORK_SITES):

        if item["id"] == site_id:

            WORK_SITES[index] = {"id": site_id, **body.model_dump(exclude_none=True)}

            return WORK_SITES[index]

    raise HTTPException(status_code=404, detail="Work site not found")





@router.delete("/sites/{site_id}", summary="Delete work site")

async def delete_site(site_id: str) -> dict[str, str]:

    for index, item in enumerate(WORK_SITES):

        if item["id"] == site_id:

            if any(route.get("workSiteId") == site_id for route in ROUTES):

                raise HTTPException(

                    status_code=409,

                    detail="Cannot delete work site with associated routes",

                )

            WORK_SITES.pop(index)

            return {"status": "deleted"}

    raise HTTPException(status_code=404, detail="Work site not found")





@router.get("/routes", summary="List operational routes")

async def list_routes() -> list[dict[str, Any]]:

    return ROUTES





@router.post("/routes", summary="Create route")

async def create_route(body: RouteRequest) -> dict[str, Any]:

    if not any(item["id"] == body.plantId for item in PLANTS):

        raise HTTPException(status_code=400, detail="Plant not found")

    if not any(item["id"] == body.workSiteId for item in WORK_SITES):

        raise HTTPException(status_code=400, detail="Work site not found")

    route = {"id": str(uuid4()), **body.model_dump(exclude_none=True)}

    ROUTES.append(route)

    return route





@router.get("/routes/{route_id}", summary="Get route")

async def get_route(route_id: str) -> dict[str, Any]:

    for item in ROUTES:

        if item["id"] == route_id:

            return item

    raise HTTPException(status_code=404, detail="Route not found")





@router.put("/routes/{route_id}", summary="Update route")

async def update_route(route_id: str, body: RouteRequest) -> dict[str, Any]:

    if not any(item["id"] == body.plantId for item in PLANTS):

        raise HTTPException(status_code=400, detail="Plant not found")

    if not any(item["id"] == body.workSiteId for item in WORK_SITES):

        raise HTTPException(status_code=400, detail="Work site not found")

    for index, item in enumerate(ROUTES):

        if item["id"] == route_id:

            ROUTES[index] = {"id": route_id, **body.model_dump(exclude_none=True)}

            return ROUTES[index]

    raise HTTPException(status_code=404, detail="Route not found")





@router.delete("/routes/{route_id}", summary="Delete route")

async def delete_route(route_id: str) -> dict[str, str]:

    for index, item in enumerate(ROUTES):

        if item["id"] == route_id:

            ROUTES.pop(index)

            return {"status": "deleted"}

    raise HTTPException(status_code=404, detail="Route not found")


