from uuid import UUID

from application.interfaces.employeerepository import EmployeeRepository
from domain.entities.employee import Employee


class InMemoryEmployeeRepository(EmployeeRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, Employee] = {}

    async def find_by_id(self, tenant_id: UUID, *args: object) -> Employee | None:
        for item in self._store.values():
            if item.tenant_id == tenant_id:
                return item
        return None

    async def save(self, entity: Employee) -> Employee:
        self._store[entity.id] = entity
        return entity
