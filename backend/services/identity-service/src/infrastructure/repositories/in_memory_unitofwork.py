from dataclasses import dataclass

from application.interfaces.emailservice import EmailService
from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from infrastructure.repositories.in_memory_emailverificationtokenrepository import (
    InMemoryEmailVerificationTokenRepository,
)
from infrastructure.repositories.in_memory_passwordresettokenrepository import (
    InMemoryPasswordResetTokenRepository,
)
from infrastructure.repositories.in_memory_permissionrepository import InMemoryPermissionRepository
from infrastructure.repositories.in_memory_refreshtokenrepository import InMemoryRefreshTokenRepository
from infrastructure.repositories.in_memory_rolerepository import InMemoryRoleRepository
from infrastructure.repositories.in_memory_userrepository import InMemoryUserRepository
from infrastructure.email.factory import build_email_service
from core.config import Settings


@dataclass
class InMemoryUnitOfWork:
    users: UserRepository
    roles: RoleRepository
    permissions: PermissionRepository
    refresh_tokens: RefreshTokenRepository
    email_verification_tokens: EmailVerificationTokenRepository
    password_reset_tokens: PasswordResetTokenRepository
    email_service: EmailService


def build_in_memory_unit_of_work(settings: Settings) -> InMemoryUnitOfWork:
    users = InMemoryUserRepository()
    roles = InMemoryRoleRepository()
    permissions = InMemoryPermissionRepository()
    permissions.bind_role_lookup(roles)
    return InMemoryUnitOfWork(
        users=users,
        roles=roles,
        permissions=permissions,
        refresh_tokens=InMemoryRefreshTokenRepository(),
        email_verification_tokens=InMemoryEmailVerificationTokenRepository(),
        password_reset_tokens=InMemoryPasswordResetTokenRepository(),
        email_service=build_email_service(settings),
    )
