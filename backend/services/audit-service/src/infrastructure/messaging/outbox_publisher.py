from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class OutboxMessage:
    event_type: str
    payload: dict[str, object]
    tenant_id: UUID
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
    published: bool = False


class OutboxPublisher:
    def __init__(self) -> None:
        self._messages: list[OutboxMessage] = []

    async def enqueue(self, message: OutboxMessage) -> OutboxMessage:
        self._messages.append(message)
        return message

    async def pending(self) -> list[OutboxMessage]:
        return [m for m in self._messages if not m.published]
