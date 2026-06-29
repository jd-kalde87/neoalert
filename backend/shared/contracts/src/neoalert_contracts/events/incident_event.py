from uuid import UUID

from neoalert_contracts.events.base_event import BaseEvent


class IncidentCreatedEvent(BaseEvent):
    event_type: str = "incident.created"
    incident_id: UUID
    severity: str
    source: str
