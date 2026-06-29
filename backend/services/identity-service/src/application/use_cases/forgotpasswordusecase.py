from datetime import datetime, timedelta, timezone
from uuid import UUID

from application.dtos.forgotpassworddto import ForgotPasswordDTO
from application.interfaces.emailservice import EmailService
from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from application.interfaces.userrepository import UserRepository
from core.config import Settings
from domain.entities.passwordresettoken import PasswordResetToken
from infrastructure.security.tokenhasher import generate_secure_token, hash_token


class ForgotPasswordUseCase:
    def __init__(
        self,
        settings: Settings,
        user_repository: UserRepository,
        password_reset_token_repository: PasswordResetTokenRepository,
        email_service: EmailService,
    ) -> None:
        self._settings = settings
        self._user_repository = user_repository
        self._password_reset_token_repository = password_reset_token_repository
        self._email_service = email_service

    async def execute(self, tenant_id: UUID, dto: ForgotPasswordDTO) -> None:
        user = await self._user_repository.find_by_email(tenant_id, dto.email)
        if user is None:
            return
        raw_token = generate_secure_token()
        token_entity = PasswordResetToken(
            tenant_id=tenant_id,
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(hours=self._settings.password_reset_token_expire_hours),
        )
        await self._password_reset_token_repository.save(token_entity)
        await self._email_service.send_password_reset_email(user.email, raw_token)
