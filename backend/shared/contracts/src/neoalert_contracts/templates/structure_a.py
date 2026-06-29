"""Structure A column definitions (editable via template-configuration-service)."""

STRUCTURE_A_COLUMNS: list[dict[str, str]] = [
    {"alias": "Fecha", "canonical_field": "incident_date", "data_type": "date", "required": "true"},
    {"alias": "Ubicación", "canonical_field": "location", "data_type": "string", "required": "true"},
    {
        "alias": "Tipo de Evento o Acción",
        "canonical_field": "event_type",
        "data_type": "string",
        "required": "true",
    },
    {
        "alias": "Detalle del Aseguramiento o Resultado",
        "canonical_field": "detail",
        "data_type": "text",
        "required": "true",
    },
    {
        "alias": "Instituciones Involucradas",
        "canonical_field": "involved_institutions",
        "data_type": "string",
        "required": "false",
    },
    {
        "alias": "Monto de Inversión",
        "canonical_field": "investment_amount",
        "data_type": "decimal",
        "required": "false",
    },
    {"alias": "Fuente", "canonical_field": "source", "data_type": "string", "required": "true"},
]
