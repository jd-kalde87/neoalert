import pytest
from httpx import ASGITransport, AsyncClient

from core.config import Settings
from domain.entities.user import User
from infrastructure.security.passwordhasher import PasswordHasher
from presentation.dependencies.container import reset_container
from presentation.main import app


@pytest.mark.asyncio
async def test_login_endpoint_with_body() -> None:
    settings = Settings(storage_backend="memory")
    container = reset_container(settings)
    password_hasher = PasswordHasher()
    await container.seed_service.seed_if_empty()
    admin = await container.users.find_by_email(
        settings.default_tenant_id, "admin@neoalert.com"
    )
    assert admin is not None
    admin.email_verified = True
    admin.hashed_password = password_hasher.hash("Admin123!")
    await container.users.update(admin)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/auth/login",
            json={"email": "admin@neoalert.com", "password": "Admin123!"},
        )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert "refresh_token" in payload
    assert payload["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_endpoint_with_username() -> None:
    settings = Settings(storage_backend="memory")
    container = reset_container(settings)
    password_hasher = PasswordHasher()
    await container.seed_service.seed_if_empty()
    admin = await container.users.find_by_email(
        settings.default_tenant_id, "admin@neoalert.com"
    )
    assert admin is not None
    admin.email_verified = True
    admin.hashed_password = password_hasher.hash("Admin123!")
    await container.users.update(admin)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/auth/login",
            json={"username": "admin", "password": "Admin123!"},
        )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload


@pytest.mark.asyncio
async def test_login_google_account_rejects_password() -> None:
    settings = Settings(storage_backend="memory")
    container = reset_container(settings)
    password_hasher = PasswordHasher()
    await container.users.save(
        User(
            tenant_id=settings.default_tenant_id,
            email="google.user@example.com",
            hashed_password=password_hasher.hash("random-internal-secret"),
            full_name="Google User",
            google_id="google-sub-123",
            email_verified=True,
        )
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/auth/login",
            json={"email": "google.user@example.com", "password": "MyGmailPassword1!"},
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Use Google sign-in for this account"
