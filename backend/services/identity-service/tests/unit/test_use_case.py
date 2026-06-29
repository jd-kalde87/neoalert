from uuid import uuid4

import pytest

from application.dtos.logindto import LoginDTO
from application.dtos.registerdto import RegisterDTO
from application.services.tokenissuer import TokenIssuer
from application.use_cases.loginusecase import LoginUseCase
from application.use_cases.registerusecase import RegisterUseCase
from core.config import Settings
from domain.entities.permission import Permission
from domain.entities.role import Role
from domain.entities.user import User
from domain.exceptions.domain_exception import AuthenticationError, ConflictError
from infrastructure.repositories.in_memory_permissionrepository import InMemoryPermissionRepository
from infrastructure.repositories.in_memory_refreshtokenrepository import InMemoryRefreshTokenRepository
from infrastructure.repositories.in_memory_rolerepository import InMemoryRoleRepository
from infrastructure.repositories.in_memory_unitofwork import build_in_memory_unit_of_work
from infrastructure.security.jwtservice import JwtService
from infrastructure.security.passwordhasher import PasswordHasher


@pytest.mark.asyncio
async def test_login_success_returns_tokens() -> None:
    settings = Settings(storage_backend="memory")
    uow = build_in_memory_unit_of_work(settings)
    password_hasher = PasswordHasher()
    jwt_service = JwtService(settings)
    token_issuer = TokenIssuer(
        settings,
        jwt_service,
        uow.refresh_tokens,
        uow.roles,
        uow.permissions,
    )
    use_case = LoginUseCase(uow.users, password_hasher, token_issuer)
    tenant_id = settings.default_tenant_id
    raw_password = "secret123"
    await uow.users.save(
        User(
            tenant_id=tenant_id,
            email="user@neoalert.com",
            hashed_password=password_hasher.hash(raw_password),
            full_name="Test User",
            email_verified=True,
        )
    )
    result = await use_case.execute(
        tenant_id,
        LoginDTO(email="user@neoalert.com", password=raw_password),
    )
    assert result.access_token
    assert result.refresh_token
    assert result.token_type == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials_raises() -> None:
    settings = Settings(storage_backend="memory")
    uow = build_in_memory_unit_of_work(settings)
    password_hasher = PasswordHasher()
    token_issuer = TokenIssuer(
        settings,
        JwtService(settings),
        uow.refresh_tokens,
        uow.roles,
        uow.permissions,
    )
    use_case = LoginUseCase(uow.users, password_hasher, token_issuer)
    with pytest.raises(AuthenticationError):
        await use_case.execute(
            settings.default_tenant_id,
            LoginDTO(email="missing@neoalert.com", password="wrong"),
        )


@pytest.mark.asyncio
async def test_register_creates_user_and_sends_verification() -> None:
    settings = Settings(storage_backend="memory")
    uow = build_in_memory_unit_of_work(settings)
    password_hasher = PasswordHasher()
    use_case = RegisterUseCase(
        settings,
        uow.users,
        uow.email_verification_tokens,
        uow.email_service,
        password_hasher,
    )
    user = await use_case.execute(
        settings.default_tenant_id,
        RegisterDTO(
            email="new@neoalert.com",
            password="Password123",
            full_name="New User",
            username="newuser",
        ),
    )
    assert user.user.email == "new@neoalert.com"
    assert user.user.email_verified is False
    assert user.verification_email_sent is True
    stored = await uow.users.find_by_email(settings.default_tenant_id, "new@neoalert.com")
    assert stored is not None


@pytest.mark.asyncio
async def test_register_duplicate_email_raises_conflict() -> None:
    settings = Settings(storage_backend="memory")
    uow = build_in_memory_unit_of_work(settings)
    password_hasher = PasswordHasher()
    use_case = RegisterUseCase(
        settings,
        uow.users,
        uow.email_verification_tokens,
        uow.email_service,
        password_hasher,
    )
    dto = RegisterDTO(email="dup@neoalert.com", password="Password123", full_name="Dup")
    await use_case.execute(settings.default_tenant_id, dto)
    with pytest.raises(ConflictError):
        await use_case.execute(settings.default_tenant_id, dto)


@pytest.mark.asyncio
async def test_rbac_effective_permissions_from_roles() -> None:
    settings = Settings(storage_backend="memory")
    uow = build_in_memory_unit_of_work(settings)
    tenant_id = settings.default_tenant_id
    user = await uow.users.save(
        User(
            tenant_id=tenant_id,
            email="rbac@neoalert.com",
            hashed_password="hash",
            full_name="RBAC User",
            email_verified=True,
        )
    )
    permission = await uow.permissions.save(
        Permission(
            code="users:read",
            name="Read users",
            resource="users",
            action="read",
        )
    )
    role = await uow.roles.save(
        Role(tenant_id=tenant_id, code="viewer", name="Viewer")
    )
    await uow.permissions.assign_to_role(role.id, permission.id)
    await uow.roles.assign_to_user(user.id, role.id, None)
    effective = await uow.permissions.list_user_effective_permissions(tenant_id, user.id)
    assert effective == ["users:read"]
