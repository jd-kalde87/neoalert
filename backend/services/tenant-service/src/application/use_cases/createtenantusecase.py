from uuid import UUID

from application.dtos.createtenantdto import CreateTenantDTO
from application.interfaces.tenantrepository import TenantRepository
from domain.entities.tenant import Tenant


class CreateTenantUseCase:
    def __init__(self, repository: TenantRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: CreateTenantDTO) -> Tenant:
        entity = Tenant(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
