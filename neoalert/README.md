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

Copia `.env.example` a `.env`:

```
VITE_API_BASE_URL=/api
VITE_USE_MOCK_API=false
VITE_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001
```

Con `VITE_USE_MOCK_API=false`, el frontend consume el API Gateway del backend (`http://localhost:8000` vía proxy de Vite en desarrollo).

## Integración con backend

1. Levanta infraestructura y servicios en `D:\Proyecto_seguridad\NEOALERT\backend`:
   ```powershell
   docker compose up -d postgres redis rabbitmq
   docker compose up -d --build api-gateway identity-service incident-service reporting-service attendance-service location-service notification-service file-ingestion-service template-configuration-service audit-service employee-service
   ```
2. Inicia el frontend: `npm run dev`
3. Login real: `admin@neoalert.com` / `Admin123!`

Para modo demo sin backend, usa `VITE_USE_MOCK_API=true`.
