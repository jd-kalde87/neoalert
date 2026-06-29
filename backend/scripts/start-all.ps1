<#
.SYNOPSIS
    Starts NEOALERT infrastructure and all 13 microservices for local hot-reload development.

.DESCRIPTION
    - Ensures Docker infra (postgres, redis, rabbitmq) is running
    - Launches each service via uvicorn with --reload
    - Writes stdout/stderr to logs/{service}.log
    - Saves PIDs to logs/running.pids.json for stop-all.ps1

.EXAMPLE
    .\scripts\start-all.ps1
#>
param(
    [switch]$SkipInfra,
    [switch]$NoReload
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$VenvPython = Join-Path $Root ".venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    Write-Error @"
Virtual environment not found. From the backend root run:
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
"@
    exit 1
}

$Services = @(
    @{ Name = "api-gateway";                  Port = 8000; Dir = "services\api-gateway" }
    @{ Name = "identity-service";             Port = 8001; Dir = "services\identity-service" }
    @{ Name = "tenant-service";               Port = 8002; Dir = "services\tenant-service" }
    @{ Name = "employee-service";             Port = 8003; Dir = "services\employee-service" }
    @{ Name = "attendance-service";           Port = 8004; Dir = "services\attendance-service" }
    @{ Name = "location-service";             Port = 8005; Dir = "services\location-service" }
    @{ Name = "incident-service";             Port = 8006; Dir = "services\incident-service" }
    @{ Name = "file-ingestion-service";       Port = 8007; Dir = "services\file-ingestion-service" }
    @{ Name = "template-configuration-service"; Port = 8008; Dir = "services\template-configuration-service" }
    @{ Name = "notification-service";         Port = 8009; Dir = "services\notification-service" }
    @{ Name = "reporting-service";            Port = 8010; Dir = "services\reporting-service" }
    @{ Name = "ai-service";                    Port = 8011; Dir = "services\ai-service" }
    @{ Name = "audit-service";                 Port = 8012; Dir = "services\audit-service" }
)

$LogsDir = Join-Path $Root "logs"
$PidManifest = Join-Path $LogsDir "running.pids.json"
$RunnerScript = Join-Path $PSScriptRoot "_run-service.ps1"

New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

if (Test-Path $PidManifest) {
    Write-Warning "PID manifest already exists ($PidManifest). Run .\scripts\stop-all.ps1 first or stale processes may remain."
}

function Wait-PostgresReady {
    param([int]$TimeoutSec = 120)

    Write-Host "Waiting for PostgreSQL to accept connections..."
    $elapsed = 0
    while ($elapsed -lt $TimeoutSec) {
        docker compose exec -T postgres pg_isready -U neoalert -d neoalert 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PostgreSQL is ready."
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    Write-Warning "PostgreSQL did not become ready within ${TimeoutSec}s."
    return $false
}

if (-not $SkipInfra) {
    Write-Host "Starting infrastructure (postgres, redis, rabbitmq)..."
    docker compose up -d postgres redis rabbitmq
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start infrastructure containers."
        exit 1
    }
    Wait-PostgresReady | Out-Null
}


$started = [System.Collections.Generic.List[object]]::new()

foreach ($svc in $Services) {
    $logFile = Join-Path $LogsDir "$($svc.Name).log"
    $errFile = Join-Path $LogsDir "$($svc.Name).err.log"

    if (Test-Path $logFile) { Remove-Item $logFile -Force }
    if (Test-Path $errFile) { Remove-Item $errFile -Force }

    Write-Host "Starting $($svc.Name) on port $($svc.Port)..."

    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", $RunnerScript,
        "-ServiceDir", $svc.Dir,
        "-Port", $svc.Port
    )
    if (-not $NoReload) {
        $arguments += "-Reload"
    }

    $proc = Start-Process -FilePath "powershell.exe" `
        -ArgumentList $arguments `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError $errFile `
        -PassThru `
        -WindowStyle Hidden

    $started.Add([PSCustomObject]@{
        name = $svc.Name
        port = $svc.Port
        pid  = $proc.Id
        log  = $logFile
    }) | Out-Null

    Start-Sleep -Milliseconds 400
}

$started | ConvertTo-Json -Depth 3 | Set-Content -Path $PidManifest -Encoding UTF8

Write-Host ""
Write-Host "Started $($started.Count) microservices. Logs: $LogsDir"
Write-Host "Stop all: .\scripts\stop-all.ps1"
Write-Host "Check health: .\scripts\check-health.ps1"
Write-Host ""

Write-Host "Waiting up to 60s for /health endpoints..."
& (Join-Path $PSScriptRoot "check-health.ps1") -TimeoutSec 60 -Quiet
