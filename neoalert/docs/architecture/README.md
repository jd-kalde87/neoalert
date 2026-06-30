# Arquitectura NeoAlert Web

## Patrón

Feature-Sliced Design con capas internas por módulo:

- `components/` — UI pura
- `hooks/` — lógica de composición
- `services/` — integración API
- `types/` — contratos del dominio
- `pages/` — pantallas enrutables

## Reglas de dependencia

1. `features/*` puede importar `shared/*` y `layouts/*`.
2. `shared/*` no importa `features/*`.
3. `app/*` orquesta providers y rutas.

## Estado

| Tipo | Herramienta |
|------|-------------|
| Server state | TanStack Query |
| Global client | Zustand |
| Formularios | React Hook Form + Zod (próxima fase) |
| URL | React Router search params |

## Alias de importación

- `@app/*`
- `@features/*`
- `@shared/*`
- `@layouts/*`
- `@styles/*`
