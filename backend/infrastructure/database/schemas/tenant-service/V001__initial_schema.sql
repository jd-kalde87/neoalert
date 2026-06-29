-- tenant-service: tenants, catalogs, regional config
-- Database: tenant_service

CREATE TABLE countries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code        CHAR(2) NOT NULL UNIQUE,
    iso3_code       CHAR(3) NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    default_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE countries IS 'Global country catalog.';

CREATE TABLE regions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id      UUID NOT NULL REFERENCES countries(id),
    code            VARCHAR(16) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_regions_country_code UNIQUE (country_id, code)
);
COMMENT ON TABLE regions IS 'Administrative regions within a country.';

CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(80) NOT NULL UNIQUE,
    status          VARCHAR(32) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'provisioning', 'archived')),
    country_code    CHAR(2) NOT NULL,
    region_id       UUID REFERENCES regions(id),
    data_residency  VARCHAR(32) NOT NULL DEFAULT 'default',
    default_locale  VARCHAR(10) NOT NULL DEFAULT 'es-CO',
    timezone        VARCHAR(64) NOT NULL DEFAULT 'America/Bogota',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID
);
COMMENT ON TABLE tenants IS 'Enterprise customer (tenant) master record. tenant_id mirrors id for cross-service FK references.';

CREATE TABLE tenant_configurations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    config_key      VARCHAR(128) NOT NULL,
    config_value    JSONB NOT NULL DEFAULT '{}',
    is_secret       BOOLEAN NOT NULL DEFAULT FALSE,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID,
    CONSTRAINT uq_tenant_config_key UNIQUE (tenant_id, config_key)
);
COMMENT ON TABLE tenant_configurations IS 'Key-value tenant settings (feature flags, limits, integrations).';

CREATE TABLE tenant_branding (
    tenant_id       UUID PRIMARY KEY REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    logo_url        TEXT,
    primary_color   CHAR(7),
    secondary_color CHAR(7),
    custom_domain   VARCHAR(253),
    theme_json      JSONB NOT NULL DEFAULT '{}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE tenant_branding IS 'White-label branding per tenant.';

CREATE TABLE tenant_feature_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    flag_key        VARCHAR(80) NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    payload         JSONB NOT NULL DEFAULT '{}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_feature_flag UNIQUE (tenant_id, flag_key)
);

CREATE TABLE catalog_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    catalog_type    VARCHAR(64) NOT NULL,
    code            VARCHAR(64) NOT NULL,
    label           VARCHAR(200) NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_catalog_items UNIQUE (tenant_id, catalog_type, code)
);
COMMENT ON TABLE catalog_items IS 'Tenant-scoped reference catalogs (incident types, document types, etc.).';

CREATE INDEX idx_tenants_status ON tenants (status);
CREATE INDEX idx_tenants_country ON tenants (country_code, data_residency);
CREATE INDEX idx_tenant_config_tenant ON tenant_configurations (tenant_id, config_key);
CREATE INDEX idx_catalog_items_lookup ON catalog_items (tenant_id, catalog_type, is_active);

ALTER TABLE tenant_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_config ON tenant_configurations
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
