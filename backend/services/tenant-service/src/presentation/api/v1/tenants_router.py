from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/tenants", tags=["tenant-service"])

TENANTS: list[dict[str, Any]] = [
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "NeoAlert Default",
        "countryCode": "CO",
        "status": "active",
    },
]


@router.get("", summary="List tenants")
async def list_tenants() -> list[dict[str, Any]]:
    return TENANTS


@router.post("", summary="Create tenant")
async def create_tenant() -> dict[str, str]:
    return {"status": "ok", "endpoint": "create_tenant"}


@router.get("/{tenant_id}", summary="Get tenant by ID")
async def get_tenant(tenant_id: str) -> dict[str, Any]:
    for tenant in TENANTS:
        if tenant["id"] == tenant_id:
            return tenant
    return {"id": tenant_id, "name": "Tenant", "status": "active"}
