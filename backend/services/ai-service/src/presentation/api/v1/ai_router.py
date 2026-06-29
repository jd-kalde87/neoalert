from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["ai-service"])

@router.post("/classify", summary="Auto classification")
async def classify() -> dict[str, str]:
    return {"status": "ok", "endpoint": "classify"}

@router.post("/summarize", summary="Generate summary")
async def summarize() -> dict[str, str]:
    return {"status": "ok", "endpoint": "summarize"}

@router.post("/anomaly-detect", summary="Anomaly detection")
async def anomaly_detect() -> dict[str, str]:
    return {"status": "ok", "endpoint": "anomaly_detect"}

@router.post("/narrative", summary="Narrative report")
async def narrative_report() -> dict[str, str]:
    return {"status": "ok", "endpoint": "narrative_report"}
