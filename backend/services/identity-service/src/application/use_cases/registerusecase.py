import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from application.dtos.registerdto import RegisterDTO
from application.dtos.registerresult import RegisterResult
from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.emailservice import EmailService
from application.interfaces.userrepository import UserRepository
from core.config import Settings
from domain.entities.emailverificationtoken import EmailVerificationToken
from domain.entities.user import User
from domain.exceptions.domain_exception import ConflictError
from infrastructure.security.passwordhasher import PasswordHasher
from infrastructure.security.tokenhasher import generate_secure_token, hash_token

logger = logging.getLogger(__name__)


class RegisterUseCase:
    def __init__(
        self,
        settings: Settings,
        user_repository: UserRepository,
        email_verification_token_repository: EmailVerificationTokenRepository,
        email_service: EmailService,
        password_hasher: PasswordHasher,
    ) -> None:
        self._settings = settings
        self._user_repository = user_repository
        self._email_verification_token_repository = email_verification_token_repository
        self._email_service = email_service
        self._password_hasher = password_hasher

    async def execute(self, tenant_id: UUID, dto: RegisterDTO) -> RegisterResult:
        existing = await self._user_repository.find_by_email(tenant_id, dto.email)
        if existing:
            raise ConflictError("Email already registered")
        if dto.username:
            existing_username = await self._user_repository.find_by_username(tenant_id, dto.username)
            if existing_username:
                raise ConflictError("Username already taken")
        user = User(
            tenant_id=tenant_id,
            email=dto.email.lower(),
            hashed_password=self._password_hasher.hash(dto.password),
            full_name=dto.full_name,
            username=dto.username,
            email_verified=False,
        )
        saved = await self._user_repository.save(user)
        raw_token = generate_secure_token()
        token_entity = EmailVerificationToken(
            tenant_id=tenant_id,
            user_id=saved.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(hours=self._settings.verification_token_expire_hours),
        )
        await self._email_verification_token_repository.save(token_entity)

        verification_email_sent = True
        warning: str | None = None
        try:
            await self._email_service.send_verification_email(saved.email, raw_token)
        except Exception:
            verification_email_sent = False
            warning = (
                "Account created but the verification email could not be sent. "
                "Try POST /auth/resend-verification or check identity-service logs."
            )
            logger.error(
                "Verification email failed for %s (adapter=%s, smtp=%s:%s)",
                saved.email,
                self._settings.email_adapter,
                self._settings.smtp_host,
                self._settings.smtp_port,
            )

        return RegisterResult(
            user=saved,
            verification_email_sent=verification_email_sent,
            warning=warning,
        )
