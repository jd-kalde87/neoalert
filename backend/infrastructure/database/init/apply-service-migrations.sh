#!/bin/bash
# Apply versioned SQL migrations (V001, V002, ...) to a service database.
# Tracks applied versions in _neoalert_schema_migrations for idempotent re-runs.
set -euo pipefail

apply_service_migrations() {
  local db_name="$1"
  local schema_dir="$2"
  local service_schema_path="${SCHEMA_ROOT}/${schema_dir}"

  if [[ ! -d "${service_schema_path}" ]]; then
    echo "WARN: schema dir not found: ${service_schema_path}" >&2
    return 0
  fi

  local migration_files
  migration_files=$(find "${service_schema_path}" -maxdepth 1 -name 'V*.sql' | sort)
  if [[ -z "${migration_files}" ]]; then
    echo "WARN: no migrations in ${service_schema_path}" >&2
    return 0
  fi

  echo "Ensuring migration tracking table on ${db_name}"
  psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${db_name}" <<'SQL'
CREATE TABLE IF NOT EXISTS _neoalert_schema_migrations (
    version     VARCHAR(128) PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SQL

  while IFS= read -r schema_file; do
    [[ -z "${schema_file}" ]] && continue
    local version
    version=$(basename "${schema_file}" .sql)

    local already_applied
    already_applied=$(
      psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${db_name}" -tAc \
        "SELECT 1 FROM _neoalert_schema_migrations WHERE version = '${version}'"
    )

    if [[ "${already_applied}" == "1" ]]; then
      echo "SKIP ${version} on ${db_name} (already applied)"
      continue
    fi

    echo "Applying ${schema_file} -> ${db_name}"
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${db_name}" -f "${schema_file}"
    psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${db_name}" -c \
      "INSERT INTO _neoalert_schema_migrations (version) VALUES ('${version}')"
  done <<< "${migration_files}"
}
