-- Seed: Structure B template (demo tenant)
-- Run: Get-Content infrastructure\database\seeds\structure_b_template.sql | docker compose exec -T postgres psql -U neoalert -d template_configuration_service

INSERT INTO import_templates (id, tenant_id, code, name, structure_type, description, is_active, current_version)
VALUES (
    'bbbbbbbb-0001-4000-8000-0000000000b1',
    '00000000-0000-4000-8000-000000000001',
    'STRUCTURE_B_DEFAULT',
    'Estructura B — Operativos de seguridad',
    'B',
    'Template base con columnas Fecha del Incidente, Fuerzas de Seguridad, etc.',
    TRUE,
    1
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (id, tenant_id, template_id, version_number, status, change_summary, published_at)
VALUES (
    'bbbbbbbb-0001-4000-8000-0000000000b2',
    '00000000-0000-4000-8000-000000000001',
    'bbbbbbbb-0001-4000-8000-0000000000b1',
    1,
    'published',
    'Versión inicial Structure B',
    NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO template_columns (tenant_id, template_version_id, column_order, source_header, canonical_field, data_type, is_required)
VALUES
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 1, 'Fecha del Incidente', 'incident_date', 'date', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 2, 'Ubicación Específica', 'location', 'string', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 3, 'Tipo de Operativo', 'event_type', 'string', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 4, 'Fuerzas de Seguridad', 'security_forces', 'string', FALSE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 5, 'Detalle de Aseguramiento', 'detail', 'text', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 6, 'Cantidad de Artefactos', 'artifact_count', 'integer', FALSE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 7, 'Autoridad Investigación', 'investigation_authority', 'string', FALSE),
    ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-0001-4000-8000-0000000000b2', 8, 'Fuente', 'source', 'string', TRUE);
