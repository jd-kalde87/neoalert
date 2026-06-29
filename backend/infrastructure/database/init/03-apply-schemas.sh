#!/bin/bash
# Apply versioned schemas (V001, V002, ...) to each service database.
set -euo pipefail

SCHEMA_ROOT="${NEOALERT_SCHEMA_ROOT:-/schemas}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=apply-service-migrations.sh
source "${SCRIPT_DIR}/apply-service-migrations.sh"

apply_service_migrations api_gateway api-gateway
apply_service_migrations identity_service identity-service
apply_service_migrations tenant_service tenant-service
apply_service_migrations employee_service employee-service
apply_service_migrations attendance_service attendance-service
apply_service_migrations location_service location-service
apply_service_migrations incident_service incident-service
apply_service_migrations file_ingestion_service file-ingestion-service
apply_service_migrations template_configuration_service template-configuration-service
apply_service_migrations notification_service notification-service
apply_service_migrations reporting_service reporting-service
apply_service_migrations ai_service ai-service
apply_service_migrations audit_service audit-service

echo "NEOALERT schema bootstrap complete."
