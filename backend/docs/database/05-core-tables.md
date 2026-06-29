# 05 — Tablas principales

Referencia consolidada. DDL completo en `infrastructure/database/schemas/*/V001__initial_schema.sql`.

## Convenciones de columnas transversales

| Columna | Tipo | Uso |
|---------|------|-----|
| `id` | UUID PK | Identificador |
| `tenant_id` | UUID NOT NULL | Aislamiento multi-tenant |
| `created_at` | TIMESTAMPTZ | Auditoría creación |
| `updated_at` | TIMESTAMPTZ | Última modificación |
| `created_by` / `updated_by` | UUID | Actor (ref identity-service) |
| `deleted_at` | TIMESTAMPTZ | Soft delete donde aplica |
| `metadata` / `extra_fields` | JSONB | Extensibilidad |

---

## identity_service

### users
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| tenant_id | UUID | FK lógico → tenants |
| email | VARCHAR(320) | UNIQUE (tenant_id, email) |
| password_hash | VARCHAR(255) | bcrypt/argon2 |
| full_name | VARCHAR(200) | |
| is_active, mfa_enabled | BOOLEAN | |
| last_login_at | TIMESTAMPTZ | |

### roles / permissions / role_permissions / user_roles
RBAC estándar; permissions es catálogo global.

### refresh_tokens / user_sessions
Token hash, expiración, IP, user_agent.

---

## tenant_service

### tenants
| Columna | Tipo | Notas |
|---------|------|-------|
| tenant_id | UUID UNIQUE | ID canónico cross-service |
| slug | VARCHAR(80) UNIQUE | Subdominio futuro |
| status | VARCHAR(32) | active, suspended, ... |
| data_residency | VARCHAR(32) | Routing regional |
| country_code | CHAR(2) | |

### tenant_configurations
`config_key` + `config_value` JSONB; versionado por fila.

---

## employee_service

### employees
| Columna | Tipo | Notas |
|---------|------|-------|
| employee_code | VARCHAR(64) | UNIQUE (tenant_id, code) |
| user_id | UUID | Opcional, portal |
| position_id | UUID FK | → positions |
| status | VARCHAR(32) | active, terminated, ... |

### sites
| Columna | Tipo | Notas |
|---------|------|-------|
| location | GEOGRAPHY(POINT,4326) | Centro |
| boundary | GEOMETRY(POLYGON,4326) | Perímetro |
| radius_meters | NUMERIC | Alternativa circular |

---

## attendance_service

### attendance_records
| Columna | Tipo | Notas |
|---------|------|-------|
| record_type | VARCHAR(32) | check_in, check_out, ... |
| recorded_at | TIMESTAMPTZ | |
| location | GEOGRAPHY(POINT) | GPS del evento |
| inside_geofence | BOOLEAN | Resultado validación |

---

## location_service

### location_traces
| Columna | Tipo | Notas |
|---------|------|-------|
| recorded_at | TIMESTAMPTZ | Partición RANGE |
| location | GEOGRAPHY(POINT) NOT NULL | |
| accuracy_meters | NUMERIC | |
| speed_kmh, heading_degrees | NUMERIC | |

### geofences
`boundary`, `center`, `radius_meters` según `geofence_type`.

---

## incident_service

### incidents
| Columna | Tipo | Notas |
|---------|------|-------|
| incident_date | DATE | |
| event_type | VARCHAR(120) | |
| severity, status | VARCHAR | |
| location | GEOGRAPHY(POINT) | |
| canonical_payload | JSONB | Campos canónicos import |
| extra_fields | JSONB | Columnas no mapeadas |
| source_batch_id | UUID | Trazabilidad import |

---

## file_ingestion_service

### staging_rows
| Columna | Tipo | Notas |
|---------|------|-------|
| row_number | INTEGER | Posición en archivo |
| raw_payload | JSONB | Headers originales → valores |
| normalized_payload | JSONB | Post-alias/tipo |
| validation_status | VARCHAR(16) | pending, valid, invalid |

### canonical_imported_events
Campos canónicos desnormalizados + `canonical_fields` JSONB completo.

---

## template_configuration_service

### template_columns
| Columna | Tipo | Notas |
|---------|------|-------|
| source_header | VARCHAR(200) | Header Excel/CSV |
| canonical_field | VARCHAR(128) | incident_date, etc. |
| data_type | VARCHAR(32) | date, decimal, ... |
| validation_rules | JSONB | Reglas adicionales |

---

## audit_service

### audit_events
| Columna | Tipo | Notas |
|---------|------|-------|
| action | VARCHAR(64) | create, update, delete, login |
| entity_type, entity_id | | Objeto afectado |
| payload_before / payload_after | JSONB | Snapshots |
| checksum | CHAR(64) | Integridad |

**Sin UPDATE/DELETE** — protegido por trigger.
