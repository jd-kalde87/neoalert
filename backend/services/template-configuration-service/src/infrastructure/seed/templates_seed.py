from typing import Any

TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "tpl-concordia-ops",
        "name": "Operativos de seguridad — Concordia (Sinaloa)",
        "description": "Actividades y operativos con ubicación por nombre en Sinaloa",
        "version": "1.0",
        "active": True,
        "entity": "security_incidents",
        "updatedAt": "2026-06-28T12:00:00Z",
        "fields": [
            {"key": "A0001", "label": "Fecha del incidente o registro", "required": False},
            {"key": "A0002", "label": "Ubicación específica", "required": True},
            {"key": "A0003", "label": "Tipo de operativo o actividad", "required": True},
            {"key": "A0004", "label": "Fuerzas de seguridad involucradas", "required": False},
            {"key": "A0005", "label": "Detalle de aseguramiento o resultados", "required": False},
            {"key": "A0006", "label": "Cantidad de artefactos o insumos", "required": False},
            {"key": "A0007", "label": "Autoridad a cargo de la investigación", "required": False},
            {"key": "A0008", "label": "Fuente", "required": False},
        ],
    },
    {
        "id": "tpl-incidents",
        "name": "Incidentes de seguridad",
        "description": "Carga masiva de incidentes en rutas operativas",
        "version": "2.1",
        "active": True,
        "entity": "security_incidents",
        "updatedAt": "2026-06-20T10:00:00Z",
        "fields": [
            {"key": "title", "label": "Título", "required": True},
            {"key": "type", "label": "Tipo incidente", "required": True},
            {"key": "severity", "label": "Nivel riesgo", "required": True},
            {"key": "routeName", "label": "Ruta afectada", "required": True},
            {"key": "location", "label": "Ubicación / lugar", "required": False},
            {"key": "latitude", "label": "Latitud", "required": False},
            {"key": "longitude", "label": "Longitud", "required": False},
            {"key": "blocksTransit", "label": "Bloquea tránsito", "required": False},
        ],
    },
]
