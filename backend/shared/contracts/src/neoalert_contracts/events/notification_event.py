from uuid import UUID

from neoalert_contracts.events.base_event import BaseEvent


class NotificationRequestedEvent(BaseEvent):
    event_type: str = "notification.requested"
    channel: str
    recipient_id: UUID
    template_code: str
