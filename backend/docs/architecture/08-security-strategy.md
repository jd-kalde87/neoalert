# 08 - Estrategia de Seguridad

## Autenticación (Identity Service)

- **JWT** access tokens (corta duración) + refresh tokens (larga duración)
- Login via email/password con bcrypt/argon2 para hash
- **MFA** opcional por usuario (TOTP hook en skeleton)
- Sesiones activas rastreables y revocables

## Autorización (RBAC)

- Roles: `admin`, `supervisor`, `operator`, `viewer` (extensible)
- Permisos granulares por recurso/acción
- Hook `require_role()` en `presentation/dependencies/auth_dependencies.py`
- Gateway puede pre-validar token; servicios validan claims localmente

## Multi-Capa de Defensa

```
Cliente → [TLS] → Gateway [Rate Limit] → [JWT Check] → Service [RBAC] → Use Case
```

## Headers de Seguridad

| Header | Propósito |
|--------|-----------|
| `Authorization: Bearer <jwt>` | Identidad del usuario |
| `X-Tenant-ID: <uuid>` | Contexto multi-tenant |
| `X-Correlation-ID: <uuid>` | Trazabilidad (no seguridad, pero auditoría) |

## Tenant Isolation

- Middleware `TenantContextMiddleware` extrae `X-Tenant-ID`
- Todas las queries de repository filtran por `tenant_id`
- Cross-tenant access = 403 Forbidden

## Rate Limiting (API Gateway)

- Hook en `rate_limit_router.py`
- Producción: Redis sliding window por IP/tenant/user
- Respuesta 429 Too Many Requests

## Secretos

- `JWT_SECRET_KEY` via environment variables (nunca en código)
- `.env` excluido de git (ver `.gitignore`)
- Rotación de secretos soportada via config reload

## Audit Trail

- Toda acción sensible genera evento → audit-service
- Logs inmutables con hash encadenado (futuro: blockchain-style integrity)

## Recomendaciones Producción

1. mTLS entre servicios internos
2. OAuth2/OIDC para SSO empresarial
3. WAF delante del gateway
4. Secrets manager (Vault, AWS Secrets Manager)
5. OWASP API Security Top 10 compliance
