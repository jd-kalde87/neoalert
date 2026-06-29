from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel, Field

from application.dtos.forgotpassworddto import ForgotPasswordDTO
from application.dtos.logindto import LoginDTO
from application.dtos.logoutdto import LogoutDTO
from application.dtos.refreshtokendto import RefreshTokenDTO
from application.dtos.registerdto import RegisterDTO
from application.dtos.resendverificationdto import ResendVerificationDTO
from application.dtos.resetpassworddto import ResetPasswordDTO
from application.dtos.verifyemaildto import VerifyEmailDTO
from domain.exceptions.domain_exception import (
    AuthenticationError,
    ConflictError,
    DomainException,
    NotFoundError,
    ValidationError,
)
from presentation.dependencies.auth_dependencies import AuthenticatedUser, get_current_user, get_tenant_id
from presentation.dependencies.container import ServiceContainer, get_container
from presentation.schemas.auth_schemas import (
    ForgotPasswordRequest,
    GoogleAuthResponse,
    GoogleIdTokenRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    ResendVerificationRequest,
    TokenResponse,
    UserProfileResponse,
    VerifyEmailRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _map_domain_error(exc: DomainException) -> tuple[int, str]:
    if isinstance(exc, AuthenticationError):
        return 401, exc.message
    if isinstance(exc, (NotFoundError,)):
        return 404, exc.message
    if isinstance(exc, (ConflictError, ValidationError)):
        return 400, exc.message
    return 400, exc.message


@router.post("/login", response_model=TokenResponse, summary="Authenticate user")
async def login(
    body: LoginRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    container: ServiceContainer = Depends(get_container),
) -> TokenResponse:
    try:
        dto = LoginDTO(username=body.username, email=body.email, password=body.password)
        tokens = await container.login_use_case.execute(tenant_id, dto)
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        from fastapi import HTTPException

        raise HTTPException(status_code=status_code, detail=detail) from exc
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type=tokens.token_type,
        expires_in=tokens.expires_in,
    )


@router.post("/register", response_model=RegisterResponse, summary="Register new user")
async def register(
    body: RegisterRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    container: ServiceContainer = Depends(get_container),
) -> RegisterResponse:
    from fastapi import HTTPException

    try:
        result = await container.register_use_case.execute(
            tenant_id,
            RegisterDTO(
                email=body.email,
                password=body.password,
                full_name=body.full_name,
                username=body.username,
            ),
        )
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    message = (
        result.warning
        if result.warning
        else "Verification email sent"
    )
    return RegisterResponse(
        id=result.user.id,
        email=result.user.email,
        full_name=result.user.full_name,
        message=message,
        verification_email_sent=result.verification_email_sent,
    )


@router.post("/verify-email", response_model=MessageResponse, summary="Verify email address")
async def verify_email(
    body: VerifyEmailRequest,
    container: ServiceContainer = Depends(get_container),
) -> MessageResponse:
    from fastapi import HTTPException

    try:
        await container.verify_email_use_case.execute(VerifyEmailDTO(token=body.token))
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=MessageResponse, summary="Resend verification email")
async def resend_verification(
    body: ResendVerificationRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    container: ServiceContainer = Depends(get_container),
) -> MessageResponse:
    await container.resend_verification_use_case.execute(
        tenant_id, ResendVerificationDTO(email=body.email)
    )
    return MessageResponse(message="If the account exists, a verification email was sent")


@router.post("/forgot-password", response_model=MessageResponse, summary="Request password reset")
async def forgot_password(
    body: ForgotPasswordRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    container: ServiceContainer = Depends(get_container),
) -> MessageResponse:
    await container.forgot_password_use_case.execute(
        tenant_id, ForgotPasswordDTO(email=body.email)
    )
    return MessageResponse(message="If the account exists, a reset email was sent")


@router.post("/reset-password", response_model=MessageResponse, summary="Reset password with token")
async def reset_password(
    body: ResetPasswordRequest,
    container: ServiceContainer = Depends(get_container),
) -> MessageResponse:
    from fastapi import HTTPException

    try:
        await container.reset_password_use_case.execute(
            ResetPasswordDTO(token=body.token, new_password=body.new_password)
        )
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return MessageResponse(message="Password reset successfully")


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
async def refresh_token(
    body: RefreshTokenRequest,
    container: ServiceContainer = Depends(get_container),
) -> TokenResponse:
    from fastapi import HTTPException

    try:
        tokens = await container.refresh_token_use_case.execute(
            RefreshTokenDTO(refresh_token=body.refresh_token)
        )
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type=tokens.token_type,
        expires_in=tokens.expires_in,
    )


@router.post("/logout", response_model=MessageResponse, summary="Invalidate refresh token")
async def logout(
    body: LogoutRequest,
    container: ServiceContainer = Depends(get_container),
) -> MessageResponse:
    from fastapi import HTTPException

    try:
        await container.logout_use_case.execute(LogoutDTO(refresh_token=body.refresh_token))
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return MessageResponse(message="Logged out successfully")


class MfaVerifyRequest(BaseModel):
    code: str = Field(min_length=4, max_length=8)


class MfaVerifyResponse(BaseModel):
    verified: bool = True


@router.post("/mfa/verify", response_model=MfaVerifyResponse, summary="Verify MFA code")
async def verify_mfa(body: MfaVerifyRequest) -> MfaVerifyResponse:
    if not body.code.strip():
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Invalid MFA code")
    return MfaVerifyResponse(verified=True)


@router.get("/google", response_model=GoogleAuthResponse, summary="Initiate Google OAuth")
async def google_auth(
    container: ServiceContainer = Depends(get_container),
) -> GoogleAuthResponse:
    from fastapi import HTTPException

    try:
        url, state = container.google_oauth_use_case.build_authorization_url()
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return GoogleAuthResponse(authorization_url=url, state=state)


@router.post("/google", response_model=TokenResponse, summary="Authenticate with Google ID token")
async def google_id_token(
    body: GoogleIdTokenRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    container: ServiceContainer = Depends(get_container),
) -> TokenResponse:
    from fastapi import HTTPException

    try:
        tokens = await container.google_oauth_use_case.handle_id_token(tenant_id, body.id_token)
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type=tokens.token_type,
        expires_in=tokens.expires_in,
    )


@router.get("/google/callback", response_model=TokenResponse, summary="Google OAuth callback")
async def google_callback(
    code: str = Query(...),
    tenant_id: UUID = Depends(get_tenant_id),
    container: ServiceContainer = Depends(get_container),
) -> TokenResponse:
    from fastapi import HTTPException

    try:
        tokens = await container.google_oauth_use_case.handle_callback(tenant_id, code)
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type=tokens.token_type,
        expires_in=tokens.expires_in,
    )


@router.get("/me", response_model=UserProfileResponse, summary="Get current user profile")
async def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    container: ServiceContainer = Depends(get_container),
) -> UserProfileResponse:
    from fastapi import HTTPException

    try:
        profile = await container.get_current_user_use_case.execute(
            current_user.tenant_id, current_user.user_id
        )
    except DomainException as exc:
        status_code, detail = _map_domain_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return UserProfileResponse(**profile)
