param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceDir,

    [Parameter(Mandatory = $true)]
    [int]$Port,

    [switch]$Reload
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ServicePath = Join-Path $Root $ServiceDir
$SrcPath = Join-Path $ServicePath "src"
$Python = Join-Path $Root ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    Write-Error "Virtual environment not found at $Python"
    exit 1
}

function Import-DotEnv {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) {
            return
        }
        $eq = $line.IndexOf("=")
        if ($eq -lt 1) {
            return
        }
        $name = $line.Substring(0, $eq).Trim()
        $value = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Import-DotEnv (Join-Path $Root ".env")
Import-DotEnv (Join-Path $Root ".env.example")

$env:PYTHONPATH = $SrcPath
Set-Location $ServicePath

$uvicornArgs = @(
    "-m", "uvicorn", "presentation.main:app",
    "--host", "0.0.0.0",
    "--port", "$Port"
)

if ($Reload) {
    $uvicornArgs += "--reload"
}

& $Python @uvicornArgs
