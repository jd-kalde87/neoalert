from datetime import datetime, timezone

from application.dtos.verifyemaildto import VerifyEmailDTO
from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.userrepository import UserRepository
from domain.exceptions.domain_exception import AuthenticationError, NotFoundError
from infrastructure.security.tokenhasher import hash_token


class VerifyEmailUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        email_verification_token_repository: EmailVerificationTokenRepository,
    ) -> None:
        self._user_repository = user_repository
        self._email_verification_token_repository = email_verification_token_repository

    async def execute(self, dto: VerifyEmailDTO) -> None:
        token = await self._email_verification_token_repository.find_by_hash(hash_token(dto.token))
        if token is None:
            raise NotFoundError("Invalid verification token")
        if token.used_at is not None:
            raise AuthenticationError("Verification token already used")
        if token.expires_at < datetime.now(timezone.utc):
            raise AuthenticationError("Verification token expired")
        user = await self._user_repository.find_by_id(token.tenant_id, token.user_id)
        if user is None:
            raise NotFoundError("User not found")
        user.email_verified = True
        await self._user_repository.update(user)
        await self._email_verification_token_repository.mark_used(token.id)
