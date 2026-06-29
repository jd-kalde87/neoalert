<#
.SYNOPSIS
    Applies missing SQL schema migrations to existing PostgreSQL databases.

.DESCRIPTION
    Idempotent: tracks applied versions in _neoalert_schema_migrations per database.
    Safe to run on an existing postgres_data volume without docker compose down -v.

.EXAMPLE
    .\scripts\init-db.ps1
    .\scripts\init-db.ps1 -Service identity-service
#>
param(
    [string]$Service = "all",
    [string]$PostgresUser = "neoalert",
    [string]$ComposeProject = ""
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$ServiceMap = [ordered]@{
    "api-gateway"                  = @{ Db = "api_gateway";                  Dir = "api-gateway" }
    "identity-service"             = @{ Db = "identity_service";             Dir = "identity-service" }
    "tenant-service"               = @{ Db = "tenant_service";               Dir = "tenant-service" }
    "employee-service"             = @{ Db = "employee_service";             Dir = "employee-service" }
    "attendance-service"           = @{ Db = "attendance_service";           Dir = "attendance-service" }
    "location-service"             = @{ Db = "location_service";             Dir = "location-service" }
    "incident-service"             = @{ Db = "incident_service";             Dir = "incident-service" }
    "file-ingestion-service"       = @{ Db = "file_ingestion_service";       Dir = "file-ingestion-service" }
    "template-configuration-service" = @{ Db = "template_configuration_service"; Dir = "template-configuration-service" }
    "notification-service"         = @{ Db = "notification_service";         Dir = "notification-service" }
    "reporting-service"            = @{ Db = "reporting_service";            Dir = "reporting-service" }
    "ai-service"                   = @{ Db = "ai_service";                   Dir = "ai-service" }
    "audit-service"                = @{ Db = "audit_service";                 Dir = "audit-service" }
}

function Invoke-PostgresCommand {
    param(
        [string]$Database,
        [string]$Command
    )

    docker compose @ComposeArgs exec -T postgres `
        psql -v ON_ERROR_STOP=1 -U $PostgresUser -d $Database -c $Command
}

function Invoke-PostgresSqlFile {
    param(
        [string]$Database,
        [string]$HostPath
    )

    Get-Content -Raw -Encoding UTF8 $HostPath | docker compose @ComposeArgs exec -T postgres `
        psql -v ON_ERROR_STOP=1 -U $PostgresUser -d $Database
}

function Get-PostgresScalar {
    param(
        [string]$Database,
        [string]$Query
    )

    $result = docker compose @ComposeArgs exec -T postgres `
        psql -v ON_ERROR_STOP=1 -U $PostgresUser -d $Database -tAc $Query 2>$null
    return ($result | Out-String).Trim()
}

function Ensure-MigrationTable {
    param([string]$Database)

    Invoke-PostgresCommand -Database $Database -Command @"
CREATE TABLE IF NOT EXISTS _neoalert_schema_migrations (
    version     VARCHAR(128) PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"@ | Out-Null
}

function Apply-ServiceMigrations {
    param(
        [string]$ServiceName,
        [hashtable]$Mapping
    )

    $schemaDir = Join-Path $RepoRoot "infrastructure\database\schemas\$($Mapping.Dir)"
    if (-not (Test-Path $schemaDir)) {
        Write-Warning "Schema directory not found: $schemaDir"
        return
    }

    $migrationFiles = Get-ChildItem -Path $schemaDir -Filter "V*.sql" | Sort-Object Name
    if ($migrationFiles.Count -eq 0) {
        Write-Warning "No migrations found for $ServiceName"
        return
    }

    Write-Host "==> $ServiceName ($($Mapping.Db))" -ForegroundColor Cyan
    Ensure-MigrationTable -Database $Mapping.Db

    foreach ($file in $migrationFiles) {
        $version = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $applied = Get-PostgresScalar -Database $Mapping.Db `
            -Query "SELECT 1 FROM _neoalert_schema_migrations WHERE version = '$version' LIMIT 1;"

        if ($applied -eq "1") {
            Write-Host "  SKIP $version (already applied)"
            continue
        }

        Write-Host "  APPLY $version"
        Invoke-PostgresSqlFile -Database $Mapping.Db -HostPath $file.FullName
        Invoke-PostgresCommand -Database $Mapping.Db `
            -Command "INSERT INTO _neoalert_schema_migrations (version) VALUES ('$version');" | Out-Null
    }
}

$ComposeArgs = @()
if ($ComposeProject) {
    $ComposeArgs += @("-p", $ComposeProject)
}

$postgresStatus = docker compose @ComposeArgs ps --services --filter "status=running" 2>$null
if ($postgresStatus -notcontains "postgres") {
    Write-Error "postgres container is not running. Start it with: docker compose up -d postgres"
}

if ($Service -ne "all" -and -not $ServiceMap.Contains($Service)) {
    $known = ($ServiceMap.Keys -join ", ")
    Write-Error "Unknown service '$Service'. Known services: $known"
}

$targets = if ($Service -eq "all") {
    $ServiceMap.GetEnumerator()
} else {
    @([System.Collections.DictionaryEntry]::new($Service, $ServiceMap[$Service]))
}

Write-Host "Applying NEOALERT schema migrations..." -ForegroundColor Green
foreach ($entry in $targets) {
    Apply-ServiceMigrations -ServiceName $entry.Key -Mapping $entry.Value
}

Write-Host ""
Write-Host "Done. Verify identity tables:" -ForegroundColor Green
Write-Host "  docker compose exec postgres psql -U neoalert -d identity_service -c `"\dt`""
