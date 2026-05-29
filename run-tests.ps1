# =============================================================================
# Veltro Novo E2E — Playwright test runner helper
# =============================================================================
#
# Wraps `npx playwright test` so you don't have to remember:
#   - to switch to Node 20.16 via fnm,
#   - to cd into packages\e2e-tests,
#   - to pass --project=veltro-novo-codeapp.
#
# Usage:
#   .\run-tests.ps1                          # all veltro-novo-codeapp tests
#   .\run-tests.ps1 smoke                    # tests matching 'smoke'
#   .\run-tests.ps1 shell                    # tests matching 'shell'
#   .\run-tests.ps1 -Headed                  # see the browser
#   .\run-tests.ps1 -Debug                   # Playwright Inspector
#   .\run-tests.ps1 -Project northwind-mda   # run a different project
#   .\run-tests.ps1 -Report                  # open last HTML report and exit
#   .\run-tests.ps1 -SlowMo 500              # add 500ms slowdown between actions
# =============================================================================

param(
    [string]$Filter = '',
    [string]$Project = 'veltro-novo-codeapp',
    [switch]$Headed,
    [switch]$Debug,
    [int]$SlowMo = 0,
    [switch]$Report
)

$nodePath = "$env:USERPROFILE\AppData\Roaming\fnm\node-versions\v20.16.0\installation"
if (-not (Test-Path $nodePath)) {
    Write-Host "ERROR: Node 20.16.0 not found at $nodePath" -ForegroundColor Red
    Write-Host "Run: fnm install 20.16.0" -ForegroundColor Yellow
    exit 1
}
$env:PATH = "$nodePath;$env:PATH"
Set-Location "$PSScriptRoot\packages\e2e-tests"

if ($Report) {
    npx playwright show-report
    return
}

$args = @('playwright', 'test', "--project=$Project")
if ($Headed) { $args += '--headed' }
if ($Debug)  { $args += '--debug' }
if ($Filter) { $args += '-g'; $args += $Filter }
if ($SlowMo -gt 0) { $env:SLOW_MO = "$SlowMo" }

Write-Host "Running: npx $($args -join ' ')" -ForegroundColor Cyan
npx @args
