from uuid import UUID

from application.dtos.proxyrequestdto import ProxyRequestDTO
from application.interfaces.routerepository import RouteRepository
from domain.entities.routedefinition import RouteDefinition


class ProxyRequestUseCase:
    def __init__(self, repository: RouteRepository) -> None:
        self._repository = repository

    async def resolve_target(self, tenant_id: UUID, dto: ProxyRequestDTO) -> RouteDefinition:
        entity = RouteDefinition(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
