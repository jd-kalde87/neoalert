-- api-gateway: route registry and optional gateway metadata (rate limits use Redis primarily)
-- Database: api_gateway

CREATE TABLE route_definitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_pattern   VARCHAR(256) NOT NULL UNIQUE,
    upstream_service VARCHAR(64) NOT NULL,
    upstream_path   VARCHAR(256) NOT NULL,
    methods         VARCHAR(64)[] NOT NULL DEFAULT ARRAY['GET'],
    auth_required   BOOLEAN NOT NULL DEFAULT TRUE,
    rate_limit_rpm  INTEGER,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE route_definitions IS 'Declarative gateway routing table; hot paths also cached in Redis.';

CREATE TABLE gateway_audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID,
    request_method  VARCHAR(8) NOT NULL,
    request_path    VARCHAR(512) NOT NULL,
    upstream_service VARCHAR(64),
    status_code     INTEGER,
    latency_ms      INTEGER,
    correlation_id  UUID,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routes_active ON route_definitions (is_active, route_pattern);
CREATE INDEX idx_gateway_audit_time ON gateway_audit_log (occurred_at DESC);

INSERT INTO route_definitions (route_pattern, upstream_service, upstream_path, methods, auth_required) VALUES
    ('/auth/*', 'identity-service', '/auth', ARRAY['GET','POST','PUT','PATCH','DELETE'], FALSE),
    ('/tenants/*', 'tenant-service', '/tenants', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/employees/*', 'employee-service', '/employees', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/attendance/*', 'attendance-service', '/attendance', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/locations/*', 'location-service', '/locations', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/incidents/*', 'incident-service', '/incidents', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/ingestion/*', 'file-ingestion-service', '/ingestion', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/templates/*', 'template-configuration-service', '/templates', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/notifications/*', 'notification-service', '/notifications', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/reports/*', 'reporting-service', '/reports', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/ai/*', 'ai-service', '/ai', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE),
    ('/audit/*', 'audit-service', '/audit', ARRAY['GET','POST','PUT','PATCH','DELETE'], TRUE);
