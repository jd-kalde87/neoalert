<#
.SYNOPSIS
    Verifies /health endpoints for all NEOALERT microservices.

.EXAMPLE
    .\scripts\check-health.ps1
    .\scripts\check-health.ps1 -TimeoutSec 30
#>
param(
    [int]$TimeoutSec = 15,
    [switch]$Quiet
)

$Services = @(
    @{ Name = "api-gateway";                  Port = 8000 }
    @{ Name = "identity-service";             Port = 8001 }
    @{ Name = "tenant-service";               Port = 8002 }
    @{ Name = "employee-service";             Port = 8003 }
    @{ Name = "attendance-service";           Port = 8004 }
    @{ Name = "location-service";             Port = 8005 }
    @{ Name = "incident-service";             Port = 8006 }
    @{ Name = "file-ingestion-service";       Port = 8007 }
    @{ Name = "template-configuration-service"; Port = 8008 }
    @{ Name = "notification-service";         Port = 8009 }
    @{ Name = "reporting-service";            Port = 8010 }
    @{ Name = "ai-service";                    Port = 8011 }
    @{ Name = "audit-service";                 Port = 8012 }
)

function Test-ServiceHealth {
    param(
        [int]$Port,
        [int]$WaitSec
    )

    $url = "http://localhost:$Port/health"
    $deadline = (Get-Date).AddSeconds($WaitSec)

    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                return $true
            }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }
    return $false
}

$ok = 0
$fail = 0
$perServiceWait = [Math]::Max(3, [int][Math]::Ceiling($TimeoutSec / $Services.Count))

foreach ($svc in $Services) {
    $healthy = Test-ServiceHealth -Port $svc.Port -WaitSec $perServiceWait
    if ($healthy) {
        $ok++
        if (-not $Quiet) {
            Write-Host "[OK]   $($svc.Name) (:$($svc.Port))" -ForegroundColor Green
        }
    }
    else {
        $fail++
        if (-not $Quiet) {
            Write-Host "[FAIL] $($svc.Name) (:$($svc.Port)) - http://localhost:$($svc.Port)/health" -ForegroundColor Red
        }
    }
}

if (-not $Quiet) {
    Write-Host ""
    Write-Host "Healthy: $ok / $($Services.Count)"
}

if ($fail -gt 0) {
    exit 1
}

exit 0
