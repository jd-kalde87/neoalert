-- reporting-service: read models, KPI snapshots, export jobs
-- Database: reporting_service

CREATE TABLE kpi_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    kpi_code        VARCHAR(64) NOT NULL,
    period_type     VARCHAR(16) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    value_numeric   NUMERIC(18, 4),
    value_json      JSONB NOT NULL DEFAULT '{}',
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_version  VARCHAR(32),
    CONSTRAINT uq_kpi_snapshot UNIQUE (tenant_id, kpi_code, period_type, period_start)
);
COMMENT ON TABLE kpi_snapshots IS 'Pre-computed KPI values for dashboard consumption.';

CREATE TABLE export_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    export_type     VARCHAR(64) NOT NULL,
    format          VARCHAR(16) NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf', 'json')),
    filters         JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(32) NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired')),
    file_object_key VARCHAR(512),
    requested_by    UUID NOT NULL,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    error_message   TEXT
);

CREATE TABLE dashboard_widgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    widget_code     VARCHAR(64) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    widget_type     VARCHAR(32) NOT NULL,
    config_json     JSONB NOT NULL DEFAULT '{}',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_dashboard_widgets UNIQUE (tenant_id, widget_code)
);

CREATE TABLE heatmap_read_models (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    dataset         VARCHAR(64) NOT NULL,
    grid_resolution INTEGER NOT NULL DEFAULT 500,
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ NOT NULL,
    cells           JSONB NOT NULL,
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_heatmap_read_model UNIQUE (tenant_id, dataset, period_start, grid_resolution)
);
COMMENT ON TABLE heatmap_read_models IS 'Denormalized heatmap payloads synced from location/incident domains.';

CREATE INDEX idx_kpi_tenant_period ON kpi_snapshots (tenant_id, kpi_code, period_start DESC);
CREATE INDEX idx_export_jobs_tenant ON export_jobs (tenant_id, status, requested_at DESC);

ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_kpi ON kpi_snapshots
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
