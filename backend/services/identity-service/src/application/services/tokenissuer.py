from datetime import datetime, timedelta, timezone
from uuid import UUID

from application.dtos.tokenpairdto import TokenPairDTO
from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from application.interfaces.rolerepository import RoleRepository
from core.config import Settings
from domain.entities.refreshtoken import RefreshToken
from domain.entities.user import User
from infrastructure.security.jwtservice import JwtService
from infrastructure.security.tokenhasher import generate_secure_token, hash_token


class TokenIssuer:
    def __init__(
        self,
        settings: Settings,
        jwt_service: JwtService,
        refresh_token_repository: RefreshTokenRepository,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ) -> None:
        self._settings = settings
        self._jwt_service = jwt_service
        self._refresh_token_repository = refresh_token_repository
        self._role_repository = role_repository
        self._permission_repository = permission_repository

    async def issue_for_user(self, user: User) -> TokenPairDTO:
        role_codes = await self._role_repository.list_user_role_codes(user.tenant_id, user.id)
        if user.is_superadmin or "admin" in role_codes:
            permissions = [p.code for p in await self._permission_repository.list_all()]
        else:
            permissions = await self._permission_repository.list_user_effective_permissions(
                user.tenant_id, user.id
            )
        access_token, expires_in = self._jwt_service.create_access_token(
            user.id,
            user.tenant_id,
            user.email,
            permissions,
            role_codes,
        )
        raw_refresh = generate_secure_token()
        refresh_entity = RefreshToken(
            tenant_id=user.tenant_id,
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=self._settings.jwt_refresh_token_expire_days),
        )
        await self._refresh_token_repository.save(refresh_entity)
        return TokenPairDTO(
            access_token=access_token,
            refresh_token=raw_refresh,
            expires_in=expires_in,
        )
