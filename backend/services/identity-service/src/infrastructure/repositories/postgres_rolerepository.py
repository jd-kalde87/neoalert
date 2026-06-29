from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from application.interfaces.rolerepository import RoleRepository
from domain.entities.role import Role
from infrastructure.database.mappers import role_from_model
from infrastructure.database.models import RoleModel, UserRoleModel


class PostgresRoleRepository(RoleRepository):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def list_all(self, tenant_id: UUID) -> list[Role]:
        async with self._session_factory() as session:
            result = await session.execute(select(RoleModel).where(RoleModel.tenant_id == tenant_id))
            return [role_from_model(model) for model in result.scalars().all()]

    async def find_by_id(self, tenant_id: UUID, role_id: UUID) -> Role | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(RoleModel).where(RoleModel.id == role_id, RoleModel.tenant_id == tenant_id)
            )
            model = result.scalar_one_or_none()
            return role_from_model(model) if model else None

    async def find_by_code(self, tenant_id: UUID, code: str) -> Role | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(RoleModel).where(RoleModel.tenant_id == tenant_id, RoleModel.code == code)
            )
            model = result.scalar_one_or_none()
            return role_from_model(model) if model else None

    async def save(self, entity: Role) -> Role:
        async with self._session_factory() as session:
            model = RoleModel(
                id=entity.id,
                tenant_id=entity.tenant_id,
                code=entity.code,
                name=entity.name,
                description=entity.description,
                is_system=entity.is_system,
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            return role_from_model(model)

    async def update(self, entity: Role) -> Role:
        async with self._session_factory() as session:
            result = await session.execute(select(RoleModel).where(RoleModel.id == entity.id))
            model = result.scalar_one()
            model.name = entity.name
            model.description = entity.description
            await session.commit()
            await session.refresh(model)
            return role_from_model(model)

    async def delete(self, tenant_id: UUID, role_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(RoleModel).where(RoleModel.id == role_id, RoleModel.tenant_id == tenant_id)
            )
            await session.commit()

    async def assign_to_user(self, user_id: UUID, role_id: UUID, assigned_by: UUID | None) -> None:
        async with self._session_factory() as session:
            session.add(UserRoleModel(user_id=user_id, role_id=role_id, assigned_by=assigned_by))
            await session.commit()

    async def remove_from_user(self, user_id: UUID, role_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(UserRoleModel).where(
                    UserRoleModel.user_id == user_id, UserRoleModel.role_id == role_id
                )
            )
            await session.commit()

    async def list_user_role_ids(self, tenant_id: UUID, user_id: UUID) -> list[UUID]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserRoleModel.role_id)
                .join(RoleModel, RoleModel.id == UserRoleModel.role_id)
                .where(UserRoleModel.user_id == user_id, RoleModel.tenant_id == tenant_id)
            )
            return list(result.scalars().all())

    async def list_user_role_codes(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(RoleModel.code)
                .join(UserRoleModel, UserRoleModel.role_id == RoleModel.id)
                .where(UserRoleModel.user_id == user_id, RoleModel.tenant_id == tenant_id)
            )
            return list(result.scalars().all())
