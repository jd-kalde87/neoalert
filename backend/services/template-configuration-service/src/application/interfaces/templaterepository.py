from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.importtemplate import ImportTemplate


class TemplateRepository(ABC):
    @abstractmethod
    async def find_active_by_structure(self, tenant_id: UUID, *args: object) -> ImportTemplate | None:
        ...

    @abstractmethod
    async def save(self, entity: ImportTemplate) -> ImportTemplate:
        ...
