import secrets
from uuid import UUID

from application.dtos.tokenpairdto import TokenPairDTO
from application.interfaces.userrepository import UserRepository
from application.services.tokenissuer import TokenIssuer
from core.config import Settings
from domain.entities.user import User
from domain.exceptions.domain_exception import ValidationError
from infrastructure.oauth.googleoauthclient import GoogleOAuthClient
from infrastructure.security.passwordhasher import PasswordHasher


class GoogleOAuthUseCase:
    def __init__(
        self,
        settings: Settings,
        user_repository: UserRepository,
        token_issuer: TokenIssuer,
        google_client: GoogleOAuthClient,
        password_hasher: PasswordHasher,
    ) -> None:
        self._settings = settings
        self._user_repository = user_repository
        self._token_issuer = token_issuer
        self._google_client = google_client
        self._password_hasher = password_hasher

    def build_authorization_url(self) -> tuple[str, str]:
        if not self._settings.google_client_id:
            raise ValidationError("Google OAuth is not configured")
        state = secrets.token_urlsafe(16)
        return self._google_client.create_authorization_url(state), state

    async def handle_callback(self, tenant_id: UUID, code: str) -> TokenPairDTO:
        if not self._settings.google_client_id:
            raise ValidationError("Google OAuth is not configured")
        profile = await self._google_client.fetch_user_info(code)
        return await self._authenticate_profile(tenant_id, profile)

    async def handle_id_token(self, tenant_id: UUID, id_token: str) -> TokenPairDTO:
        if not self._settings.google_client_id:
            raise ValidationError("Google OAuth is not configured")
        profile = await self._google_client.verify_id_token(id_token)
        return await self._authenticate_profile(tenant_id, profile)

    async def _authenticate_profile(self, tenant_id: UUID, profile: dict) -> TokenPairDTO:
        google_id = profile.get("sub")
        email = profile.get("email")
        full_name = profile.get("name", "")
        if not google_id or not email:
            raise ValidationError("Google profile incomplete")
        user = await self._user_repository.find_by_google_id(google_id)
        if user is None:
            user = await self._user_repository.find_by_email(tenant_id, email)
        if user is None:
            user = User(
                tenant_id=tenant_id,
                email=email.lower(),
                hashed_password=self._password_hasher.hash(secrets.token_urlsafe(32)),
                full_name=full_name,
                google_id=google_id,
                email_verified=True,
            )
            user = await self._user_repository.save(user)
        else:
            if user.google_id is None:
                user.google_id = google_id
            user.email_verified = True
            user = await self._user_repository.update(user)
        return await self._token_issuer.issue_for_user(user)
