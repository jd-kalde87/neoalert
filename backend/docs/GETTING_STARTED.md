# NEOALERT Backend — Guía de inicio (Windows)

Esta guía explica cómo levantar la infraestructura local, ejecutar microservicios individualmente y correr pruebas. Los servicios actuales son **skeletons** (respuestas stub); la base de datos ya está modelada y se inicializa con Docker.

## Prerrequisitos

| Requisito | Notas |
|-----------|-------|
| Python 3.11+ | Con venv ya creado |
| Dependencias | `pip install -r requirements.txt` desde la raíz del backend |
| Docker Desktop | Para PostgreSQL/PostGIS, Redis y RabbitMQ |
| PowerShell | Comandos de esta guía orientados a Windows |

Copia variables de entorno:

```powershell
cd D:\Proyecto_seguridad\NEOALERT\backend
Copy-Item .env.example .env
```

Activa el entorno virtual:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## 1. Levantar infraestructura

Solo infraestructura (recomendado para desarrollo local de servicios en el host):

```powershell
docker compose up -d postgres redis rabbitmq mailpit
```

PostgreSQL se expone en el **host** en el puerto **5433** (mapeo `5433:5432`). El contenedor sigue escuchando en 5432 internamente; los microservicios en Docker usan `postgres:5432`. Desde el host (uvicorn local, `psql`, DBeaver) usa **`localhost:5433`**.

> **Conflicto con PostgreSQL local en 5432:** Si ya tienes PostgreSQL instalado en Windows, suele ocupar el puerto 5432 y Docker fallará con `port is already allocated`. Este proyecto usa **5433** en el host para evitarlo. Para ver qué proceso usa 5432:
>
> ```powershell
> netstat -ano | findstr :5432
> ```
>
> Alternativa: detén el servicio PostgreSQL local si prefieres mapear Docker a 5432 (cambia el puerto en `docker-compose.yml` y en `.env`).

Espera a que los contenedores estén healthy:

```powershell
docker compose ps
```

Para levantar **toda** la plataforma (13 microservicios + infra) en contenedores:

```powershell
docker compose up -d --build
```

Ver estado y healthchecks:

```powershell
docker compose ps
```

Detener todo el stack:

```powershell
docker compose down
```

---

## 2. Verificar salud de PostgreSQL, Redis y RabbitMQ

### PostgreSQL + PostGIS

Desde **dentro** del contenedor (no depende del puerto del host):

```powershell
docker compose exec postgres pg_isready -U neoalert -d neoalert
docker compose exec postgres psql -U neoalert -d neoalert -c "\l"
```

Desde el **host** (uvicorn local, cliente SQL), conecta a **`localhost:5433`**:

```powershell
docker compose ps postgres
# Debe mostrar 0.0.0.0:5433->5432/tcp

# Si tienes psql instalado en Windows:
psql "postgresql://neoalert:neoalert@localhost:5433/neoalert" -c "\l"
```

Debes ver **13 bases lógicas** además de `neoalert`: `api_gateway`, `identity_service`, `tenant_service`, etc.

Verificar PostGIS en una base geoespacial:

```powershell
docker compose exec postgres psql -U neoalert -d location_service -c "SELECT PostGIS_Version();"
```

Verificar tablas creadas:

```powershell
docker compose exec postgres psql -U neoalert -d identity_service -c "\dt"
```

### Redis

```powershell
docker compose exec redis redis-cli ping
```

Respuesta esperada: `PONG`

### RabbitMQ

```powershell
docker compose exec rabbitmq rabbitmq-diagnostics ping
```

Consola de administración: [http://localhost:15672](http://localhost:15672) — usuario `neoalert` / contraseña `neoalert`

---

## 2.1 Levantar todos los microservicios

Hay dos formas de arrancar los **13 servicios** a la vez:

### Opción A — Docker (stack completo en contenedores)

Recomendado para probar el entorno integrado sin instalar dependencias Python en el host (solo Docker Desktop).

```powershell
cd D:\Proyecto_seguridad\NEOALERT\backend
docker compose up -d --build
```

Los servicios usan la red interna de Docker (`postgres:5432`, `redis:6379`, `rabbitmq:5672`). Los puertos **8000–8012** se publican en `localhost`.

Verificar contenedores healthy:

```powershell
docker compose ps
```

Comprobar health de cada servicio desde el host:

```powershell
.\scripts\check-health.ps1
```

O manualmente:

```powershell
8000..8012 | ForEach-Object { Invoke-WebRequest "http://localhost:$_/health" -UseBasicParsing | Select-Object StatusCode, @{N='Port';E={$_}} }
```

Detener:

```powershell
docker compose down
```

### Opción B — Desarrollo local con hot reload (PowerShell)

Recomendado para desarrollo diario: infra en Docker, microservicios con `uvicorn --reload` en el host.

Prerrequisitos: venv activo y `pip install -r requirements.txt`. Copia `.env.example` → `.env` (usa `localhost:5433` para Postgres).

```powershell
cd D:\Proyecto_seguridad\NEOALERT\backend
.\.venv\Scripts\Activate.ps1
Copy-Item .env.example .env   # solo la primera vez
.\scripts\start-all.ps1
```

El script:

1. Levanta `postgres`, `redis` y `rabbitmq` si no están corriendo
2. Inicia los 13 servicios en segundo plano con `--reload`
3. Escribe logs en `logs/{servicio}.log`
4. Guarda PIDs en `logs/running.pids.json`

Detener microservicios (deja infra corriendo):

```powershell
.\scripts\stop-all.ps1
```

Detener también infra:

```powershell
.\scripts\stop-all.ps1 -StopInfra
```

Verificar salud:

```powershell
.\scripts\check-health.ps1
```

| Script | Propósito |
|--------|-----------|
| `scripts/start-all.ps1` | Infra + 13 uvicorn con reload |
| `scripts/stop-all.ps1` | Detiene procesos locales |
| `scripts/check-health.ps1` | Prueba `GET /health` en 8000–8012 |

---

## 3. Ejecutar cada microservicio (uvicorn en el host)

Desde la raíz del backend, con el venv activo. Cada servicio necesita `PYTHONPATH` apuntando a su carpeta `src`.

### Tabla de puertos

| Servicio | Puerto | Módulo uvicorn |
|----------|--------|----------------|
| api-gateway | 8000 | `presentation.main:app` |
| identity-service | 8001 | `presentation.main:app` |
| tenant-service | 8002 | `presentation.main:app` |
| employee-service | 8003 | `presentation.main:app` |
| attendance-service | 8004 | `presentation.main:app` |
| location-service | 8005 | `presentation.main:app` |
| incident-service | 8006 | `presentation.main:app` |
| file-ingestion-service | 8007 | `presentation.main:app` |
| template-configuration-service | 8008 | `presentation.main:app` |
| notification-service | 8009 | `presentation.main:app` |
| reporting-service | 8010 | `presentation.main:app` |
| ai-service | 8011 | `presentation.main:app` |
| audit-service | 8012 | `presentation.main:app` |

### Ejemplo: identity-service (PowerShell)

```powershell
$env:PYTHONPATH = "D:\Proyecto_seguridad\NEOALERT\backend\services\identity-service\src"
$env:IDENTITYSERVICE_DATABASE_URL = "postgresql+asyncpg://neoalert:neoalert@localhost:5433/identity_service"
$env:IDENTITYSERVICE_REDIS_URL = "redis://localhost:6379/1"
uvicorn presentation.main:app --host 0.0.0.0 --port 8001 --reload
```

### Ejemplo: tenant-service

```powershell
$env:PYTHONPATH = "D:\Proyecto_seguridad\NEOALERT\backend\services\tenant-service\src"
$env:TENANTSERVICE_DATABASE_URL = "postgresql+asyncpg://neoalert:neoalert@localhost:5433/tenant_service"
uvicorn presentation.main:app --host 0.0.0.0 --port 8002 --reload
```

### Ejemplo: api-gateway

```powershell
$env:PYTHONPATH = "D:\Proyecto_seguridad\NEOALERT\backend\services\api-gateway\src"
$env:APIGATEWAY_IDENTITY_SERVICE_URL = "http://localhost:8001"
uvicorn presentation.main:app --host 0.0.0.0 --port 8000 --reload
```

**Patrón general** — sustituye `{service}` y `{port}`:

```powershell
$env:PYTHONPATH = "D:\Proyecto_seguridad\NEOALERT\backend\services\{service}\src"
uvicorn presentation.main:app --host 0.0.0.0 --port {port} --reload
```

Documentación OpenAPI por servicio: `http://localhost:{port}/docs`

---

## 4. Probar vía API Gateway

1. Levanta al menos `identity-service` (8001) y `api-gateway` (8000).
2. Health del gateway:

```powershell
curl http://localhost:8000/health
```

3. Rutas configuradas (skeleton):

```powershell
curl http://localhost:8000/gateway/routes
```

4. Con header de tenant (requerido en producción; middleware ya presente):

```powershell
curl -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001" http://localhost:8000/health
```

> El proxy completo hacia downstream está en roadmap; hoy puedes llamar servicios directamente por puerto.

---

## 5. Email verification (real SMTP)

Registration sends a verification email to the **email address in the registration request** (`POST /auth/register` body). Delivery uses the configured adapter in identity-service.

### Required `.env` variables (backend root)

Copy `.env.example` to `.env` and set:

```env
IDENTITYSERVICE_EMAIL_ADAPTER=smtp
IDENTITYSERVICE_SMTP_HOST=smtp.gmail.com
IDENTITYSERVICE_SMTP_PORT=587
IDENTITYSERVICE_SMTP_USER=your@gmail.com
IDENTITYSERVICE_SMTP_PASSWORD=your-gmail-app-password
IDENTITYSERVICE_SMTP_FROM_EMAIL=your@gmail.com
IDENTITYSERVICE_SMTP_USE_TLS=true
```

If `IDENTITYSERVICE_EMAIL_ADAPTER` is omitted but host/user/password are set to a real SMTP provider (not `mailpit`/`localhost`), identity-service auto-selects `smtp`.

For Gmail, create an [App Password](https://myaccount.google.com/apppasswords) (2FA required).

### Apply configuration

```powershell
docker compose up -d --build identity-service
```

identity-service loads `.env` via `env_file` in `docker-compose.yml`. Email settings are **not** hardcoded to console or Mailpit anymore.

### Verify SMTP in logs

After startup:

```powershell
docker compose logs identity-service | Select-String -Pattern "Email adapter|SMTP delivery"
```

Expected on success:

```text
Email adapter: smtp
SMTP delivery enabled: host=smtp.gmail.com port=587 TLS=True from=your@gmail.com user=your@gmail.com
```

After registration:

```powershell
docker compose logs identity-service | Select-String -Pattern "Email sent via SMTP"
```

Expected:

```text
Email sent via SMTP (smtp.gmail.com:587) to user@example.com: Verify your NEOALERT account
```

If SMTP fails, logs show `Failed to send email via SMTP` with the exception. The register API still returns HTTP 200 but includes `"verification_email_sent": false` and a warning `message`.

### Console-only mode (no real inbox)

Only use this when you intentionally do not want outbound mail:

```env
IDENTITYSERVICE_EMAIL_ADAPTER=console
```

Verification links appear in `docker compose logs -f identity-service` as `[DEV EMAIL — NOT SENT TO INBOX]`.

### Register and verify (curl)

```powershell
curl -X POST http://localhost:8001/auth/register `
  -H "Content-Type: application/json" `
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000001" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Password123!\",\"full_name\":\"Test User\",\"username\":\"testuser\"}'
```

Copy the verification URL from logs or Mailpit, then:

```powershell
curl -X POST http://localhost:8001/auth/verify-email `
  -H "Content-Type: application/json" `
  -d '{\"token\":\"PASTE_TOKEN_FROM_EMAIL\"}'
```

---

## 6. Ejemplos de peticiones (curl)

### Health (cualquier servicio)

```powershell
curl http://localhost:8001/health
curl http://localhost:8001/health/live
curl http://localhost:8001/health/ready
```

### Login skeleton (identity-service)

```powershell
curl -X POST http://localhost:8001/auth/login `
  -H "Content-Type: application/json" `
  -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001"
```

### Tenant skeleton

```powershell
curl -X POST http://localhost:8002/tenants `
  -H "Content-Type: application/json" `
  -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001"

curl http://localhost:8002/tenants/00000000-0000-4000-8000-000000000001 `
  -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001"
```

### Con httpie (opcional)

```powershell
pip install httpie
http GET localhost:8000/health
http POST localhost:8001/auth/login X-Tenant-ID:00000000-0000-4000-8000-000000000001
```

---

## 7. Ejecutar pytest

Desde la raíz del backend (venv activo):

```powershell
# Todos los tests de todos los servicios
pytest

# Solo tests unitarios
pytest services/*/tests/unit

# Solo integración (health endpoints)
pytest services/*/tests/integration

# Contratos
pytest -m contract

# Un servicio específico
pytest services/identity-service/tests -v
```

Ejecutar desde la carpeta del servicio (alternativa):

```powershell
cd services\identity-service
pytest -v
```

Los tests actuales usan repositorios **in-memory**; no requieren PostgreSQL levantado.

---

## 8. Seeds opcionales (templates Structure A/B)

Después del primer arranque de Postgres:

```powershell
docker compose exec -T postgres psql -U neoalert -d template_configuration_service -f /schemas/../seeds/structure_a_template.sql
```

Como los seeds no están montados por defecto, cópialos al contenedor o ejecútalos desde el host con `psql` instalado:

```powershell
Get-Content infrastructure\database\seeds\structure_a_template.sql | docker compose exec -T postgres psql -U neoalert -d template_configuration_service
Get-Content infrastructure\database\seeds\structure_b_template.sql | docker compose exec -T postgres psql -U neoalert -d template_configuration_service
```

---

## 9. Solución de problemas

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `Bind for 0.0.0.0:5432 failed: port is already allocated` | PostgreSQL local u otro proceso en 5432 | Usa el mapeo por defecto **5433** (ya configurado). Verifica con `netstat -ano \| findstr :5432` o detén PostgreSQL local |
| `ModuleNotFoundError: presentation` | PYTHONPATH incorrecto | Exporta `PYTHONPATH` a `services/{svc}/src` |
| `ModuleNotFoundError: neoalert_observability` | Shared libs no instaladas | `pip install -r requirements.txt` desde la raíz |
| Puerto en uso | Otro proceso en 800x | Cambia puerto en uvicorn o detén el proceso |
| Postgres sin 13 DBs | Volumen antiguo | `docker compose down -v` y volver a subir postgres |
| Init scripts no corrieron | Volumen ya existía | Ejecuta `.\scripts\init-db.ps1` (sin borrar datos) o borra volumen `postgres_data` |
| `relation "permissions" does not exist` (identity-service) | Bases creadas pero sin tablas (volumen previo a los schemas) | `.\scripts\init-db.ps1 -Service identity-service` y reinicia identity-service |
| PostGIS no disponible | Imagen incorrecta | Verifica `postgis/postgis:16-3.4-alpine` en docker-compose |
| Docker no arranca en Windows | WSL2 / virtualización | Habilita WSL2 y reinicia Docker Desktop |
| Registro OK pero no llega email | `EMAIL_ADAPTER=console`, `.env` no cargado en el contenedor, o SMTP mal configurado | Ver [Email verification (real SMTP)](#5-email-verification-real-smtp); confirma `Email adapter: smtp` en logs |
| `curl` no reconocido | PowerShell antiguo | Usa `Invoke-WebRequest` o instala curl |

Recrear base de datos desde cero:

```powershell
docker compose down -v
docker compose up -d postgres
# Esperar healthy, luego verificar \l
```

Aplicar schemas **sin** borrar el volumen (recomendado si ya tienes datos):

```powershell
docker compose up -d postgres
.\scripts\init-db.ps1
# Solo identity-service:
.\scripts\init-db.ps1 -Service identity-service
docker compose up -d --build identity-service
```

Verificar tablas de identity:

```powershell
docker compose exec postgres psql -U neoalert -d identity_service -c "\dt"
# Debe listar permissions, roles, users, refresh_tokens, etc.
```

---

## 10. Prueba end-to-end mínima hoy

1. `docker compose up -d postgres redis rabbitmq`
2. Verificar Postgres (`\l`, `\dt` en `identity_service`)
3. Activar venv + `pip install -r requirements.txt`
4. Levantar **identity-service** en 8001 (comando de la sección 3)
5. `curl http://localhost:8001/health` → `{"status":"healthy"}`
6. `curl -X POST http://localhost:8001/auth/login -H "X-Tenant-ID: ..."` → skeleton OK

Documentación de arquitectura de datos: [`docs/database/README.md`](database/README.md)
