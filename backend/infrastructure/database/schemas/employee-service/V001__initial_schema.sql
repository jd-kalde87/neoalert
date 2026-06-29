-- employee-service: employees, sites, crews, assignments
-- Database: employee_service

CREATE TABLE positions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_positions_tenant_code UNIQUE (tenant_id, code)
);

CREATE TABLE crews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    supervisor_id   UUID,
    region_code     VARCHAR(32),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crews_tenant_code UNIQUE (tenant_id, code)
);
COMMENT ON TABLE crews IS 'Operational crews / cuadrillas.';

CREATE TABLE sites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    code            VARCHAR(64) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    site_type       VARCHAR(32) NOT NULL DEFAULT 'facility',
    address_line    TEXT,
    city            VARCHAR(120),
    region_code     VARCHAR(32),
    country_code    CHAR(2) NOT NULL,
    location        GEOGRAPHY(POINT, 4326),
    boundary        GEOMETRY(POLYGON, 4326),
    radius_meters   NUMERIC(10, 2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_sites_tenant_code UNIQUE (tenant_id, code)
);
COMMENT ON TABLE sites IS 'Physical sites with optional point and polygon geometry.';

CREATE TABLE employees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_code   VARCHAR(64) NOT NULL,
    user_id         UUID,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    document_type   VARCHAR(16),
    document_number VARCHAR(32),
    email           VARCHAR(320),
    phone_e164      VARCHAR(20),
    position_id     UUID REFERENCES positions(id),
    hire_date       DATE,
    status          VARCHAR(32) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'terminated', 'on_leave')),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_employees_tenant_code UNIQUE (tenant_id, employee_code)
);
COMMENT ON TABLE employees IS 'Workforce records; user_id links to identity-service when portal access exists.';

CREATE TABLE crew_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    crew_id         UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role_in_crew    VARCHAR(32) NOT NULL DEFAULT 'member',
    assigned_from   DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_to     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_crew_members UNIQUE (tenant_id, crew_id, employee_id, assigned_from)
);

CREATE TABLE employee_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    site_id         UUID NOT NULL REFERENCES sites(id),
    crew_id         UUID REFERENCES crews(id),
    assignment_type VARCHAR(32) NOT NULL DEFAULT 'primary',
    valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID
);
COMMENT ON TABLE employee_assignments IS 'Employee to site/crew assignment history.';

CREATE INDEX idx_employees_tenant_status ON employees (tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_tenant_code ON employees (tenant_id, employee_code);
CREATE INDEX idx_sites_tenant_active ON sites (tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_sites_location_gist ON sites USING GIST (location);
CREATE INDEX idx_sites_boundary_gist ON sites USING GIST (boundary);
CREATE INDEX idx_assignments_employee ON employee_assignments (tenant_id, employee_id, valid_from DESC);
CREATE INDEX idx_crew_members_crew ON crew_members (tenant_id, crew_id);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_employees ON employees
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
