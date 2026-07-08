"""Convierte Hoja1 del archivo de noticias Power BI a JSON para NeoAlert."""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

import pandas as pd

DEFAULT_SOURCE = Path(
    r"c:\Users\SALUD PUBLICA\Desktop\aplicacio movil\modificacion 3 cargue noticias\20260510 Archivo de Noticias - Actualizacion Power BI.xlsx"
)
DEFAULT_OUTPUT = (
    Path(__file__).resolve().parent.parent / "public" / "data" / "noticias-interes.json"
)

CRITICAL_KEYWORDS = (
    "explosivo",
    "secuestro",
    "homicidio",
    "asesinato",
    "muerto",
    "muertos",
    "masacre",
    "atentado",
    "granada",
    "bomba",
)
HIGH_KEYWORDS = (
    "inciner",
    "enfrentamiento",
    "bloqueo",
    "hurto",
    "robo",
    "ataque",
    "disparo",
    "hostigamiento",
    "amenaza",
)
MEDIUM_KEYWORDS = (
    "manifest",
    "protesta",
    "paro",
    "restricc",
    "vandal",
    "inund",
    "derrumbe",
)


def normalize_key(value: str) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFKD", str(value))
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def infer_severity(activity: str) -> str:
    text = normalize_key(activity)
    if any(keyword in text for keyword in CRITICAL_KEYWORDS):
        return "critical"
    if any(keyword in text for keyword in HIGH_KEYWORDS):
        return "high"
    if any(keyword in text for keyword in MEDIUM_KEYWORDS):
        return "medium"
    return "low"


def convert(source: Path, output: Path) -> None:
    df = pd.read_excel(source, sheet_name="Hoja1")
    df = df.rename(
        columns={
            "PAIS": "country",
            "DEPARTAMENTO ": "department",
            "DEPARTAMENTO": "department",
            "MUNICIPIO": "municipality",
            "ACTIVIDAD ": "activity",
            "ACTIVIDAD": "activity",
            "FECHA ": "date",
            "FECHA": "date",
        }
    )

    items = []
    for index, row in df.iterrows():
        activity = str(row.get("activity", "")).strip()
        if not activity or activity.lower() == "nan":
            continue

        department = str(row.get("department", "")).strip()
        municipality = str(row.get("municipality", "")).strip()
        country = str(row.get("country", "Colombia")).strip() or "Colombia"
        raw_date = row.get("date")
        if pd.isna(raw_date):
            date_iso = None
        elif isinstance(raw_date, datetime):
            date_iso = raw_date.date().isoformat()
        else:
            date_iso = str(raw_date)[:10]

        items.append(
            {
                "id": f"news-{index + 1:04d}",
                "country": country,
                "department": department,
                "municipality": municipality,
                "activity": activity,
                "date": date_iso,
                "severity": infer_severity(activity),
                "departmentKey": normalize_key(department),
                "municipalityKey": normalize_key(municipality),
            }
        )

    items.sort(key=lambda item: item.get("date") or "", reverse=True)

    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": "20260510 Archivo de Noticias - Actualizacion Power BI.xlsx",
        "sheet": "Hoja1",
        "updatedAt": datetime.now().isoformat(),
        "total": len(items),
        "items": items,
    }
    with output.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)

    print(f"Wrote {len(items)} news items to {output}")


if __name__ == "__main__":
    source_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    convert(source_path, output_path)
