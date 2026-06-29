from abc import ABC, abstractmethod


class LlmProvider(ABC):
    @abstractmethod
    async def classify(self, text: str) -> dict[str, object]:
        ...


class OpenAiAdapter(LlmProvider):
    async def classify(self, text: str) -> dict[str, object]:
        return {"label": "unknown", "confidence": 0.0}
