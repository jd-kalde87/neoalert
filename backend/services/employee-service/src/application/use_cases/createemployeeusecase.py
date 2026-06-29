from uuid import UUID

from application.dtos.createemployeedto import CreateEmployeeDTO
from application.interfaces.employeerepository import EmployeeRepository
from domain.entities.employee import Employee


class CreateEmployeeUseCase:
    def __init__(self, repository: EmployeeRepository) -> None:
        self._repository = repository

    async def execute(self, tenant_id: UUID, dto: CreateEmployeeDTO) -> Employee:
        entity = Employee(tenant_id=tenant_id, **dto.model_dump())
        return await self._repository.save(entity)
