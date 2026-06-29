from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities.employee import Employee


class EmployeeRepository(ABC):
    @abstractmethod
    async def find_by_id(self, tenant_id: UUID, *args: object) -> Employee | None:
        ...

    @abstractmethod
    async def save(self, entity: Employee) -> Employee:
        ...
