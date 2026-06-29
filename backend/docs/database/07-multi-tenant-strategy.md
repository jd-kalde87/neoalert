# 07 — Estrategia multi-tenant

## Modelo: shared cluster + tenant_id + RLS

NEOALERT usa **multi-tenancy lógico** con columna `tenant_id` en todas las tablas tenant-scoped y **Row Level Security (RLS)** como red de seguridad en PostgreSQL.

## Identificación del tenant

| Mecanismo | Uso |
|-----------|-----|
| Header `X-Tenant-ID` | Propagado por api-gateway a todos los servicios |
| JWT claim `tenant_id` | Debe coincidir con header (validación en gateway) |
| Subdominio `{slug}.neoalert.com` | Roadmap — resuelve a tenant_id vía tenant-service |

## Middleware (aplicación)

`TenantContextMiddleware` extrae tenant → `request.state.tenant_id` → dependencies inyectan al use case.

## Row Level Security (PostgreSQL)

En cada request con DB activa:

```sql
SET LOCAL app.current_tenant_id = 'uuid-del-tenant';
```

Política típica (ya en V001 schemas):

```sql
CREATE POLICY tenant_isolation ON employees
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

**Roles de conexión:**
- `neoalert_app` — sujeto a RLS.
- `neoalert_migrator` — BYPASSRLS solo para migraciones batch.

## Índices multi-tenant

Toda consulta operativa filtra por `tenant_id` primero:

```sql
CREATE INDEX idx_incidents_tenant_date ON incidents (tenant_id, incident_date DESC);
CREATE INDEX idx_employees_tenant_code ON employees (tenant_id, employee_code);
```

## Redis y mensajería

- Claves Redis: `{tenant_id}:{namespace}:{key}`
- Eventos RabbitMQ: payload **siempre** incluye `tenant_id` (ver `shared/contracts/events/`)

## Data residency

Campo `tenants.data_residency` en tenant-service:

| Valor | Significado |
|-------|-------------|
| `default` | Cluster compartido región primaria |
| `co` | Colombia — restricción futura |
| `eu` | Unión Europea — GDPR |
| `dedicated-{id}` | Cluster dedicado enterprise |

Path de evolución:

1. **Hoy:** misma instancia Postgres, aislamiento lógico.
2. **Medio plazo:** read replicas por región; writes en región primaria del tenant.
3. **Enterprise:** instancia PostgreSQL dedicada; connection string en `tenant_configurations`.

## Onboarding de tenant

```sql
-- tenant-service
INSERT INTO tenants (tenant_id, name, slug, country_code, data_residency) ...

-- identity-service (admin user)
INSERT INTO users (tenant_id, email, ...) ...

-- template-configuration (clone Structure A/B)
INSERT INTO import_templates ... SELECT ... WHERE tenant_id = :new;
```

## Aislamiento más fuerte (cuando se requiera)

| Nivel | Mecanismo | Cuándo |
|-------|-----------|--------|
| L1 | tenant_id + repos | Skeleton / dev |
| L2 | RLS PostgreSQL | Producción estándar |
| L3 | Schema por tenant | Cliente alto volumen |
| L4 | DB/cluster por tenant | Regulado / enterprise |

## Anti-fugas checklist

- [ ] Ningún SELECT sin filtro tenant en repos SQL.
- [ ] Tests con dos tenants verifican no-leak.
- [ ] Logs enmascaran PII cross-tenant.
- [ ] Export jobs scoped por tenant_id obligatorio.
