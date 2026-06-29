from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from application.interfaces.emailverificationtokenrepository import EmailVerificationTokenRepository
from application.interfaces.passwordresettokenrepository import PasswordResetTokenRepository
from application.interfaces.refreshtokenrepository import RefreshTokenRepository
from domain.entities.emailverificationtoken import EmailVerificationToken
from domain.entities.passwordresettoken import PasswordResetToken
from domain.entities.refreshtoken import RefreshToken
from infrastructure.database.mappers import (
    email_verification_from_model,
    password_reset_from_model,
    refresh_token_from_model,
)
from infrastructure.database.models import (
    EmailVerificationTokenModel,
    PasswordResetTokenModel,
    RefreshTokenModel,
)


class PostgresRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def save(self, entity: RefreshToken) -> RefreshToken:
        async with self._session_factory() as session:
            model = RefreshTokenModel(
                id=entity.id,
                tenant_id=entity.tenant_id,
                user_id=entity.user_id,
                token_hash=entity.token_hash,
                expires_at=entity.expires_at,
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            return refresh_token_from_model(model)

    async def find_by_hash(self, token_hash: str) -> RefreshToken | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(RefreshTokenModel).where(RefreshTokenModel.token_hash == token_hash)
            )
            model = result.scalar_one_or_none()
            return refresh_token_from_model(model) if model else None

    async def revoke(self, token_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                update(RefreshTokenModel)
                .where(RefreshTokenModel.id == token_id)
                .values(revoked_at=datetime.now(timezone.utc))
            )
            await session.commit()

    async def revoke_all_for_user(self, tenant_id: UUID, user_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                update(RefreshTokenModel)
                .where(
                    RefreshTokenModel.tenant_id == tenant_id,
                    RefreshTokenModel.user_id == user_id,
                )
                .values(revoked_at=datetime.now(timezone.utc))
            )
            await session.commit()


class PostgresEmailVerificationTokenRepository(EmailVerificationTokenRepository):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def save(self, entity: EmailVerificationToken) -> EmailVerificationToken:
        async with self._session_factory() as session:
            model = EmailVerificationTokenModel(
                id=entity.id,
                tenant_id=entity.tenant_id,
                user_id=entity.user_id,
                token_hash=entity.token_hash,
                expires_at=entity.expires_at,
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            return email_verification_from_model(model)

    async def find_by_hash(self, token_hash: str) -> EmailVerificationToken | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(EmailVerificationTokenModel).where(
                    EmailVerificationTokenModel.token_hash == token_hash
                )
            )
            model = result.scalar_one_or_none()
            return email_verification_from_model(model) if model else None

    async def mark_used(self, token_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                update(EmailVerificationTokenModel)
                .where(EmailVerificationTokenModel.id == token_id)
                .values(used_at=datetime.now(timezone.utc))
            )
            await session.commit()


class PostgresPasswordResetTokenRepository(PasswordResetTokenRepository):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def save(self, entity: PasswordResetToken) -> PasswordResetToken:
        async with self._session_factory() as session:
            model = PasswordResetTokenModel(
                id=entity.id,
                tenant_id=entity.tenant_id,
                user_id=entity.user_id,
                token_hash=entity.token_hash,
                expires_at=entity.expires_at,
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            return password_reset_from_model(model)

    async def find_by_hash(self, token_hash: str) -> PasswordResetToken | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(PasswordResetTokenModel).where(PasswordResetTokenModel.token_hash == token_hash)
            )
            model = result.scalar_one_or_none()
            return password_reset_from_model(model) if model else None

    async def mark_used(self, token_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                update(PasswordResetTokenModel)
                .where(PasswordResetTokenModel.id == token_id)
                .values(used_at=datetime.now(timezone.utc))
            )
            await session.commit()
