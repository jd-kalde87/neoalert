-- notification-service: multi-channel notifications and delivery tracking
-- Database: notification_service

CREATE TABLE notification_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    channel         VARCHAR(32) NOT NULL CHECK (channel IN ('email', 'push', 'sms', 'in_app')),
    subject_template TEXT,
    body_template   TEXT NOT NULL,
    locale          VARCHAR(10) NOT NULL DEFAULT 'es',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notification_templates UNIQUE (tenant_id, code, channel, locale)
);

CREATE TABLE notification_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    event_type      VARCHAR(128) NOT NULL,
    channel         VARCHAR(32) NOT NULL,
    template_id     UUID REFERENCES notification_templates(id),
    is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    filter_json     JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notification_rules UNIQUE (tenant_id, event_type, channel)
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    recipient_id    UUID,
    recipient_address VARCHAR(320),
    channel         VARCHAR(32) NOT NULL,
    event_type      VARCHAR(128) NOT NULL,
    subject         TEXT,
    body            TEXT NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(32) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'queued', 'sent', 'delivered', 'failed', 'cancelled')),
    correlation_id  UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ
);
COMMENT ON TABLE notifications IS 'Outbound notification requests with delivery lifecycle.';

CREATE TABLE delivery_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    attempt_number  INTEGER NOT NULL DEFAULT 1,
    provider        VARCHAR(64) NOT NULL,
    status          VARCHAR(32) NOT NULL,
    provider_ref    VARCHAR(256),
    error_code      VARCHAR(64),
    error_message   TEXT,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_tenant_status ON notifications (tenant_id, status, created_at DESC);
CREATE INDEX idx_notifications_recipient ON notifications (tenant_id, recipient_id, created_at DESC);
CREATE INDEX idx_delivery_attempts_notification ON delivery_attempts (notification_id, attempt_number);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_notifications ON notifications
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
