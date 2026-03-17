# Authentication Guide for Power Platform Testing

This guide explains the authentication architecture and differences between Power Apps, Canvas Apps, and Model-Driven Apps.

## Overview

Power Platform applications use different authentication mechanisms depending on the app type and domain. Understanding these differences is crucial for successful test automation.

## Authentication Architecture

### 1. Power Apps Maker Portal (`make.powerapps.com`)

**Authentication Method**: MSAL (Microsoft Authentication Library) with browser-based OAuth flow

**Characteristics**:

- Uses OAuth 2.0 authorization code flow
- Tokens stored in browser's localStorage
- Single sign-on across Power Platform services
- Session managed by Azure AD

**When to Use**:

- Creating/editing Canvas Apps
- Navigating Power Apps maker portal
- Managing environments and connections

**Authentication Command**:

```bash
npm run auth:headful
```

**Storage Location**: `.playwright-ms-auth/state-{email}.json`

---

### 2. Canvas Apps (`apps.powerapps.com`)

**Authentication Method**: MSAL tokens + Power Apps session cookies

**Characteristics**:

- Inherits authentication from Power Apps maker portal
- Uses MSAL tokens for API calls
- Session cookies for app runtime
- **Shares authentication** with maker portal (same domain)

**When to Use**:

- Testing Canvas App functionality
- Running Canvas App tests
- Interacting with Canvas App controls

**Authentication Command**:

```bash
npm run auth:headful  # Same as Power Apps maker portal
```

**Storage Location**: `.playwright-ms-auth/state-{email}.json` (same as maker portal)

**Important Notes**:

- Canvas Apps use the **same authentication** as the Power Apps maker portal
- No separate authentication required
- Tests can use the base storage state

---

### 3. Model-Driven Apps (`*.crm.dynamics.com`)

**Authentication Method**: Certificate-based authentication (TLS client certificates)

**Characteristics**:

- **Different domain** from Power Apps maker portal
- Requires **client certificate** for TLS handshake
- Certificate presented at network/TLS layer
- Uses `certauth.login.microsoftonline.com` endpoint
- **Separate authentication required**

**When to Use**:

- Testing Model-Driven App functionality
- Accessing Dynamics 365 data
- Working with Dataverse entities

**Authentication Command**:

```bash
npm run auth:mda:headful  # MDA-specific authentication
```

**Storage Location**: `.playwright-ms-auth/state-mda-{email}.json` (separate from base)

**Important Notes**:

- Model-Driven Apps require **separate authentication**
- Certificate authentication is **automatic** in `ModelDrivenAppPage` constructor
- Tests must use MDA-specific storage state

---

## Why Separate Authentication for Model-Driven Apps?

### Domain Difference

```
Power Apps Maker Portal:  make.powerapps.com
Canvas Apps:              apps.powerapps.com (same domain family)
Model-Driven Apps:        org.crm.dynamics.com (DIFFERENT domain)
```

### Certificate Requirement

Model-Driven Apps (Dynamics 365) require **certificate-based authentication** at the TLS layer:

1. **Client Certificate**: Tests must present a client certificate during TLS handshake
2. **Certificate Auth Endpoint**: Uses `certauth.login.microsoftonline.com` for authentication
3. **Route Interception**: Certificate authentication is added via Playwright route interception

### Authentication Flow Comparison

**Power Apps / Canvas Apps**:

```
Browser → login.microsoftonline.com → OAuth flow → MSAL tokens in localStorage
```

**Model-Driven Apps**:

```
Browser → certauth.login.microsoftonline.com → Certificate presented at TLS layer → Session established
```

---

## Automatic Certificate Authentication

The `ModelDrivenAppPage` constructor **automatically enables certificate authentication** when configured:

```typescript
// Certificate authentication is automatic!
const modelDrivenApp = new ModelDrivenAppPage(page, baseAppUrl);

// No manual cert auth setup needed
await page.goto(baseAppUrl);
```

### How It Works

1. **Constructor Setup**: When `ModelDrivenAppPage` is created, it checks environment variables:
   - `MS_AUTH_CREDENTIAL_TYPE=certificate`
   - `MS_AUTH_LOCAL_FILE_PATH=./cert/cert.pfx`

2. **Automatic Route Interception**: Certificate authentication route is added to intercept requests to:
   - `certauth.login.microsoftonline.com`

3. **TLS Certificate Presentation**: When the app makes auth requests, the certificate is presented at the TLS layer

4. **Session Establishment**: After successful certificate auth, session cookies are stored

---

## Configuration

### Environment Variables

```bash
# Required for all auth types
MS_AUTH_EMAIL=your-email@domain.com

# For Certificate Authentication (Model-Driven Apps)
MS_AUTH_CREDENTIAL_TYPE=certificate
MS_AUTH_CREDENTIAL_PROVIDER=local-file
MS_AUTH_LOCAL_FILE_PATH=./cert/your-cert.pfx
MS_AUTH_CERTIFICATE_PASSWORD=cert-password  # Optional

# For Password Authentication (Power Apps/Canvas Apps)
MS_AUTH_CREDENTIAL_TYPE=password
MS_USER_PASSWORD=your-password
```

### Playwright Configuration

```typescript
// playwright.config.ts
projects: [
  {
    name: 'model-driven-app',
    testMatch: '**/mda/**/*.test.ts',
    use: {
      // MDA-specific storage state with certificate auth
      storageState: path.join(storageStateDir, `state-mda-${email}.json`),
    },
  },
  {
    name: 'default',
    testIgnore: '**/mda/**/*.test.ts',
    use: {
      // Default storage state for Power Apps/Canvas Apps
      storageState: getStorageStatePath(email),
    },
  },
];
```

---

## Authentication Commands

### Power Apps Maker Portal & Canvas Apps

```bash
# Headful mode (see the browser)
npm run auth:headful

# Headless mode (no browser UI)
npm run auth
```

### Model-Driven Apps

```bash
# Headful mode (see the browser) - RECOMMENDED first time
npm run auth:mda:headful

# Headless mode (no browser UI)
npm run auth:mda
```

---

## Storage State Files

### Base Authentication (Power Apps/Canvas Apps)

**File**: `.playwright-ms-auth/state-{email}.json`

**Contains**:

- MSAL tokens in localStorage
- Session cookies for `make.powerapps.com`
- Session cookies for `apps.powerapps.com`

**Used By**:

- Power Apps maker portal tests
- Canvas App tests
- Default test project

### MDA Authentication (Model-Driven Apps)

**File**: `.playwright-ms-auth/state-mda-{email}.json`

**Contains**:

- MSAL tokens in localStorage
- Session cookies for `*.crm.dynamics.com`
- Dynamics 365 session information

**Used By**:

- Model-Driven App tests
- MDA test project (`tests/mda/**`)

---

## Testing Patterns

### Canvas App Tests

```typescript
import { test } from '@playwright/test';
import { CanvasAppPage } from 'power-platform-playwright-toolkit';

test('Canvas App test', async ({ page }) => {
  // Uses base storage state automatically
  const canvasApp = new CanvasAppPage(page);

  // No special auth setup needed
  await canvasApp.launchCanvasApp(appUrl);
});
```

### Model-Driven App Tests

```typescript
import { test } from '@playwright/test';
import { ModelDrivenAppPage } from 'power-platform-playwright-toolkit';

test('MDA test', async ({ page }) => {
  // Certificate auth is automatic in constructor!
  const modelDrivenApp = new ModelDrivenAppPage(page, baseAppUrl);

  // Navigate directly - cert auth already enabled
  await page.goto(baseAppUrl);

  // Use grid component
  const rowCount = await modelDrivenApp.grid.getRowCount();
});
```

---

## Troubleshooting

### "An error has occurred" in Model-Driven App

**Problem**: Error page appears when navigating to Model-Driven App

**Cause**: Certificate authentication not enabled

**Solution**: Ensure `ModelDrivenAppPage` is created before navigation (cert auth is automatic)

```typescript
// ✅ CORRECT - Cert auth automatic
const modelDrivenApp = new ModelDrivenAppPage(page, baseAppUrl);
await page.goto(baseAppUrl);

// ❌ WRONG - No cert auth
await page.goto(baseAppUrl);
const modelDrivenApp = new ModelDrivenAppPage(page, baseAppUrl);
```

### Storage State Expired

**Problem**: "Authentication tokens have expired" error

**Solution**: Re-authenticate

```bash
# For Power Apps/Canvas Apps
npm run auth:headful

# For Model-Driven Apps
npm run auth:mda:headful
```

### Certificate File Not Found

**Problem**: "Certificate file path does not exist"

**Solution**: Verify environment variables

```bash
# Check certificate path
echo $MS_AUTH_LOCAL_FILE_PATH

# Verify file exists
ls -la ./cert/your-cert.pfx
```

---

## Summary

| App Type              | Domain               | Auth Method           | Storage File             | Command                    |
| --------------------- | -------------------- | --------------------- | ------------------------ | -------------------------- |
| **Power Apps Maker**  | `make.powerapps.com` | MSAL + OAuth          | `state-{email}.json`     | `npm run auth:headful`     |
| **Canvas Apps**       | `apps.powerapps.com` | MSAL + OAuth (shared) | `state-{email}.json`     | `npm run auth:headful`     |
| **Model-Driven Apps** | `*.crm.dynamics.com` | **Certificate Auth**  | `state-mda-{email}.json` | `npm run auth:mda:headful` |

**Key Takeaways**:

- Power Apps and Canvas Apps **share authentication** (same domain family)
- Model-Driven Apps require **separate certificate-based authentication** (different domain)
- Certificate authentication is **automatic** in `ModelDrivenAppPage` constructor
- Use appropriate storage state for each app type
