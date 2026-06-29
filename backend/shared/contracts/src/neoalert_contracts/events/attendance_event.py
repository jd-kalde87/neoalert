from uuid import UUID

from neoalert_contracts.events.base_event import BaseEvent


class AttendanceRecordedEvent(BaseEvent):
    event_type: str = "attendance.recorded"
    employee_id: UUID
    record_type: str
    site_id: UUID | None = None
