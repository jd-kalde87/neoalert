-- file-ingestion-service: upload batches, staging, canonical publish pipeline
-- Database: file_ingestion_service

CREATE TABLE ingestion_batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    template_id     UUID NOT NULL,
    template_version INTEGER NOT NULL,
    structure_type  CHAR(1) NOT NULL CHECK (structure_type IN ('A', 'B')),
    original_filename VARCHAR(512) NOT NULL,
    file_object_key VARCHAR(512) NOT NULL,
    file_hash_sha256 CHAR(64) NOT NULL,
    mime_type       VARCHAR(128),
    status          VARCHAR(32) NOT NULL DEFAULT 'uploaded'
                    CHECK (status IN ('uploaded', 'parsing', 'staged', 'validated', 'published', 'failed', 'cancelled')),
    total_rows      INTEGER NOT NULL DEFAULT 0,
    valid_rows      INTEGER NOT NULL DEFAULT 0,
    error_rows      INTEGER NOT NULL DEFAULT 0,
    uploaded_by     UUID NOT NULL,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parsed_at       TIMESTAMPTZ,
    published_at    TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}'
);
COMMENT ON TABLE ingestion_batches IS 'One uploaded file per batch with lifecycle status.';

CREATE TABLE staging_rows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    batch_id        UUID NOT NULL REFERENCES ingestion_batches(id) ON DELETE CASCADE,
    row_number      INTEGER NOT NULL,
    raw_payload     JSONB NOT NULL,
    normalized_payload JSONB NOT NULL DEFAULT '{}',
    validation_status VARCHAR(16) NOT NULL DEFAULT 'pending'
                    CHECK (validation_status IN ('pending', 'valid', 'invalid', 'published', 'skipped')),
    canonical_payload JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_staging_row UNIQUE (batch_id, row_number)
);
COMMENT ON TABLE staging_rows IS 'Parsed rows before publish; retains original and normalized forms.';

CREATE TABLE staging_row_errors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    staging_row_id  UUID NOT NULL REFERENCES staging_rows(id) ON DELETE CASCADE,
    field_name      VARCHAR(128),
    error_code      VARCHAR(64) NOT NULL,
    error_message   TEXT NOT NULL,
    severity        VARCHAR(16) NOT NULL DEFAULT 'error'
                    CHECK (severity IN ('warning', 'error')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE canonical_imported_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    batch_id        UUID NOT NULL REFERENCES ingestion_batches(id),
    staging_row_id  UUID NOT NULL REFERENCES staging_rows(id),
    incident_date   DATE NOT NULL,
    location        TEXT NOT NULL,
    event_type      VARCHAR(120) NOT NULL,
    detail          TEXT NOT NULL,
    source          VARCHAR(120) NOT NULL,
    structure_type  CHAR(1) NOT NULL,
    template_version VARCHAR(32) NOT NULL,
    canonical_fields JSONB NOT NULL,
    extra_fields    JSONB NOT NULL DEFAULT '{}',
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    incident_id     UUID
);
COMMENT ON TABLE canonical_imported_events IS 'Normalized records ready for incident-service consumption.';

CREATE TABLE published_event_refs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    canonical_event_id UUID NOT NULL REFERENCES canonical_imported_events(id),
    incident_id     UUID NOT NULL,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batches_tenant_status ON ingestion_batches (tenant_id, status, uploaded_at DESC);
CREATE INDEX idx_staging_batch ON staging_rows (tenant_id, batch_id, row_number);
CREATE INDEX idx_staging_validation ON staging_rows (tenant_id, batch_id, validation_status);
CREATE INDEX idx_staging_errors_row ON staging_row_errors (staging_row_id);
CREATE INDEX idx_canonical_batch ON canonical_imported_events (tenant_id, batch_id);
CREATE INDEX idx_canonical_date ON canonical_imported_events (tenant_id, incident_date DESC);

ALTER TABLE ingestion_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_batches ON ingestion_batches
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
