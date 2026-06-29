from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from application.interfaces.emailservice import EmailService
from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from core.config import Settings
from infrastructure.database.engine import init_engine
from infrastructure.email.factory import build_email_service
from infrastructure.repositories.postgres_permissionrepository import PostgresPermissionRepository
from infrastructure.repositories.postgres_rolerepository import PostgresRoleRepository
from infrastructure.repositories.postgres_tokenrepositories import (
    PostgresEmailVerificationTokenRepository,
    PostgresPasswordResetTokenRepository,
    PostgresRefreshTokenRepository,
)
from infrastructure.repositories.postgres_userrepository import PostgresUserRepository


def build_postgres_repositories(settings: Settings) -> tuple[
    UserRepository,
    RoleRepository,
    PermissionRepository,
    RefreshTokenRepository,
    EmailVerificationTokenRepository,
    PasswordResetTokenRepository,
    EmailService,
    async_sessionmaker[AsyncSession],
]:
    init_engine(settings)
    from infrastructure.database.engine import _session_factory

    if _session_factory is None:
        raise RuntimeError("Failed to initialize database session factory")
    session_factory = _session_factory
    email_service = build_email_service(settings)
    return (
        PostgresUserRepository(session_factory),
        PostgresRoleRepository(session_factory),
        PostgresPermissionRepository(session_factory),
        PostgresRefreshTokenRepository(session_factory),
        PostgresEmailVerificationTokenRepository(session_factory),
        PostgresPasswordResetTokenRepository(session_factory),
        email_service,
        session_factory,
    )
