from dataclasses import dataclass

from application.interfaces.emailservice import EmailService
from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from application.interfaces.permissionrepository import PermissionRepository
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from application.services.tokenissuer import TokenIssuer
from application.use_cases.assignmentusecases import (
    AssignPermissionsToRoleUseCase,
    AssignRolesToUserUseCase,
    GetRolePermissionsUseCase,
    GetUserPermissionsUseCase,
    RemovePermissionFromRoleUseCase,
    RemoveRoleFromUserUseCase,
    SetRolePermissionsUseCase,
)
from application.use_cases.forgotpasswordusecase import ForgotPasswordUseCase
from application.use_cases.getcurrentuserusecase import GetCurrentUserUseCase
from application.use_cases.googleoauthusecase import GoogleOAuthUseCase
from application.use_cases.loginusecase import LoginUseCase
from application.use_cases.logoutusecase import LogoutUseCase
from application.use_cases.permissionusecases import (
    CreatePermissionUseCase,
    DeletePermissionUseCase,
    GetPermissionUseCase,
    ListPermissionsUseCase,
    UpdatePermissionUseCase,
)
from application.use_cases.refreshtokenusecase import RefreshTokenUseCase
from application.use_cases.registerusecase import RegisterUseCase
from application.use_cases.resendverificationusecase import ResendVerificationUseCase
from application.use_cases.resetpasswordusecase import ResetPasswordUseCase
from application.use_cases.roleusecases import (
    CreateRoleUseCase,
    DeleteRoleUseCase,
    GetRoleUseCase,
    ListRolesUseCase,
    UpdateRoleUseCase,
)
from application.use_cases.verifyemailusecase import VerifyEmailUseCase
from application.use_cases.userusecases import (
    CreateAdminUserUseCase,
    DeleteUserUseCase,
    GetUserRolesUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateAdminUserUseCase,
)
from core.config import Settings
from infrastructure.oauth.googleoauthclient import GoogleOAuthClient
from infrastructure.repositories.in_memory_unitofwork import build_in_memory_unit_of_work
from infrastructure.repositories.postgres_unitofwork import build_postgres_repositories
from infrastructure.security.jwtservice import JwtService
from infrastructure.security.passwordhasher import PasswordHasher
from infrastructure.seed.seeddata import SeedDataService


@dataclass
class ServiceContainer:
    settings: Settings
    users: UserRepository
    roles: RoleRepository
    permissions: PermissionRepository
    refresh_tokens: RefreshTokenRepository
    email_verification_tokens: EmailVerificationTokenRepository
    password_reset_tokens: PasswordResetTokenRepository
    email_service: EmailService
    password_hasher: PasswordHasher
    jwt_service: JwtService
    token_issuer: TokenIssuer
    seed_service: SeedDataService
    login_use_case: LoginUseCase
    register_use_case: RegisterUseCase
    verify_email_use_case: VerifyEmailUseCase
    resend_verification_use_case: ResendVerificationUseCase
    forgot_password_use_case: ForgotPasswordUseCase
    reset_password_use_case: ResetPasswordUseCase
    refresh_token_use_case: RefreshTokenUseCase
    logout_use_case: LogoutUseCase
    google_oauth_use_case: GoogleOAuthUseCase
    get_current_user_use_case: GetCurrentUserUseCase
    list_roles_use_case: ListRolesUseCase
    create_role_use_case: CreateRoleUseCase
    get_role_use_case: GetRoleUseCase
    update_role_use_case: UpdateRoleUseCase
    delete_role_use_case: DeleteRoleUseCase
    list_permissions_use_case: ListPermissionsUseCase
    create_permission_use_case: CreatePermissionUseCase
    get_permission_use_case: GetPermissionUseCase
    update_permission_use_case: UpdatePermissionUseCase
    delete_permission_use_case: DeletePermissionUseCase
    assign_permissions_to_role_use_case: AssignPermissionsToRoleUseCase
    remove_permission_from_role_use_case: RemovePermissionFromRoleUseCase
    assign_roles_to_user_use_case: AssignRolesToUserUseCase
    remove_role_from_user_use_case: RemoveRoleFromUserUseCase
    get_user_permissions_use_case: GetUserPermissionsUseCase
    get_role_permissions_use_case: GetRolePermissionsUseCase
    set_role_permissions_use_case: SetRolePermissionsUseCase
    list_users_use_case: ListUsersUseCase
    get_user_use_case: GetUserUseCase
    create_admin_user_use_case: CreateAdminUserUseCase
    update_admin_user_use_case: UpdateAdminUserUseCase
    delete_user_use_case: DeleteUserUseCase
    get_user_roles_use_case: GetUserRolesUseCase


_container: ServiceContainer | None = None


def build_container(settings: Settings | None = None) -> ServiceContainer:
    settings = settings or Settings()
    if settings.storage_backend == "memory":
        uow = build_in_memory_unit_of_work(settings)
        users = uow.users
        roles = uow.roles
        permissions = uow.permissions
        refresh_tokens = uow.refresh_tokens
        email_verification_tokens = uow.email_verification_tokens
        password_reset_tokens = uow.password_reset_tokens
        email_service = uow.email_service
    else:
        (
            users,
            roles,
            permissions,
            refresh_tokens,
            email_verification_tokens,
            password_reset_tokens,
            email_service,
            _session_factory,
        ) = build_postgres_repositories(settings)

    password_hasher = PasswordHasher()
    jwt_service = JwtService(settings)
    token_issuer = TokenIssuer(settings, jwt_service, refresh_tokens, roles, permissions)
    seed_service = SeedDataService(settings, users, roles, permissions, password_hasher)

    return ServiceContainer(
        settings=settings,
        users=users,
        roles=roles,
        permissions=permissions,
        refresh_tokens=refresh_tokens,
        email_verification_tokens=email_verification_tokens,
        password_reset_tokens=password_reset_tokens,
        email_service=email_service,
        password_hasher=password_hasher,
        jwt_service=jwt_service,
        token_issuer=token_issuer,
        seed_service=seed_service,
        login_use_case=LoginUseCase(users, password_hasher, token_issuer),
        register_use_case=RegisterUseCase(
            settings, users, email_verification_tokens, email_service, password_hasher
        ),
        verify_email_use_case=VerifyEmailUseCase(users, email_verification_tokens),
        resend_verification_use_case=ResendVerificationUseCase(
            settings, users, email_verification_tokens, email_service
        ),
        forgot_password_use_case=ForgotPasswordUseCase(
            settings, users, password_reset_tokens, email_service
        ),
        reset_password_use_case=ResetPasswordUseCase(
            users, password_reset_tokens, password_hasher
        ),
        refresh_token_use_case=RefreshTokenUseCase(refresh_tokens, users, token_issuer),
        logout_use_case=LogoutUseCase(refresh_tokens),
        google_oauth_use_case=GoogleOAuthUseCase(
            settings, users, token_issuer, GoogleOAuthClient(settings), password_hasher
        ),
        get_current_user_use_case=GetCurrentUserUseCase(users, roles, permissions),
        list_roles_use_case=ListRolesUseCase(roles),
        create_role_use_case=CreateRoleUseCase(roles),
        get_role_use_case=GetRoleUseCase(roles),
        update_role_use_case=UpdateRoleUseCase(roles),
        delete_role_use_case=DeleteRoleUseCase(roles),
        list_permissions_use_case=ListPermissionsUseCase(permissions),
        create_permission_use_case=CreatePermissionUseCase(permissions),
        get_permission_use_case=GetPermissionUseCase(permissions),
        update_permission_use_case=UpdatePermissionUseCase(permissions),
        delete_permission_use_case=DeletePermissionUseCase(permissions),
        assign_permissions_to_role_use_case=AssignPermissionsToRoleUseCase(roles, permissions),
        remove_permission_from_role_use_case=RemovePermissionFromRoleUseCase(roles, permissions),
        assign_roles_to_user_use_case=AssignRolesToUserUseCase(users, roles),
        remove_role_from_user_use_case=RemoveRoleFromUserUseCase(users, roles),
        get_user_permissions_use_case=GetUserPermissionsUseCase(users, roles, permissions),
        get_role_permissions_use_case=GetRolePermissionsUseCase(roles, permissions),
        set_role_permissions_use_case=SetRolePermissionsUseCase(roles, permissions),
        list_users_use_case=ListUsersUseCase(users, roles),
        get_user_use_case=GetUserUseCase(users, roles),
        create_admin_user_use_case=CreateAdminUserUseCase(users, roles, password_hasher),
        update_admin_user_use_case=UpdateAdminUserUseCase(users, roles, password_hasher),
        delete_user_use_case=DeleteUserUseCase(users),
        get_user_roles_use_case=GetUserRolesUseCase(users, roles),
    )


def get_container() -> ServiceContainer:
    global _container
    if _container is None:
        _container = build_container()
    return _container


def reset_container(settings: Settings | None = None) -> ServiceContainer:
    global _container
    _container = build_container(settings)
    return _container
