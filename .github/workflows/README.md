# GitHub Actions Workflows

CI/CD workflows for the `power-platform-playwright-samples` repository.

## Workflows

### `ci.yml` — Continuous Integration

Runs on every push to `main` and on pull requests.

- Format check (Prettier)
- Lint (ESLint)
- Build all packages (`rush build`)

### `pr.yml` — Pull Request Validation

Runs on pull requests to `main`.

- Format check, lint, build validation
- Package size report
- PR summary with validation results

### `playwright-tests.yml` — E2E Test Pipeline

Nightly (2 AM UTC) and manual dispatch.

- Certificate-based authentication
- Test sharding across 4 parallel runners
- Artifacts: HTML reports, traces, videos, screenshots
- Merged report from all shards

### `publish-npm.yml` — npm Package Release

Triggered on GitHub Release publish or manual dispatch.

- Builds `power-platform-playwright-toolkit`
- Publishes to npm with provenance
- Supports `latest` and `beta` dist-tags

**Required secret:** `NPM_TOKEN`

**Manual trigger:**

```bash
gh workflow run publish-npm.yml -f version=1.2.0 -f tag=latest
```

### `deploy-docs.yml` — Documentation Deployment

Triggered on push to `main` when docs or toolkit source changes.

- Regenerates TypeDoc API reference
- Builds Nextra site with GitHub base path
- Deploys to GitHub Pages

**Required:** GitHub Pages enabled in Settings → Pages → Source: GitHub Actions.

## Required Secrets

Configure in Settings → Secrets and variables → Actions:

| Secret                      | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `MS_AUTH_EMAIL`             | Microsoft account email for E2E tests          |
| `CERTIFICATE_BASE64`        | Certificate `.pfx` encoded as base64           |
| `CERTIFICATE_PASSWORD`      | Certificate password                           |
| `NPM_TOKEN`                 | npm publish token (for `publish-npm.yml` only) |
| `MODEL_DRIVEN_APP_URL`      | MDA test URL                                   |
| `CANVAS_APP_URL`            | Canvas app play URL                            |
| `POWER_APPS_ENVIRONMENT_ID` | Environment GUID                               |

## Encode a certificate as base64

**Windows (PowerShell):**

```powershell
[System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes("certificate.pfx")) | Set-Clipboard
```

**macOS/Linux:**

```bash
base64 -i certificate.pfx | pbcopy     # macOS
base64 -i certificate.pfx              # Linux — copy output manually
```

## Create a self-signed certificate (if needed)

**PowerShell:**

```powershell
$cert = New-SelfSignedCertificate `
    -Subject "CN=PowerPlatformTestAutomation" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyExportPolicy Exportable -KeySpec Signature `
    -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256 `
    -NotAfter (Get-Date).AddYears(2)

$password = ConvertTo-SecureString "YourPassword123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath ".\PowerPlatformCert.pfx" -Password $password
```

**OpenSSL:**

```bash
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem -subj "/CN=PowerPlatformTestAutomation"
openssl x509 -req -days 730 -in csr.pem -signkey key.pem -out cert.crt
openssl pkcs12 -export -out cert.pfx -inkey key.pem -in cert.crt -password pass:YourPassword123
```

## Register certificate in Azure AD

1. Azure Portal → Azure Active Directory → App registrations → your app
2. Certificates & secrets → Certificates → Upload certificate (`.cer` public key)
3. Grant API permissions: Dynamics CRM → `user_impersonation`, Microsoft Graph → `User.Read`
