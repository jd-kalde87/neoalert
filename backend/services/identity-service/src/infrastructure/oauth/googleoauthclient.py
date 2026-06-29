import httpx
from authlib.integrations.httpx_client import AsyncOAuth2Client

from core.config import Settings
from domain.exceptions.domain_exception import ValidationError


class GoogleOAuthClient:
    AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
    USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo"
    SCOPES = ["openid", "email", "profile"]

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create_authorization_url(self, state: str) -> str:
        client = AsyncOAuth2Client(
            client_id=self._settings.google_client_id,
            client_secret=self._settings.google_client_secret,
            redirect_uri=self._settings.google_redirect_uri,
        )
        url, _ = client.create_authorization_url(
            self.AUTHORIZATION_ENDPOINT,
            scope=" ".join(self.SCOPES),
            state=state,
        )
        return url

    async def fetch_user_info(self, code: str) -> dict:
        client = AsyncOAuth2Client(
            client_id=self._settings.google_client_id,
            client_secret=self._settings.google_client_secret,
            redirect_uri=self._settings.google_redirect_uri,
        )
        token = await client.fetch_token(self.TOKEN_ENDPOINT, code=code)
        response = await client.get(self.USERINFO_ENDPOINT, token=token)
        response.raise_for_status()
        return response.json()

    async def verify_id_token(self, id_token: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
            )
            if response.status_code != 200:
                raise ValidationError("Invalid Google ID token")
            payload = response.json()
        audience = payload.get("aud")
        if audience != self._settings.google_client_id:
            raise ValidationError("Invalid Google ID token audience")
        if payload.get("email_verified") not in ("true", True):
            raise ValidationError("Google email is not verified")
        return payload
