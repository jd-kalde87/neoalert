from uuid import UUID

from application.dtos.permissiondto import CreatePermissionDTO, UpdatePermissionDTO
from application.interfaces.permissionrepository import PermissionRepository
from domain.entities.permission import Permission
from domain.exceptions.domain_exception import ConflictError, NotFoundError


class ListPermissionsUseCase:
    def __init__(self, permission_repository: PermissionRepository) -> None:
        self._permission_repository = permission_repository

    async def execute(self) -> list[Permission]:
        return await self._permission_repository.list_all()


class CreatePermissionUseCase:
    def __init__(self, permission_repository: PermissionRepository) -> None:
        self._permission_repository = permission_repository

    async def execute(self, dto: CreatePermissionDTO) -> Permission:
        existing = await self._permission_repository.find_by_code(dto.code)
        if existing:
            raise ConflictError("Permission code already exists")
        permission = Permission(
            code=dto.code,
            name=dto.name,
            resource=dto.resource,
            action=dto.action,
            description=dto.description,
        )
        return await self._permission_repository.save(permission)


class GetPermissionUseCase:
    def __init__(self, permission_repository: PermissionRepository) -> None:
        self._permission_repository = permission_repository

    async def execute(self, permission_id: UUID) -> Permission:
        permission = await self._permission_repository.find_by_id(permission_id)
        if permission is None:
            raise NotFoundError("Permission not found")
        return permission


class UpdatePermissionUseCase:
    def __init__(self, permission_repository: PermissionRepository) -> None:
        self._permission_repository = permission_repository

    async def execute(self, permission_id: UUID, dto: UpdatePermissionDTO) -> Permission:
        permission = await self._permission_repository.find_by_id(permission_id)
        if permission is None:
            raise NotFoundError("Permission not found")
        if dto.name is not None:
            permission.name = dto.name
        if dto.resource is not None:
            permission.resource = dto.resource
        if dto.action is not None:
            permission.action = dto.action
        if dto.description is not None:
            permission.description = dto.description
        return await self._permission_repository.update(permission)


class DeletePermissionUseCase:
    def __init__(self, permission_repository: PermissionRepository) -> None:
        self._permission_repository = permission_repository

    async def execute(self, permission_id: UUID) -> None:
        permission = await self._permission_repository.find_by_id(permission_id)
        if permission is None:
            raise NotFoundError("Permission not found")
        await self._permission_repository.delete(permission_id)
