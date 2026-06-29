from uuid import UUID

from neoalert_contracts.events.base_event import BaseEvent


class AuditEvent(BaseEvent):
    event_type: str = "audit.action_logged"
    actor_id: UUID
    action: str
    entity_type: str
    entity_id: UUID
    changes: dict[str, object]
