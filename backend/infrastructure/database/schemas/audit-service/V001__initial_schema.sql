-- audit-service: immutable audit trail and entity change history
-- Database: audit_service

CREATE TABLE audit_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id        UUID,
    actor_type      VARCHAR(32) NOT NULL DEFAULT 'user',
    action          VARCHAR(64) NOT NULL,
    entity_type     VARCHAR(64) NOT NULL,
    entity_id       UUID NOT NULL,
    correlation_id  UUID,
    ip_address      INET,
    user_agent      TEXT,
    payload_before  JSONB,
    payload_after   JSONB,
    metadata        JSONB NOT NULL DEFAULT '{}',
    checksum        CHAR(64) NOT NULL
);
COMMENT ON TABLE audit_events IS 'Append-only audit log; no UPDATE/DELETE in application layer.';

CREATE TABLE entity_change_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    audit_event_id  UUID NOT NULL REFERENCES audit_events(id),
    entity_type     VARCHAR(64) NOT NULL,
    entity_id       UUID NOT NULL,
    field_name      VARCHAR(128) NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE entity_change_history IS 'Field-level diffs derived from audit events for compliance queries.';

CREATE TABLE audit_retention_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL UNIQUE,
    hot_days        INTEGER NOT NULL DEFAULT 90,
    warm_days       INTEGER NOT NULL DEFAULT 365,
    archive_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent accidental updates/deletes on audit_events (defense in depth)
CREATE OR REPLACE FUNCTION audit_events_deny_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_no_update
    BEFORE UPDATE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION audit_events_deny_mutation();

CREATE TRIGGER trg_audit_events_no_delete
    BEFORE DELETE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION audit_events_deny_mutation();

CREATE INDEX idx_audit_tenant_time ON audit_events (tenant_id, occurred_at DESC);
CREATE INDEX idx_audit_entity ON audit_events (tenant_id, entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_events (tenant_id, actor_id, occurred_at DESC);
CREATE INDEX idx_audit_correlation ON audit_events (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_change_history_entity ON entity_change_history (tenant_id, entity_type, entity_id, changed_at DESC);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit ON audit_events
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
