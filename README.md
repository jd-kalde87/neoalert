# NeoAlert

Plataforma enterprise omnicanal para operación de campo, supervisión, asistencia laboral, geolocalización, incidentes territoriales, mapas, notificaciones, cargue de archivos, auditoría y reportería.

## Estado actual

- **Web (React + TypeScript + Vite):** arquitectura feature-sliced implementada en `src/`.
- **Móvil (Flutter):** en espera — ver `mobile/README.md`.

## Estructura

```
neoalert/
├── src/
│   ├── app/          # Bootstrap, providers, router
│   ├── features/     # Módulos de negocio
│   ├── layouts/      # Shells de página
│   ├── shared/       # Componentes, hooks, API, stores, tipos
│   └── styles/       # Tokens y estilos globales
├── mobile/           # Placeholder Flutter (Fase 2)
├── docs/             # Documentación de arquitectura
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
