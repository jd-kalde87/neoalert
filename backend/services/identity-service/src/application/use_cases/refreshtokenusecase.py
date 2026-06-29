from datetime import datetime, timezone

from application.dtos.refreshtokendto import RefreshTokenDTO
from application.dtos.tokenpairdto import TokenPairDTO
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from application.interfaces.userrepository import UserRepository
from application.services.tokenissuer import TokenIssuer
from domain.exceptions.domain_exception import AuthenticationError
from infrastructure.security.tokenhasher import hash_token


class RefreshTokenUseCase:
    def __init__(
        self,
        refresh_token_repository: RefreshTokenRepository,
        user_repository: UserRepository,
        token_issuer: TokenIssuer,
    ) -> None:
        self._refresh_token_repository = refresh_token_repository
        self._user_repository = user_repository
        self._token_issuer = token_issuer

    async def execute(self, dto: RefreshTokenDTO) -> TokenPairDTO:
        stored = await self._refresh_token_repository.find_by_hash(hash_token(dto.refresh_token))
        if stored is None or stored.revoked_at is not None:
            raise AuthenticationError("Invalid refresh token")
        if stored.expires_at < datetime.now(timezone.utc):
            raise AuthenticationError("Refresh token expired")
        user = await self._user_repository.find_by_id(stored.tenant_id, stored.user_id)
        if user is None or not user.is_active:
            raise AuthenticationError("User not found or inactive")
        await self._refresh_token_repository.revoke(stored.id)
        return await self._token_issuer.issue_for_user(user)
