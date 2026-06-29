class CanonicalMapper:
    def map_row(self, row: dict[str, str], column_map: dict[str, str]) -> dict[str, object]:
        return {column_map.get(k, k): v for k, v in row.items()}
