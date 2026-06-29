from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt

from core.config import Settings


class JwtService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create_access_token(
        self,
        user_id: UUID,
        tenant_id: UUID,
        email: str,
        permissions: list[str],
        role_codes: list[str],
    ) -> tuple[str, int]:
        expires_delta = timedelta(minutes=self._settings.jwt_access_token_expire_minutes)
        expires_at = datetime.now(timezone.utc) + expires_delta
        payload = {
            "sub": str(user_id),
            "tenant_id": str(tenant_id),
            "email": email,
            "permissions": permissions,
            "roles": role_codes,
            "type": "access",
            "exp": expires_at,
        }
        token = jwt.encode(
            payload,
            self._settings.jwt_secret_key,
            algorithm=self._settings.jwt_algorithm,
        )
        return token, int(expires_delta.total_seconds())

    def decode_access_token(self, token: str) -> dict:
        return jwt.decode(
            token,
            self._settings.jwt_secret_key,
            algorithms=[self._settings.jwt_algorithm],
        )
