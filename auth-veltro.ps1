# =============================================================================
# Auth Veltro Novo Dev — interactive Read-Host password, memory-only
# Window stays open at the end so you can read output. Full log to file too.
# =============================================================================
#
# What this does:
#   1. Prompts you for the e2e-veltro@powerfoxbi.com password (hidden input).
#   2. Runs `npm run auth:headful` — opens Edge, logs into make.powerapps.com,
#      caches the Maker Portal storage state (24h TTL).
#   3. Runs `npm run auth:mda:headful` — same flow against the MDA host
#      (crm4.dynamics.com). Code Apps share auth with MDAs, so this state
#      is what our CodeAppPage tests will use.
#
# What this does NOT do:
#   - Write the password to disk. It lives only in process memory and is
#     wiped on script exit.
#
# Prerequisites:
#   - Node 20.16.0 installed via fnm at the standard path.
#   - `rush install` has been run (so playwright-ms-auth is present).
#   - .env file exists at packages\e2e-tests\.env with MS_AUTH_EMAIL set
#     to e2e-veltro@powerfoxbi.com.
#
# Usage (from the agent, via Claude PowerShell):
#   wt.exe -d "C:\Dev\clients\veltro-novo-e2e" powershell -NoExit `
#     -ExecutionPolicy Bypass -File ".\auth-veltro.ps1"
#
# Usage (from VS Code terminal, manual):
#   pwsh -ExecutionPolicy Bypass -File .\auth-veltro.ps1
# =============================================================================

$ErrorActionPreference = 'Continue'
$logFile = "$PSScriptRoot\auth-veltro.log"
Start-Transcript -Path $logFile -Force | Out-Null

try {
    $nodePath = "$env:USERPROFILE\AppData\Roaming\fnm\node-versions\v20.16.0\installation"
    if (-not (Test-Path $nodePath)) {
        Write-Host "ERROR: Node 20.16.0 not found at $nodePath" -ForegroundColor Red
        Write-Host "Run: fnm install 20.16.0" -ForegroundColor Yellow
        return
    }
    $env:PATH = "$nodePath;$env:PATH"
    Set-Location (Join-Path $PSScriptRoot 'packages\e2e-tests')

    Write-Host ''
    Write-Host '================================================================' -ForegroundColor Cyan
    Write-Host '  Veltro Novo Dev - Playwright auth' -ForegroundColor Cyan
    Write-Host '  Account: e2e-veltro@powerfoxbi.com' -ForegroundColor Cyan
    Write-Host '  Env:     https://veltro.crm4.dynamics.com' -ForegroundColor Cyan
    Write-Host '  App:     Veltro Novo Code App (801a1353-ed03-4c01-b215-c05c217eaf97)' -ForegroundColor Cyan
    Write-Host '  Steps:   auth:headful (Maker) + auth:mda:headful (CRM/Code App)' -ForegroundColor Cyan
    Write-Host '================================================================' -ForegroundColor Cyan
    Write-Host ''
    Write-Host 'IMPORTANT - If the e2e-veltro@ account has MFA enabled, you have up to' -ForegroundColor Yellow
    Write-Host '3 MINUTES per step to approve. Have Authenticator ready BEFORE you' -ForegroundColor Yellow
    Write-Host 'type the password.' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'If MFA is excluded for this account via Conditional Access, the auth' -ForegroundColor DarkGray
    Write-Host 'will complete in seconds without MFA prompt. That is fine.' -ForegroundColor DarkGray
    Write-Host ''

    $env:MS_AUTH_MSAL_TOKEN_TIMEOUT = '120000'
    $env:PLAYWRIGHT_NAVIGATION_TIMEOUT = '180000'
    $env:SYSTEM_DEBUG = 'true'

    $pwdSecure = Read-Host -Prompt 'Password (oculto)' -AsSecureString
    if (-not $pwdSecure -or $pwdSecure.Length -eq 0) {
        Write-Host 'ERROR: Empty password. Abort.' -ForegroundColor Red
        return
    }
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pwdSecure)
    try {
        $env:MS_USER_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }

    Write-Host ''
    Write-Host '  Password in process memory. Launching auth flows...' -ForegroundColor Green
    Write-Host ''

    try {
        Write-Host '--- Step 1/2: auth:headful (Maker Portal storage state) ---' -ForegroundColor Cyan
        npm run auth:headful
        $step1 = $LASTEXITCODE
        Write-Host "Step 1 exit code: $step1" -ForegroundColor $(if ($step1 -eq 0) { 'Green' } else { 'Red' })

        if ($step1 -eq 0) {
            Write-Host '--- Step 2/2: auth:mda:headful (CRM/Code App storage state) ---' -ForegroundColor Cyan
            npm run auth:mda:headful
            $step2 = $LASTEXITCODE
            Write-Host "Step 2 exit code: $step2" -ForegroundColor $(if ($step2 -eq 0) { 'Green' } else { 'Red' })
            if ($step2 -eq 0) {
                Write-Host '  Both auth flows succeeded. Storage states cached for 24h.' -ForegroundColor Green
                Write-Host '  Next: from a normal shell, run .\run-tests.ps1 smoke' -ForegroundColor Green
            }
        }
    } finally {
        Remove-Item env:MS_USER_PASSWORD -ErrorAction SilentlyContinue
        $pwdSecure = $null
        [GC]::Collect()
        Write-Host '  Password wiped from process memory.' -ForegroundColor Yellow
    }

    Write-Host ''
    Write-Host 'Storage state files:' -ForegroundColor Cyan
    Get-ChildItem ".playwright-ms-auth" -ErrorAction SilentlyContinue | Format-Table Name, Length, LastWriteTime -AutoSize
} catch {
    Write-Host "FATAL: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
} finally {
    Stop-Transcript | Out-Null
    Write-Host "  Full log written to: $logFile" -ForegroundColor Magenta
    # CRITICAL: end with Read-Host, never `exit` — `exit` closes the window.
    Read-Host 'Press Enter to close this window (output above stays visible)'
}
