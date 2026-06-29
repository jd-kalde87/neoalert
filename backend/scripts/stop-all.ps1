<#
.SYNOPSIS
    Stops all microservices started by start-all.ps1.

.DESCRIPTION
    Reads logs/running.pids.json and terminates each recorded process tree.
    Does not stop Docker infrastructure (postgres, redis, rabbitmq).

.EXAMPLE
    .\scripts\stop-all.ps1
#>
param(
    [switch]$StopInfra
)

$ErrorActionPreference = "Continue"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$LogsDir = Join-Path $Root "logs"
$PidManifest = Join-Path $LogsDir "running.pids.json"

function Stop-ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 0) {
        return
    }

    Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-ProcessTree -ProcessId $_.ProcessId }

    Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
}

if (Test-Path $PidManifest) {
    $entries = Get-Content $PidManifest -Raw | ConvertFrom-Json
    if ($entries -isnot [System.Array]) {
        $entries = @($entries)
    }

    foreach ($entry in $entries) {
        Write-Host "Stopping $($entry.name) (PID $($entry.pid))..."
        Stop-ProcessTree -ProcessId ([int]$entry.pid)
    }

    Remove-Item $PidManifest -Force
    Write-Host "Stopped $($entries.Count) service launcher(s)."
}
else {
    Write-Warning "No PID manifest at $PidManifest - nothing to stop from start-all.ps1."
}

# Fallback: terminate uvicorn/python listeners on NEOALERT ports
$ports = 8000..8012
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($conn) {
        $procId = $conn.OwningProcess
        Write-Host "Stopping process on port ${port} (PID $procId)..."
        Stop-ProcessTree -ProcessId $procId
    }
}

if ($StopInfra) {
    Write-Host "Stopping infrastructure containers..."
    docker compose stop postgres redis rabbitmq
}

Write-Host "Done."
