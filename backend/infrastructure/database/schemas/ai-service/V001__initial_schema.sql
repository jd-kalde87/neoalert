-- ai-service: LLM analysis jobs and results
-- Database: ai_service

CREATE TABLE model_configurations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    provider        VARCHAR(64) NOT NULL,
    model_name      VARCHAR(128) NOT NULL,
    task_type       VARCHAR(64) NOT NULL,
    config_json     JSONB NOT NULL DEFAULT '{}',
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_model_config UNIQUE (tenant_id, task_type, provider, model_name)
);

CREATE TABLE ai_analysis_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    task_type       VARCHAR(64) NOT NULL
                    CHECK (task_type IN ('classify', 'summarize', 'anomaly_detect', 'narrative')),
    source_entity   VARCHAR(64) NOT NULL,
    source_entity_id UUID NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    input_payload   JSONB NOT NULL,
    model_config_id UUID REFERENCES model_configurations(id),
    requested_by    UUID,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    error_message   TEXT
);

CREATE TABLE ai_analysis_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    job_id          UUID NOT NULL REFERENCES ai_analysis_jobs(id) ON DELETE CASCADE,
    result_type     VARCHAR(64) NOT NULL,
    confidence      NUMERIC(5, 4),
    output_json     JSONB NOT NULL,
    output_text     TEXT,
    tokens_used     INTEGER,
    latency_ms      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_analysis_results IS 'Structured LLM outputs linked to source entities.';

CREATE INDEX idx_ai_jobs_tenant_status ON ai_analysis_jobs (tenant_id, status, requested_at DESC);
CREATE INDEX idx_ai_jobs_source ON ai_analysis_jobs (tenant_id, source_entity, source_entity_id);
CREATE INDEX idx_ai_results_job ON ai_analysis_results (job_id);

ALTER TABLE ai_analysis_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_ai_jobs ON ai_analysis_jobs
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
