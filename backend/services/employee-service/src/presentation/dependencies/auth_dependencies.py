from typing import Annotated

from fastapi import Depends, Header, HTTPException, status


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict[str, str]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    return {"sub": "user-placeholder", "roles": ["user"]}


def require_role(required_role: str):
    async def checker(
        user: Annotated[dict[str, str], Depends(get_current_user)],
    ) -> dict[str, str]:
        if required_role not in user.get("roles", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return checker
