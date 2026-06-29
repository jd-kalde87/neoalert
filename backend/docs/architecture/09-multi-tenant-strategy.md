# 09 - Estrategia Multi-Tenant

## Modelo: Shared Database, Separate Schema (evolución)

**Fase skeleton (actual)**: DB lógica separada por servicio, `tenant_id` en cada entidad.

**Fase producción recomendada**: schema por tenant en servicios de alto volumen, o DB por tenant para clientes enterprise.

## Identificación de Tenant

1. **Header HTTP**: `X-Tenant-ID: <uuid>` (propagado por gateway)
2. **JWT claim**: `tenant_id` embebido en token (validado vs header)
3. **Subdomain** (futuro): `{tenant}.neoalert.com` → resuelve tenant_id

## Middleware

`TenantContextMiddleware` en cada servicio:
- Extrae `X-Tenant-ID` del request
- Almacena en `request.state.tenant_id`
- Dependencies inyectan tenant al use case

## Aislamiento de Datos

```python
@dataclass
class Employee:
    tenant_id: UUID  # SIEMPRE presente
    ...
```

Repository pattern garantiza filtro:
```python
async def find_by_id(self, tenant_id: UUID, employee_id: UUID) -> Employee | None
```

## Configuración por Tenant (tenant-service)

- Branding (logo, colores)
- País/región y data residency
- Feature flags por tenant
- Límites (rate, storage, users)

## Data Residency

- Campo `data_residency` en entidad Tenant
- Routing futuro a regiones cloud específicas
- Restricción de replicación cross-region

## Onboarding Flow

```
1. Admin crea tenant (tenant-service)
2. Se provisiona config default + branding
3. Admin crea usuarios (identity-service) vinculados al tenant
4. Templates Structure A/B se clonan para el tenant (template-configuration-service)
```

## Consideraciones

| Aspecto | Enfoque |
|---------|---------|
| Cache keys | Prefijo `{tenant_id}:` en Redis |
| Eventos | Siempre incluyen `tenant_id` |
| Reporting | Agregaciones scoped por tenant |
| Audit | Queries filtradas por tenant obligatorio |
