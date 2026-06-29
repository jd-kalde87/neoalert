-- location-service: GPS traces, geofences, heatmaps
-- Database: location_service

CREATE TABLE geofences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    geofence_type   VARCHAR(32) NOT NULL DEFAULT 'polygon'
                    CHECK (geofence_type IN ('polygon', 'circle', 'corridor')),
    boundary        GEOMETRY(POLYGON, 4326),
    center          GEOGRAPHY(POINT, 4326),
    radius_meters   NUMERIC(10, 2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_geofences_tenant_code UNIQUE (tenant_id, code)
);
COMMENT ON TABLE geofences IS 'Tenant geofences for enter/exit evaluation.';

CREATE TABLE location_traces (
    id              UUID NOT NULL DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy_meters NUMERIC(8, 2),
    speed_kmh       NUMERIC(8, 2),
    heading_degrees NUMERIC(6, 2),
    source          VARCHAR(32) NOT NULL DEFAULT 'mobile',
    device_id       VARCHAR(128),
    battery_pct     SMALLINT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);
COMMENT ON TABLE location_traces IS 'High-volume GPS trace stream; partition by recorded_at monthly.';

CREATE TABLE location_traces_default PARTITION OF location_traces DEFAULT;

CREATE TABLE last_known_locations (
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy_meters NUMERIC(8, 2),
    source          VARCHAR(32) NOT NULL DEFAULT 'mobile',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tenant_id, employee_id)
);
COMMENT ON TABLE last_known_locations IS 'Upserted latest position per employee for map views.';

CREATE TABLE geofence_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    geofence_id     UUID NOT NULL REFERENCES geofences(id),
    employee_id     UUID NOT NULL,
    event_type      VARCHAR(16) NOT NULL CHECK (event_type IN ('enter', 'exit', 'dwell')),
    occurred_at     TIMESTAMPTZ NOT NULL,
    location        GEOGRAPHY(POINT, 4326) NOT NULL,
    trace_id        UUID,
    metadata        JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE heatmap_cells (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    grid_key        VARCHAR(32) NOT NULL,
    cell_x          INTEGER NOT NULL,
    cell_y          INTEGER NOT NULL,
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ NOT NULL,
    event_count     INTEGER NOT NULL DEFAULT 0,
    centroid        GEOGRAPHY(POINT, 4326),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_heatmap_cell UNIQUE (tenant_id, grid_key, cell_x, cell_y, period_start)
);
COMMENT ON TABLE heatmap_cells IS 'Pre-aggregated density cells for map heatmaps.';

CREATE INDEX idx_geofences_tenant_active ON geofences (tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_geofences_boundary_gist ON geofences USING GIST (boundary);
CREATE INDEX idx_geofences_center_gist ON geofences USING GIST (center);
CREATE INDEX idx_traces_tenant_employee ON location_traces (tenant_id, employee_id, recorded_at DESC);
CREATE INDEX idx_traces_location_gist ON location_traces USING GIST (location);
CREATE INDEX idx_geofence_events_lookup ON geofence_events (tenant_id, geofence_id, occurred_at DESC);
CREATE INDEX idx_heatmap_period ON heatmap_cells (tenant_id, period_start, period_end);

ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE last_known_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_geofences ON geofences
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
