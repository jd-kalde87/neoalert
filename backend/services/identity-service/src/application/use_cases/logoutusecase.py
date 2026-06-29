from application.dtos.logoutdto import LogoutDTO
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from domain.exceptions.domain_exception import AuthenticationError
from infrastructure.security.tokenhasher import hash_token


class LogoutUseCase:
    def __init__(self, refresh_token_repository: RefreshTokenRepository) -> None:
        self._refresh_token_repository = refresh_token_repository

    async def execute(self, dto: LogoutDTO) -> None:
        stored = await self._refresh_token_repository.find_by_hash(hash_token(dto.refresh_token))
        if stored is None:
            raise AuthenticationError("Invalid refresh token")
        await self._refresh_token_repository.revoke(stored.id)
