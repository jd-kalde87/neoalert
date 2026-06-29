-- incident-service: incidents, activities, territorial events, evidence refs
-- Database: incident_service

CREATE TABLE incidents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    incident_number VARCHAR(64),
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    incident_date   DATE NOT NULL,
    event_type      VARCHAR(120) NOT NULL,
    severity        VARCHAR(16) NOT NULL DEFAULT 'medium'
                    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status          VARCHAR(32) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('draft', 'open', 'in_progress', 'resolved', 'closed', 'cancelled')),
    location_text   TEXT,
    location        GEOGRAPHY(POINT, 4326),
    area            GEOMETRY(POLYGON, 4326),
    source          VARCHAR(64) NOT NULL DEFAULT 'manual',
    source_batch_id UUID,
    template_version VARCHAR(32),
    structure_type  CHAR(1) CHECK (structure_type IN ('A', 'B')),
    canonical_payload JSONB NOT NULL DEFAULT '{}',
    extra_fields    JSONB NOT NULL DEFAULT '{}',
    reported_by     UUID,
    assigned_to     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_incidents_tenant_number UNIQUE (tenant_id, incident_number)
);
COMMENT ON TABLE incidents IS 'Operational/security incidents with geospatial and canonical import fields.';

CREATE TABLE incident_activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    activity_type   VARCHAR(64) NOT NULL,
    description     TEXT NOT NULL,
    performed_by    UUID,
    performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata        JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE territorial_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    incident_id     UUID REFERENCES incidents(id),
    event_type      VARCHAR(64) NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    boundary        GEOMETRY(POLYGON, 4326),
    metadata        JSONB NOT NULL DEFAULT '{}'
);
COMMENT ON TABLE territorial_events IS 'Geographic events linked or standalone for map layers.';

CREATE TABLE incident_evidence_refs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_object_key VARCHAR(512) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(128),
    size_bytes      BIGINT,
    uploaded_by     UUID,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checksum_sha256 CHAR(64)
);
COMMENT ON TABLE incident_evidence_refs IS 'References to object storage; binary stored externally.';

CREATE TABLE incident_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    from_status     VARCHAR(32),
    to_status       VARCHAR(32) NOT NULL,
    changed_by      UUID,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason          TEXT
);

CREATE INDEX idx_incidents_tenant_date ON incidents (tenant_id, incident_date DESC);
CREATE INDEX idx_incidents_tenant_status ON incidents (tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_tenant_type ON incidents (tenant_id, event_type);
CREATE INDEX idx_incidents_location_gist ON incidents USING GIST (location);
CREATE INDEX idx_incidents_area_gist ON incidents USING GIST (area);
CREATE INDEX idx_territorial_events_time ON territorial_events (tenant_id, occurred_at DESC);
CREATE INDEX idx_territorial_events_location ON territorial_events USING GIST (location);
CREATE INDEX idx_incident_activities_incident ON incident_activities (tenant_id, incident_id, performed_at DESC);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_incidents ON incidents
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
