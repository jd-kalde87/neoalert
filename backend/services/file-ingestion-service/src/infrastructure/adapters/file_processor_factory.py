from infrastructure.adapters.file_reader_strategy import (
    CsvReaderStrategy,
    ExcelReaderStrategy,
    FileReaderStrategy,
)


class FileProcessorFactory:
    @staticmethod
    def create(extension: str) -> FileReaderStrategy:
        if extension in {".csv", ".txt"}:
            return CsvReaderStrategy()
        if extension in {".xlsx", ".xls"}:
            return ExcelReaderStrategy()
        raise ValueError(f"Unsupported extension: {extension}")
