"""Catálogo de rutas de la aplicación y permisos requeridos (alineado con el frontend NeoAlert)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class AccessRouteEntry:
    route: str
    label: str
    group: str
    permission_code: str
    write_permission_code: str | None = None


ACCESS_ROUTE_CATALOG: list[AccessRouteEntry] = [
    AccessRouteEntry("/dashboard", "Dashboard", "Operación", "dashboard:read"),
    AccessRouteEntry("/maps", "Mapa de rutas", "Operación", "maps:read"),
    AccessRouteEntry("/maps/heatmap", "Mapa de calor", "Operación", "maps:read"),
    AccessRouteEntry("/operations", "Operaciones", "Operación", "operations:read", "operations:write"),
    AccessRouteEntry("/operations/plants/new", "Nueva planta", "Operación", "operations:write"),
    AccessRouteEntry("/operations/sites/new", "Nuevo sitio", "Operación", "operations:write"),
    AccessRouteEntry("/operations/routes/new", "Nueva ruta", "Operación", "operations:write"),
    AccessRouteEntry("/incidents", "Incidentes", "Seguridad", "incidents:read", "incidents:write"),
    AccessRouteEntry("/incidents/new", "Nuevo incidente", "Seguridad", "incidents:write"),
    AccessRouteEntry("/attendance", "Asistencia", "Operación", "attendance:read"),
    AccessRouteEntry("/notifications", "Notificaciones", "Operación", "notifications:read"),
    AccessRouteEntry("/imports", "Importaciones", "Datos", "imports:read", "imports:write"),
    AccessRouteEntry("/imports/upload", "Subir importación", "Datos", "imports:write"),
    AccessRouteEntry("/import-templates", "Plantillas de importación", "Datos", "import-templates:read", "import-templates:write"),
    AccessRouteEntry("/import-templates/new", "Nueva plantilla", "Datos", "import-templates:write"),
    AccessRouteEntry("/reports", "Reportes", "Analítica", "reports:read"),
    AccessRouteEntry("/audit", "Auditoría", "Seguridad", "audit:read"),
    AccessRouteEntry("/users", "Gestión de usuarios", "Administración", "users:read", "users:write"),
    AccessRouteEntry("/roles", "Roles y permisos", "Administración", "roles:read", "roles:manage"),
]

FEATURE_PERMISSIONS: list[tuple[str, str, str, str]] = [
    ("dashboard:read", "Ver dashboard", "dashboard", "read"),
    ("maps:read", "Ver mapas", "maps", "read"),
    ("operations:read", "Ver operaciones", "operations", "read"),
    ("operations:write", "Gestionar operaciones", "operations", "write"),
    ("incidents:read", "Ver incidentes", "incidents", "read"),
    ("incidents:write", "Gestionar incidentes", "incidents", "write"),
    ("attendance:read", "Ver asistencia", "attendance", "read"),
    ("notifications:read", "Ver notificaciones", "notifications", "read"),
    ("imports:read", "Ver importaciones", "imports", "read"),
    ("imports:write", "Gestionar importaciones", "imports", "write"),
    ("import-templates:read", "Ver plantillas", "import-templates", "read"),
    ("import-templates:write", "Gestionar plantillas", "import-templates", "write"),
    ("reports:read", "Ver reportes", "reports", "read"),
    ("audit:read", "Ver auditoría", "audit", "read"),
]

DEFAULT_ROLES: list[tuple[str, str, str, list[str]]] = [
    (
        "supervisor",
        "Supervisor",
        "Supervisión operativa de rutas e incidentes",
        [
            "dashboard:read",
            "maps:read",
            "operations:read",
            "operations:write",
            "incidents:read",
            "incidents:write",
            "attendance:read",
            "notifications:read",
            "imports:read",
            "imports:write",
            "import-templates:read",
            "import-templates:write",
            "reports:read",
        ],
    ),
    (
        "viewer",
        "Visualizador",
        "Acceso de solo lectura a dashboards y reportes",
        ["dashboard:read", "maps:read", "notifications:read", "reports:read"],
    ),
    (
        "analyst",
        "Analista",
        "Análisis de incidentes, reportes y auditoría",
        [
            "dashboard:read",
            "maps:read",
            "incidents:read",
            "reports:read",
            "audit:read",
            "notifications:read",
        ],
    ),
    (
        "operator",
        "Operador",
        "Marcación de asistencia y notificaciones",
        ["dashboard:read", "attendance:read", "notifications:read"],
    ),
    (
        "colaborador",
        "Colaborador",
        "Acceso básico de campo",
        ["dashboard:read", "attendance:read", "notifications:read"],
    ),
]
