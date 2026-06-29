from uuid import UUID

from neoalert_contracts.events.base_event import BaseEvent


class FileIngestionCompletedEvent(BaseEvent):
    event_type: str = "file_ingestion.completed"
    batch_id: UUID
    template_id: UUID
    record_count: int
    error_count: int
