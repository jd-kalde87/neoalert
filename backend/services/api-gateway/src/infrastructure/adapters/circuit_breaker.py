from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    failure_count: int = 0
    is_open: bool = False
    last_failure: datetime | None = None

    def record_success(self) -> None:
        self.failure_count = 0
        self.is_open = False

    def record_failure(self) -> None:
        self.failure_count += 1
        self.last_failure = datetime.utcnow()
        if self.failure_count >= self.failure_threshold:
            self.is_open = True
