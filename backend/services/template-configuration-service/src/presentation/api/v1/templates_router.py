from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from infrastructure.seed.templates_seed import TEMPLATES

router = APIRouter(prefix="/import-templates", tags=["template-configuration-service"])


class TemplateField(BaseModel):
    key: str
    label: str
    required: bool = False


class UpsertTemplateRequest(BaseModel):
    name: str
    description: str
    entity: str
    active: bool = True
    fields: list[TemplateField]


@router.get("", summary="List import templates")
async def list_templates() -> list[dict[str, Any]]:
    return TEMPLATES


@router.post("", summary="Create import template")
async def create_template(body: UpsertTemplateRequest) -> dict[str, Any]:
    template = {
        "id": str(uuid4()),
        "name": body.name,
        "description": body.description,
        "version": "1.0",
        "active": body.active,
        "entity": body.entity,
        "fields": [field.model_dump() for field in body.fields],
        "updatedAt": "2026-06-28T12:00:00Z",
    }
    TEMPLATES.insert(0, template)
    return template


@router.get("/{template_id}", summary="Get template")
async def get_template(template_id: str) -> dict[str, Any]:
    for item in TEMPLATES:
        if item["id"] == template_id:
            return item
    raise HTTPException(status_code=404, detail="Template not found")


@router.put("/{template_id}", summary="Update template")
async def update_template(template_id: str, body: UpsertTemplateRequest) -> dict[str, Any]:
    for index, item in enumerate(TEMPLATES):
        if item["id"] == template_id:
            major = int(str(item.get("version", "1.0")).split(".")[0])
            updated = {
                **item,
                "name": body.name,
                "description": body.description,
                "entity": body.entity,
                "active": body.active,
                "fields": [field.model_dump() for field in body.fields],
                "version": f"{major + 1}.0",
                "updatedAt": "2026-06-28T12:00:00Z",
            }
            TEMPLATES[index] = updated
            return updated
    raise HTTPException(status_code=404, detail="Template not found")


@router.get("/{template_id}/versions", summary="List template versions")
async def list_versions(template_id: str) -> list[dict[str, Any]]:
    template = await get_template(template_id)
    return [{"version": template["version"], "updatedAt": template["updatedAt"]}]
