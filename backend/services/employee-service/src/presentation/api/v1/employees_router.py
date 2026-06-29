from fastapi import APIRouter

router = APIRouter(prefix="/employees", tags=["employee-service"])

@router.post("", summary="Create employee")
async def create_employee() -> dict[str, str]:
    return {"status": "ok", "endpoint": "create_employee"}

@router.get("/{employee_id}", summary="Get employee")
async def get_employee() -> dict[str, str]:
    return {"status": "ok", "endpoint": "get_employee"}

@router.get("", summary="List employees")
async def list_employees() -> dict[str, str]:
    return {"status": "ok", "endpoint": "list_employees"}

@router.post("/{employee_id}/assignments", summary="Assign to site")
async def assign_site() -> dict[str, str]:
    return {"status": "ok", "endpoint": "assign_site"}
