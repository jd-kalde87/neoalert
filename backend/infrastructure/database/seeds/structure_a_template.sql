-- Seed: Structure A template (demo tenant)
-- Run: Get-Content infrastructure\database\seeds\structure_a_template.sql | docker compose exec -T postgres psql -U neoalert -d template_configuration_service

INSERT INTO import_templates (id, tenant_id, code, name, structure_type, description, is_active, current_version)
VALUES (
    'aaaaaaaa-0001-4000-8000-0000000000a1',
    '00000000-0000-4000-8000-000000000001',
    'STRUCTURE_A_DEFAULT',
    'Estructura A — Incidentes operativos',
    'A',
    'Template base con columnas Fecha, Ubicación, Tipo de Evento, etc.',
    TRUE,
    1
) ON CONFLICT DO NOTHING;

INSERT INTO template_versions (id, tenant_id, template_id, version_number, status, change_summary, published_at)
VALUES (
    'aaaaaaaa-0001-4000-8000-0000000000a2',
    '00000000-0000-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-0000000000a1',
    1,
    'published',
    'Versión inicial Structure A',
    NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO template_columns (tenant_id, template_version_id, column_order, source_header, canonical_field, data_type, is_required)
VALUES
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 1, 'Fecha', 'incident_date', 'date', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 2, 'Ubicación', 'location', 'string', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 3, 'Tipo de Evento o Acción', 'event_type', 'string', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 4, 'Detalle del Aseguramiento o Resultado', 'detail', 'text', TRUE),
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 5, 'Instituciones Involucradas', 'involved_institutions', 'string', FALSE),
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 6, 'Monto de Inversión', 'investment_amount', 'decimal', FALSE),
    ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-0000000000a2', 7, 'Fuente', 'source', 'string', TRUE);
