from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from application.interfaces.permissionrepository import PermissionRepository
from domain.entities.permission import Permission
from infrastructure.database.mappers import permission_from_model
from infrastructure.database.models import PermissionModel, RoleModel, RolePermissionModel, UserRoleModel


class PostgresPermissionRepository(PermissionRepository):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def list_all(self) -> list[Permission]:
        async with self._session_factory() as session:
            result = await session.execute(select(PermissionModel))
            return [permission_from_model(model) for model in result.scalars().all()]

    async def find_by_id(self, permission_id: UUID) -> Permission | None:
        async with self._session_factory() as session:
            result = await session.execute(
                select(PermissionModel).where(PermissionModel.id == permission_id)
            )
            model = result.scalar_one_or_none()
            return permission_from_model(model) if model else None

    async def find_by_code(self, code: str) -> Permission | None:
        async with self._session_factory() as session:
            result = await session.execute(select(PermissionModel).where(PermissionModel.code == code))
            model = result.scalar_one_or_none()
            return permission_from_model(model) if model else None

    async def save(self, entity: Permission) -> Permission:
        async with self._session_factory() as session:
            model = PermissionModel(
                id=entity.id,
                code=entity.code,
                name=entity.name,
                resource=entity.resource,
                action=entity.action,
                description=entity.description,
            )
            session.add(model)
            await session.commit()
            await session.refresh(model)
            return permission_from_model(model)

    async def update(self, entity: Permission) -> Permission:
        async with self._session_factory() as session:
            result = await session.execute(
                select(PermissionModel).where(PermissionModel.id == entity.id)
            )
            model = result.scalar_one()
            model.name = entity.name
            model.resource = entity.resource
            model.action = entity.action
            model.description = entity.description
            await session.commit()
            await session.refresh(model)
            return permission_from_model(model)

    async def delete(self, permission_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(delete(PermissionModel).where(PermissionModel.id == permission_id))
            await session.commit()

    async def assign_to_role(self, role_id: UUID, permission_id: UUID) -> None:
        async with self._session_factory() as session:
            session.add(RolePermissionModel(role_id=role_id, permission_id=permission_id))
            await session.commit()

    async def remove_from_role(self, role_id: UUID, permission_id: UUID) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(RolePermissionModel).where(
                    RolePermissionModel.role_id == role_id,
                    RolePermissionModel.permission_id == permission_id,
                )
            )
            await session.commit()

    async def list_role_permission_codes(self, role_id: UUID) -> list[str]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(PermissionModel.code)
                .join(RolePermissionModel, RolePermissionModel.permission_id == PermissionModel.id)
                .where(RolePermissionModel.role_id == role_id)
            )
            return list(result.scalars().all())

    async def list_by_role_id(self, role_id: UUID) -> list[Permission]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(PermissionModel)
                .join(RolePermissionModel, RolePermissionModel.permission_id == PermissionModel.id)
                .where(RolePermissionModel.role_id == role_id)
                .order_by(PermissionModel.code)
            )
            return [permission_from_model(model) for model in result.scalars().all()]

    async def replace_role_permissions(self, role_id: UUID, permission_ids: list[UUID]) -> None:
        async with self._session_factory() as session:
            await session.execute(
                delete(RolePermissionModel).where(RolePermissionModel.role_id == role_id)
            )
            for permission_id in permission_ids:
                session.add(RolePermissionModel(role_id=role_id, permission_id=permission_id))
            await session.commit()

    async def list_user_effective_permissions(self, tenant_id: UUID, user_id: UUID) -> list[str]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(PermissionModel.code)
                .join(RolePermissionModel, RolePermissionModel.permission_id == PermissionModel.id)
                .join(RoleModel, RoleModel.id == RolePermissionModel.role_id)
                .join(UserRoleModel, UserRoleModel.role_id == RoleModel.id)
                .where(UserRoleModel.user_id == user_id, RoleModel.tenant_id == tenant_id)
                .distinct()
            )
            return sorted(result.scalars().all())
