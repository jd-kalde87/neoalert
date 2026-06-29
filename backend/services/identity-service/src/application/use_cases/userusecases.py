from uuid import UUID

from application.dtos.userdto import CreateAdminUserDTO, UpdateAdminUserDTO
from application.interfaces.rolerepository import RoleRepository
from application.interfaces.userrepository import UserRepository
from domain.entities.user import User
from domain.exceptions.domain_exception import ConflictError, NotFoundError, ValidationError
from infrastructure.security.passwordhasher import PasswordHasher


class ListUsersUseCase:
    def __init__(self, user_repository: UserRepository, role_repository: RoleRepository) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, search: str | None = None) -> list[tuple[User, list[str]]]:
        users = await self._user_repository.list_all(tenant_id, search=search)
        result: list[tuple[User, list[str]]] = []
        for user in users:
            role_codes = await self._role_repository.list_user_role_codes(tenant_id, user.id)
            result.append((user, role_codes))
        return result


class GetUserUseCase:
    def __init__(self, user_repository: UserRepository, role_repository: RoleRepository) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, user_id: UUID) -> tuple[User, list[str]]:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        role_codes = await self._role_repository.list_user_role_codes(tenant_id, user_id)
        return user, role_codes


class CreateAdminUserUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository
        self._password_hasher = password_hasher

    async def execute(
        self,
        tenant_id: UUID,
        dto: CreateAdminUserDTO,
        assigned_by: UUID | None,
    ) -> User:
        existing = await self._user_repository.find_by_email(tenant_id, dto.email)
        if existing:
            raise ConflictError("Email already registered")
        if dto.username:
            existing_username = await self._user_repository.find_by_username(tenant_id, dto.username)
            if existing_username:
                raise ConflictError("Username already taken")

        user = User(
            tenant_id=tenant_id,
            email=dto.email.lower(),
            hashed_password=self._password_hasher.hash(dto.password),
            full_name=dto.full_name,
            username=dto.username,
            email_verified=dto.email_verified,
            is_active=dto.is_active,
        )
        saved = await self._user_repository.save(user)

        for role_id in dto.role_ids:
            role = await self._role_repository.find_by_id(tenant_id, role_id)
            if role is None:
                raise NotFoundError(f"Role {role_id} not found")
            await self._role_repository.assign_to_user(saved.id, role_id, assigned_by)

        return saved


class UpdateAdminUserUseCase:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository
        self._password_hasher = password_hasher

    async def execute(
        self,
        tenant_id: UUID,
        user_id: UUID,
        dto: UpdateAdminUserDTO,
        assigned_by: UUID | None,
    ) -> User:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")

        if dto.email is not None and dto.email.lower() != user.email:
            existing = await self._user_repository.find_by_email(tenant_id, dto.email)
            if existing and existing.id != user_id:
                raise ConflictError("Email already registered")
            user.email = dto.email.lower()

        if dto.username is not None and dto.username != user.username:
            if dto.username:
                existing_username = await self._user_repository.find_by_username(tenant_id, dto.username)
                if existing_username and existing_username.id != user_id:
                    raise ConflictError("Username already taken")
            user.username = dto.username or None

        if dto.full_name is not None:
            user.full_name = dto.full_name
        if dto.email_verified is not None:
            user.email_verified = dto.email_verified
        if dto.is_active is not None:
            user.is_active = dto.is_active
        if dto.password:
            user.hashed_password = self._password_hasher.hash(dto.password)

        updated = await self._user_repository.update(user)

        if dto.role_ids is not None:
            current_ids = set(await self._role_repository.list_user_role_ids(tenant_id, user_id))
            target_ids = set(dto.role_ids)
            for role_id in current_ids - target_ids:
                await self._role_repository.remove_from_user(user_id, role_id)
            for role_id in target_ids - current_ids:
                role = await self._role_repository.find_by_id(tenant_id, role_id)
                if role is None:
                    raise NotFoundError(f"Role {role_id} not found")
                await self._role_repository.assign_to_user(user_id, role_id, assigned_by)

        return updated


class DeleteUserUseCase:
    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository = user_repository

    async def execute(self, tenant_id: UUID, user_id: UUID) -> None:
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        if user.is_superadmin:
            raise ValidationError("Cannot delete superadmin user")
        await self._user_repository.soft_delete(tenant_id, user_id)


class GetUserRolesUseCase:
    def __init__(self, user_repository: UserRepository, role_repository: RoleRepository) -> None:
        self._user_repository = user_repository
        self._role_repository = role_repository

    async def execute(self, tenant_id: UUID, user_id: UUID):
        user = await self._user_repository.find_by_id(tenant_id, user_id)
        if user is None:
            raise NotFoundError("User not found")
        role_ids = await self._role_repository.list_user_role_ids(tenant_id, user_id)
        roles = []
        for role_id in role_ids:
            role = await self._role_repository.find_by_id(tenant_id, role_id)
            if role:
                roles.append(role)
        return roles
