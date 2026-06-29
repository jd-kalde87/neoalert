"""Structure B column definitions (editable via template-configuration-service)."""

STRUCTURE_B_COLUMNS: list[dict[str, str]] = [
    {
        "alias": "Fecha del Incidente",
        "canonical_field": "incident_date",
        "data_type": "date",
        "required": "true",
    },
    {
        "alias": "Ubicación Específica",
        "canonical_field": "location",
        "data_type": "string",
        "required": "true",
    },
    {
        "alias": "Tipo de Operativo",
        "canonical_field": "event_type",
        "data_type": "string",
        "required": "true",
    },
    {
        "alias": "Fuerzas de Seguridad",
        "canonical_field": "security_forces",
        "data_type": "string",
        "required": "true",
    },
    {
        "alias": "Detalle de Aseguramiento",
        "canonical_field": "detail",
        "data_type": "text",
        "required": "true",
    },
    {
        "alias": "Cantidad de Artefactos",
        "canonical_field": "artifact_count",
        "data_type": "integer",
        "required": "false",
    },
    {
        "alias": "Autoridad Investigación",
        "canonical_field": "investigation_authority",
        "data_type": "string",
        "required": "false",
    },
    {"alias": "Fuente", "canonical_field": "source", "data_type": "string", "required": "true"},
]
