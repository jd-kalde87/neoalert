# NeoAlert (Web)

Plataforma enterprise para operación de campo, supervisión, asistencia laboral, geolocalización, incidentes territoriales, mapas, notificaciones, cargue de archivos, auditoría y reportería.

## Estado actual

- **Web (este repositorio):** React + TypeScript + Vite — arquitectura feature-sliced en `src/`.
- **Móvil (proyecto separado):** Flutter en `C:\Users\SALUD PUBLICA\neoalert_movil` — ver `neoalert_movil/README.md`.

## Estructura

```
neoalert/
├── src/
│   ├── app/          # Bootstrap, providers, router
│   ├── features/     # Módulos de negocio
│   ├── layouts/      # Shells de página
│   ├── shared/       # Componentes, hooks, API, stores, tipos
│   └── styles/       # Tokens y estilos globales
├── docs/             # Documentación de arquitectura y contratos API
└── tests/            # Unit, integración, E2E
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Variables de entorno

Crear `.env` si aplica:

```
VITE_API_BASE_URL=/api
```

## Login de desarrollo

El login actual es demostración local: cualquier usuario/contraseña no vacíos crea sesión mock y redirige al dashboard.

## App móvil

La aplicación Flutter vive en una carpeta hermana, no dentro de este proyecto:

```
C:\Users\SALUD PUBLICA\neoalert_movil
```

Ambos comparten dominio de negocio (incidentes, asistencia, mapas) y los mismos contratos API documentados en `docs/api-contracts/`.
