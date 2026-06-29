import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from core.config import Settings
from presentation.dependencies.container import reset_container


@pytest.fixture(autouse=True)
def memory_backend(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IDENTITYSERVICE_STORAGE_BACKEND", "memory")
    settings = Settings(storage_backend="memory")
    reset_container(settings)
