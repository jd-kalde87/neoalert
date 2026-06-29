from uuid import UUID

from application.dtos.roledto import CreateRoleDTO, UpdateRoleDTO
from application.interfaces.rolerepository import RoleRepository
from domain.entities.role import Role
from domain.exceptions.domain_exception import ConflictError, NotFoundError


class ListRolesUseCase:
    def __init__(self, role_repository: RoleRepository) -> None:
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID) -> list[Role]:
        return await self._role_repository.list_all(tenant_id)


class CreateRoleUseCase:
    def __init__(self, role_repository: RoleRepository) -> None:
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, dto: CreateRoleDTO) -> Role:
        existing = await self._role_repository.find_by_code(tenant_id, dto.code)
        if existing:
            raise ConflictError("Role code already exists")
        role = Role(
            tenant_id=tenant_id,
            code=dto.code,
            name=dto.name,
            description=dto.description,
        )
        return await self._role_repository.save(role)


class GetRoleUseCase:
    def __init__(self, role_repository: RoleRepository) -> None:
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, role_id: UUID) -> Role:
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        return role


class UpdateRoleUseCase:
    def __init__(self, role_repository: RoleRepository) -> None:
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, role_id: UUID, dto: UpdateRoleDTO) -> Role:
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        if dto.name is not None:
            role.name = dto.name
        if dto.description is not None:
            role.description = dto.description
        return await self._role_repository.update(role)


class DeleteRoleUseCase:
    def __init__(self, role_repository: RoleRepository) -> None:
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, role_id: UUID) -> None:
        role = await self._role_repository.find_by_id(tenant_id, role_id)
        if role is None:
            raise NotFoundError("Role not found")
        if role.is_system:
            raise ConflictError("Cannot delete system role")
        await self._role_repository.delete(tenant_id, role_id)
