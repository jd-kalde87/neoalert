from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel

from infrastructure.seed.imports_seed import IMPORT_JOBS

router = APIRouter(prefix="/imports", tags=["file-ingestion-service"])


class StartImportRequest(BaseModel):
    fileName: str
    templateId: str
    headers: list[str]
    rows: list[list[str]]
    mappings: list[dict[str, Any]]


@router.get("", summary="List import jobs")
async def list_imports() -> list[dict[str, Any]]:
    return sorted(IMPORT_JOBS, key=lambda item: item["uploadedAt"], reverse=True)


@router.get("/{batch_id}", summary="Get import job")
async def get_import(batch_id: str) -> dict[str, Any]:
    for item in IMPORT_JOBS:
        if item["id"] == batch_id:
            return item
    raise HTTPException(status_code=404, detail="Import job not found")


@router.get("/{batch_id}/errors", summary="Get error log")
async def error_log(batch_id: str) -> list[dict[str, Any]]:
    job = await get_import(batch_id)
    return job.get("errors", [])


@router.post("/upload", summary="Upload file for ingestion")
async def upload_file(file: UploadFile) -> dict[str, Any]:
    job = {
        "id": str(uuid4()),
        "fileName": file.filename or "upload.csv",
        "templateName": "Pendiente de mapeo",
        "templateId": "pending",
        "status": "processing",
        "totalRows": 0,
        "validRows": 0,
        "errorRows": 0,
        "uploadedAt": "2026-06-28T12:00:00Z",
        "uploadedBy": "current-user",
        "mappings": [],
        "errors": [],
    }
    IMPORT_JOBS.insert(0, job)
    return job


@router.post("", summary="Start import from parsed rows")
async def start_import(body: StartImportRequest) -> dict[str, Any]:
    valid_rows = max(0, len(body.rows) - 1)
    job = {
        "id": str(uuid4()),
        "fileName": body.fileName,
        "templateName": body.templateId,
        "templateId": body.templateId,
        "status": "completed",
        "totalRows": len(body.rows),
        "validRows": valid_rows,
        "errorRows": 1 if body.rows else 0,
        "uploadedAt": "2026-06-28T12:00:00Z",
        "completedAt": "2026-06-28T12:00:00Z",
        "uploadedBy": "current-user",
        "mappings": body.mappings,
        "errors": [],
    }
    IMPORT_JOBS.insert(0, job)
    return job
