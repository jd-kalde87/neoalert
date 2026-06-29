-- template-configuration-service: Structure A/B templates, versioning, column mapping
-- Database: template_configuration_service

CREATE TABLE import_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    structure_type  CHAR(1) NOT NULL CHECK (structure_type IN ('A', 'B')),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    current_version INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    CONSTRAINT uq_templates_tenant_code UNIQUE (tenant_id, code)
);
COMMENT ON TABLE import_templates IS 'Editable import templates per tenant (Structure A or B).';

CREATE TABLE template_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    template_id     UUID NOT NULL REFERENCES import_templates(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),
    change_summary  TEXT,
    published_at    TIMESTAMPTZ,
    published_by    UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    CONSTRAINT uq_template_version UNIQUE (template_id, version_number)
);
COMMENT ON TABLE template_versions IS 'Immutable version snapshots when columns change.';

CREATE TABLE template_columns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    template_version_id UUID NOT NULL REFERENCES template_versions(id) ON DELETE CASCADE,
    column_order    INTEGER NOT NULL,
    source_header   VARCHAR(200) NOT NULL,
    canonical_field VARCHAR(128) NOT NULL,
    data_type       VARCHAR(32) NOT NULL
                    CHECK (data_type IN ('string', 'text', 'date', 'integer', 'decimal', 'boolean')),
    is_required     BOOLEAN NOT NULL DEFAULT FALSE,
    default_value   TEXT,
    validation_rules JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT uq_template_column_header UNIQUE (template_version_id, source_header)
);

CREATE TABLE column_aliases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    template_column_id UUID NOT NULL REFERENCES template_columns(id) ON DELETE CASCADE,
    alias_text      VARCHAR(200) NOT NULL,
    locale          VARCHAR(10) NOT NULL DEFAULT 'es',
    CONSTRAINT uq_column_alias UNIQUE (template_column_id, alias_text)
);
COMMENT ON TABLE column_aliases IS 'Alternate header spellings mapping to the same column.';

CREATE TABLE canonical_field_mappings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    structure_type  CHAR(1) NOT NULL,
    canonical_field VARCHAR(128) NOT NULL,
    target_entity   VARCHAR(64) NOT NULL DEFAULT 'incident',
    target_column   VARCHAR(128) NOT NULL,
    transform_expr  TEXT,
    is_core         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_canonical_mapping UNIQUE (tenant_id, structure_type, canonical_field)
);
COMMENT ON TABLE canonical_field_mappings IS 'Maps canonical import fields to incident-service columns.';

CREATE INDEX idx_templates_tenant_type ON import_templates (tenant_id, structure_type, is_active);
CREATE INDEX idx_template_versions_template ON template_versions (tenant_id, template_id, version_number DESC);
CREATE INDEX idx_template_columns_version ON template_columns (template_version_id, column_order);

ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_templates ON import_templates
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
