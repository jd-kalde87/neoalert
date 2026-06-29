-- attendance-service: check-in/out, geofence validation, justifications
-- Database: attendance_service

CREATE TABLE geofence_refs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    external_geofence_id UUID NOT NULL,
    name            VARCHAR(200) NOT NULL,
    boundary        GEOMETRY(POLYGON, 4326) NOT NULL,
    buffer_meters   NUMERIC(8, 2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_geofence_refs UNIQUE (tenant_id, external_geofence_id)
);
COMMENT ON TABLE geofence_refs IS 'Local geofence cache synced from location-service for attendance validation.';

CREATE TABLE attendance_shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    grace_minutes   INTEGER NOT NULL DEFAULT 15,
    timezone        VARCHAR(64) NOT NULL DEFAULT 'America/Bogota',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_shifts_tenant_code UNIQUE (tenant_id, code)
);

CREATE TABLE attendance_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    site_id         UUID,
    shift_id        UUID REFERENCES attendance_shifts(id),
    record_type     VARCHAR(32) NOT NULL
                    CHECK (record_type IN ('check_in', 'check_out', 'intermediate_exit', 'reentry')),
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location        GEOGRAPHY(POINT, 4326),
    geofence_id     UUID REFERENCES geofence_refs(id),
    inside_geofence BOOLEAN,
    source          VARCHAR(32) NOT NULL DEFAULT 'mobile',
    device_id       VARCHAR(128),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID
);
COMMENT ON TABLE attendance_records IS 'Immutable attendance events with optional GPS validation.';

CREATE TABLE attendance_justifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    attendance_record_id UUID REFERENCES attendance_records(id),
    reason_code     VARCHAR(64) NOT NULL,
    description     TEXT NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID,
    attachment_ref  UUID
);

CREATE TABLE attendance_approval_workflows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    justification_id UUID NOT NULL REFERENCES attendance_justifications(id) ON DELETE CASCADE,
    approver_id     UUID NOT NULL,
    step_order      INTEGER NOT NULL DEFAULT 1,
    decision        VARCHAR(16) CHECK (decision IN ('approved', 'rejected', 'pending')),
    decided_at      TIMESTAMPTZ,
    comments        TEXT
);

CREATE INDEX idx_attendance_tenant_employee ON attendance_records (tenant_id, employee_id, recorded_at DESC);
CREATE INDEX idx_attendance_tenant_date ON attendance_records (tenant_id, recorded_at DESC);
CREATE INDEX idx_attendance_location_gist ON attendance_records USING GIST (location);
CREATE INDEX idx_geofence_refs_boundary ON geofence_refs USING GIST (boundary);
CREATE INDEX idx_justifications_status ON attendance_justifications (tenant_id, status, requested_at DESC);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_justifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_attendance ON attendance_records
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
