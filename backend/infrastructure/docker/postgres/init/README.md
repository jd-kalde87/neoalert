# PostgreSQL init scripts

Los scripts de inicialización viven en [`infrastructure/database/init/`](../../database/init/).

Docker Compose monta esos archivos en `/docker-entrypoint-initdb.d/` del contenedor PostGIS.
Los esquemas por servicio están en [`infrastructure/database/schemas/`](../../database/schemas/).

Para recrear la base desde cero:

```powershell
docker compose down -v
docker compose up -d postgres
```
