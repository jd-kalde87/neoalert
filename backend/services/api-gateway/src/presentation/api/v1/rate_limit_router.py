from fastapi import APIRouter

router = APIRouter(prefix="/rate-limit", tags=["rate-limit"])


@router.get("/status")
async def rate_limit_status() -> dict[str, str]:
    return {"status": "ok", "message": "Rate limiting hooks configured"}
