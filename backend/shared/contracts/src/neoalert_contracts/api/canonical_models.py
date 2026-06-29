from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field


class CanonicalIncidentRecord(BaseModel):
    """Canonical model mapped from Structure A/B templates."""

    tenant_id: UUID
    incident_date: date
    location: str
    event_type: str
    detail: str
    security_forces: str | None = None
    artifact_count: int | None = None
    investigation_authority: str | None = None
    involved_institutions: str | None = None
    investment_amount: float | None = None
    source: str
    template_version: str
    structure_type: str = Field(description="A or B")
