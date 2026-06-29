from uuid import UUID

from application.dtos.createtemplatedto import CreateTemplateDTO
from application.interfaces.templaterepository import TemplateRepository
from domain.entities.importtemplate import ImportTemplate


class CreateTemplateUseCase:
    def __init__(self, repository: TemplateRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: CreateTemplateDTO) -> ImportTemplate:
        entity = ImportTemplate(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
