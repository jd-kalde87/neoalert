from uuid import UUID

from application.interfaces.templaterepository import TemplateRepository
from domain.entities.importtemplate import ImportTemplate


class InMemoryTemplateRepository(TemplateRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, ImportTemplate] = {}

    async def find_active_by_structure(self, tenant_id: UUID, *args: object) -> ImportTemplate | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: ImportTemplate) -> ImportTemplate:
        self._store[entity.id] = entity
        return entity
