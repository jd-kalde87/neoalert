from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from application.interfaces.userrepository import UserRepository
from domain.entities.user import User
from infrastructure.database.mappers import user_from_model, user_to_model
from infrastructure.database.models import UserModel


class PostgresUserRepository(UserRepository):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def find_by_id(self, tenant_id: UUID, user_id: UUID) -> User | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserModel).where(
                    UserModel.id == user_id,
                    UserModel.tenant_id == tenant_id,
                    UserModel.deleted_at.is_(None),
                )
            )
            model = result.scalar_one_or_none()
            return user_from_model(model) if model else None

    async def find_by_email(self, tenant_id: UUID, email: str) -> User | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserModel).where(
                    UserModel.tenant_id == tenant_id,
                    UserModel.email == email.lower(),
                    UserModel.deleted_at.is_(None),
                )
            )
            model = result.scalar_one_or_none()
            return user_from_model(model) if model else None

    async def find_by_username(self, tenant_id: UUID, username: str) -> User | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserModel).where(
                    UserModel.tenant_id == tenant_id,
                    UserModel.username == username,
                    UserModel.deleted_at.is_(None),
                )
            )
            model = result.scalar_one_or_none()
            return user_from_model(model) if model else None

    async def find_by_google_id(self, google_id: str) -> User | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserModel).where(UserModel.google_id == google_id, UserModel.deleted_at.is_(None))
            )
            model = result.scalar_one_or_none()
            return user_from_model(model) if model else None

    async def save(self, entity: User) -> User:
        async with self._session_factory() as session:
            model = user_to_model(entity)
            session.add(model)
            await session.commit()
            await session.refresh(model)
            return user_from_model(model)

    async def update(self, entity: User) -> User:
        async with self._session_factory() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == entity.id))
            model = result.scalar_one()
            user_to_model(entity, model)
            await session.commit()
            await session.refresh(model)
            return user_from_model(model)

    async def list_all(self, tenant_id: UUID, search: str | None = None) -> list[User]:
        async with self._session_factory() as session:
            query = select(UserModel).where(
                UserModel.tenant_id == tenant_id,
                UserModel.deleted_at.is_(None),
            )
            if search:
                term = f"%{search.strip()}%"
                query = query.where(
                    or_(
                        UserModel.email.ilike(term),
                        UserModel.full_name.ilike(term),
                        UserModel.username.ilike(term),
                    )
                )
            query = query.order_by(UserModel.created_at.desc())
            result = await session.execute(query)
            return [user_from_model(model) for model in result.scalars().all()]

    async def soft_delete(self, tenant_id: UUID, user_id: UUID) -> None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserModel).where(
                    UserModel.id == user_id,
                    UserModel.tenant_id == tenant_id,
                    UserModel.deleted_at.is_(None),
                )
            )
            model = result.scalar_one()
            model.deleted_at = datetime.now(timezone.utc)
            model.is_active = False
            await session.commit()
