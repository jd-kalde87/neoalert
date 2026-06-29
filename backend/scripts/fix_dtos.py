"""Regenerate all DTO files with correct formatting."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "services"

DTOS: dict[str, tuple[str, str]] = {
    "api-gateway": ("ProxyRequestDTO", "path: str\n    method: str\n    headers: dict[str, str]"),
    "identity-service": ("LoginDTO", "email: str\n    password: str"),
    "tenant-service": ("CreateTenantDTO", "name: str\n    slug: str\n    country_code: str"),
    "employee-service": ("CreateEmployeeDTO", "first_name: str\n    last_name: str\n    position_id: UUID | None = None"),
    "attendance-service": ("CheckInDTO", "employee_id: UUID\n    latitude: float | None = None\n    longitude: float | None = None"),
    "location-service": ("RecordLocationDTO", "employee_id: UUID\n    latitude: float\n    longitude: float"),
    "incident-service": ("CreateIncidentDTO", "title: str\n    severity: str\n    source: str"),
    "file-ingestion-service": ("UploadFileDTO", "template_id: UUID\n    file_name: str"),
    "template-configuration-service": ("CreateTemplateDTO", "name: str\n    structure_type: str\n    columns: list[dict[str, str]]"),
    "notification-service": ("SendNotificationDTO", "channel: str\n    recipient_id: UUID\n    subject: str\n    body: str"),
    "reporting-service": ("KpiQueryDTO", "metric: str\n    start_date: date\n    end_date: date"),
    "ai-service": ("ClassificationRequestDTO", "incident_id: UUID\n    text: str"),
    "audit-service": ("AuditLogDTO", "actor_id: UUID\n    action: str\n    entity_type: str\n    entity_id: UUID"),
}

TEMPLATE = '''from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class {class_name}(BaseModel):
    {fields}
'''

for service, (class_name, fields) in DTOS.items():
    path = ROOT / service / "src" / "application" / "dtos" / f"{class_name.lower()}.py"
    content = TEMPLATE.format(class_name=class_name, fields=fields)
    path.write_text(content, encoding="utf-8")
    print(f"Regenerated: {path}")
