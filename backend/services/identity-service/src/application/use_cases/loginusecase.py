from uuid import UUID

from application.dtos.logindto import LoginDTO
from application.dtos.tokenpairdto import TokenPairDTO
from application.interfaces.userrepository import UserRepository
from application.services.tokenissuer import TokenIssuer
from domain.exceptions.domain_exception import AuthenticationError
from infrastructure.security.passwordhasher import PasswordHasher


class LoginUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        password_hasher: PasswordHasher,
        token_issuer: TokenIssuer,
    ) -> None:
        self._user_repository = user_repository
        self._password_hasher = password_hasher
        self._token_issuer = token_issuer

    async def execute(self, tenant_id: UUID, dto: LoginDTO) -> TokenPairDTO:
        user = None
        if dto.email:
            user = await self._user_repository.find_by_email(tenant_id, dto.email)
        elif dto.username:
            user = await self._user_repository.find_by_username(tenant_id, dto.username)
        if user is None:
            raise AuthenticationError("Invalid credentials")
        if not self._password_hasher.verify(dto.password, user.hashed_password):
            if user.google_id is not None:
                raise AuthenticationError("Use Google sign-in for this account")
            raise AuthenticationError("Invalid credentials")
        if not user.is_active:
            raise AuthenticationError("Account is inactive")
        if not user.email_verified:
            raise AuthenticationError("Email not verified")
        return await self._token_issuer.issue_for_user(user)
