import httpx
from fastapi import Request, Response


async def proxy_request(request: Request, target_url: str) -> Response:
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length"}
    }
    body = await request.body()
    async with httpx.AsyncClient(timeout=30.0) as client:
        upstream = await client.request(
            request.method,
            target_url,
            headers=headers,
            content=body if body else None,
        )
    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower() not in {"content-encoding", "transfer-encoding", "content-length"}
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )


def build_target(base_url: str, path: str, query: str) -> str:
    target_url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"
    if query:
        target_url = f"{target_url}?{query}"
    return target_url
