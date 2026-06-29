from datetime import datetime, timezone

from application.dtos.resetpassworddto import ResetPasswordDTO
from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from application.interfaces.userrepository import UserRepository
from domain.exceptions.domain_exception import AuthenticationError, NotFoundError
from infrastructure.security.passwordhasher import PasswordHasher
from infrastructure.security.tokenhasher import hash_token


class ResetPasswordUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        password_reset_token_repository: PasswordResetTokenRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        self._user_repository = user_repository
        self._password_reset_token_repository = password_reset_token_repository
        self._password_hasher = password_hasher

    async def execute(self, dto: ResetPasswordDTO) -> None:
        token = await self._password_reset_token_repository.find_by_hash(hash_token(dto.token))
        if token is None:
            raise NotFoundError("Invalid reset token")
        if token.used_at is not None:
            raise AuthenticationError("Reset token already used")
        if token.expires_at < datetime.now(timezone.utc):
            raise AuthenticationError("Reset token expired")
        user = await self._user_repository.find_by_id(token.tenant_id, token.user_id)
        if user is None:
            raise NotFoundError("User not found")
        user.hashed_password = self._password_hasher.hash(dto.new_password)
        await self._user_repository.update(user)
        await self._password_reset_token_repository.mark_used(token.id)
