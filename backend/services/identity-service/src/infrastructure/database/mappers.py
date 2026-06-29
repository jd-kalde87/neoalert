from domain.entities.emailverificationtoken import EmailVerificationToken
from domain.entities.passwordresettoken import PasswordResetToken
from domain.entities.permission import Permission
from domain.entities.refreshtoken import RefreshToken
from domain.entities.role import Role
from domain.entities.user import User
from infrastructure.database.models import (
    EmailVerificationTokenModel,
    PasswordResetTokenModel,
    PermissionModel,
    RefreshTokenModel,
    RoleModel,
    UserModel,
)


def user_from_model(model: UserModel) -> User:
    return User(
        id=model.id,
        tenant_id=model.tenant_id,
        email=model.email,
        hashed_password=model.password_hash,
        full_name=model.full_name,
        username=model.username,
        mfa_enabled=model.mfa_enabled,
        is_active=model.is_active,
        email_verified=model.email_verified,
        google_id=model.google_id,
        is_superadmin=model.is_superadmin,
        created_at=model.created_at,
    )


def user_to_model(entity: User, model: UserModel | None = None) -> UserModel:
    model = model or UserModel()
    model.id = entity.id
    model.tenant_id = entity.tenant_id
    model.email = entity.email
    model.password_hash = entity.hashed_password
    model.full_name = entity.full_name
    model.username = entity.username
    model.mfa_enabled = entity.mfa_enabled
    model.is_active = entity.is_active
    model.email_verified = entity.email_verified
    model.google_id = entity.google_id
    model.is_superadmin = entity.is_superadmin
    return model


def role_from_model(model: RoleModel) -> Role:
    return Role(
        id=model.id,
        tenant_id=model.tenant_id,
        code=model.code,
        name=model.name,
        description=model.description,
        is_system=model.is_system,
        created_at=model.created_at,
    )


def permission_from_model(model: PermissionModel) -> Permission:
    return Permission(
        id=model.id,
        code=model.code,
        name=model.name,
        resource=model.resource,
        action=model.action,
        description=model.description,
        created_at=model.created_at,
    )


def refresh_token_from_model(model: RefreshTokenModel) -> RefreshToken:
    return RefreshToken(
        id=model.id,
        tenant_id=model.tenant_id,
        user_id=model.user_id,
        token_hash=model.token_hash,
        expires_at=model.expires_at,
        revoked_at=model.revoked_at,
        created_at=model.created_at,
    )


def email_verification_from_model(model: EmailVerificationTokenModel) -> EmailVerificationToken:
    return EmailVerificationToken(
        id=model.id,
        tenant_id=model.tenant_id,
        user_id=model.user_id,
        token_hash=model.token_hash,
        expires_at=model.expires_at,
        used_at=model.used_at,
        created_at=model.created_at,
    )


def password_reset_from_model(model: PasswordResetTokenModel) -> PasswordResetToken:
    return PasswordResetToken(
        id=model.id,
        tenant_id=model.tenant_id,
        user_id=model.user_id,
        token_hash=model.token_hash,
        expires_at=model.expires_at,
        used_at=model.used_at,
        created_at=model.created_at,
    )
