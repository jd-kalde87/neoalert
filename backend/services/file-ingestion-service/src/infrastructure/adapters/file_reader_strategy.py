from abc import ABC, abstractmethod
from pathlib import Path


class FileReaderStrategy(ABC):
    @abstractmethod
    async def read(self, file_path: Path) -> list[dict[str, str]]:
        ...


class CsvReaderStrategy(FileReaderStrategy):
    async def read(self, file_path: Path) -> list[dict[str, str]]:
        return []


class ExcelReaderStrategy(FileReaderStrategy):
    async def read(self, file_path: Path) -> list[dict[str, str]]:
        return []
