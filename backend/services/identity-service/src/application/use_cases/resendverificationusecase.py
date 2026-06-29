from datetime import datetime, timedelta, timezone
from uuid import UUID

from application.dtos.resendverificationdto import ResendVerificationDTO
from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.emailservice import EmailService
from application.interfaces.userrepository import UserRepository
from core.config import Settings
from domain.entities.emailverificationtoken import EmailVerificationToken
from infrastructure.security.tokenhasher import generate_secure_token, hash_token


class ResendVerificationUseCase:
    def __init__(
        self,
        settings: Settings,
        user_repository: UserRepository,
        email_verification_token_repository: EmailVerificationTokenRepository,
        email_service: EmailService,
    ) -> None:
        self._settings = settings
        self._user_repository = user_repository
        self._email_verification_token_repository = email_verification_token_repository
        self._email_service = email_service

    async def execute(self, tenant_id: UUID, dto: ResendVerificationDTO) -> None:
        user = await self._user_repository.find_by_email(tenant_id, dto.email)
        if user is None or user.email_verified:
            return
        raw_token = generate_secure_token()
        token_entity = EmailVerificationToken(
            tenant_id=tenant_id,
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(hours=self._settings.verification_token_expire_hours),
        )
        await self._email_verification_token_repository.save(token_entity)
        await self._email_service.send_verification_email(user.email, raw_token)
