# Authentication

This guide covers authentication for Power Platform applications using the `playwright-ms-auth` package.

## Overview

The Power Platform Playwright Toolkit uses **playwright-ms-auth** for handling Microsoft authentication. This package manages:

- Username/password authentication
- Certificate-based authentication
- Storage state management
- Token refresh and expiration handling

## Installation

Install the authentication package:

```bash
npm install playwright-ms-auth
```

## Setup

### 1. Configure Environment Variables

Create a `.env` file in your project root:

```env
# User credentials
MS_AUTH_EMAIL=your.email@domain.com
MS_USER_PASSWORD=your-password

# Power Platform configuration
POWER_APPS_ENVIRONMENT_ID=your-environment-id
AZURE_TENANT_ID=your-tenant-id

# App URLs
CANVAS_APP_URL=https://apps.powerapps.com/play/e/ENV-ID/a/APP-ID?tenantId=TENANT-ID
MODEL_DRIVEN_APP_URL=https://yourorg.crm.dynamics.com/main.aspx?appid=APP-ID
```

### 2. Certificate-Based Authentication (Optional)

For certificate-based auth:

```env
MS_AUTH_CREDENTIAL_TYPE=certificate
MS_AUTH_CREDENTIAL_PROVIDER=local
MS_AUTH_LOCAL_FILE_PATH=path/to/certificate.pfx
```

### 3. Create Authentication Script

Create `scripts/authenticate.ts`:

```typescript
import { authenticate } from 'playwright-ms-auth';
import * as dotenv from 'dotenv';

dotenv.config();

async function runAuth() {
  console.log('Starting authentication...');

  try {
    await authenticate({
      headless: false,
      timeout: 120000,
    });

    console.log('✅ Authentication successful');
    console.log('Storage state saved to: .auth/storageState.json');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    process.exit(1);
  }
}

runAuth();
```

### 4. Run Authentication

```bash
# Run authentication script
npx ts-node scripts/authenticate.ts

# Or using Node.js
node --loader ts-node/esm scripts/authenticate.ts
```

This creates `.auth/storageState.json` with authentication tokens.

## Playwright Configuration

Update `playwright.config.ts` to use storage state:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,

  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,

    // Use storage state for all tests
    storageState: '.auth/storageState.json',
  },

  // Separate projects for different auth scenarios
  projects: [
    {
      name: 'authenticated',
      use: {
        storageState: '.auth/storageState.json',
      },
    },
  ],
});
```

## Using Authentication in Tests

### Basic Test with Authentication

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

const MODEL_APP_URL = process.env.MODEL_DRIVEN_APP_URL!;

test.describe('Authenticated Tests', () => {
  test('should access app with authentication', async ({ page, context }) => {
    // AppProvider automatically uses storage state from Playwright config
    const appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'My App',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: MODEL_APP_URL,
    });

    const modelDrivenApp = appProvider.getModelDrivenAppPage();

    // Wait for grid to verify authentication worked
    await modelDrivenApp.grid.waitForGridLoad();

    console.log('✅ Authenticated and app loaded');
  });
});
```

### Checking Token Expiration

```typescript
import { ConfigHelper } from 'power-platform-playwright-toolkit';

test.beforeAll(async () => {
  // Check if authentication token is expired
  const check = ConfigHelper.checkStorageStateExpiration('.auth/storageState.json');

  if (check.expired) {
    console.error('❌ Authentication token has expired');
    console.log('Please run: npx ts-node scripts/authenticate.ts');
    process.exit(1);
  }

  if (check.expiresOn) {
    const expiryDate = new Date(check.expiresOn * 1000);
    console.log(`✅ Token expires at: ${expiryDate.toLocaleString()}`);
  }
});
```

### Getting Authentication Token

```typescript
import { ConfigHelper } from 'power-platform-playwright-toolkit';

test('use auth token for API calls', async ({ page }) => {
  // Get authentication token from storage state
  const token = ConfigHelper.getAuthToken('.auth/storageState.json');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  // Use token for API calls
  const response = await page.request.get(
    'https://api.bap.microsoft.com/providers/Microsoft.BusinessAppPlatform/environments',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  expect(response.ok()).toBeTruthy();
});
```

## Authentication Best Practices

### 1. Re-authenticate When Needed

```typescript
test.beforeAll(async () => {
  const check = ConfigHelper.checkStorageStateExpiration();

  if (check.expired) {
    console.log('Token expired, re-authenticating...');
    // Re-run authentication script or fail the test
    throw new Error('Please re-authenticate: npx ts-node scripts/authenticate.ts');
  }
});
```

### 2. Use Separate Storage States

For testing with different users:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'admin-user',
      use: {
        storageState: '.auth/admin-storageState.json',
      },
    },
    {
      name: 'regular-user',
      use: {
        storageState: '.auth/user-storageState.json',
      },
    },
  ],
});
```

### 3. Keep Tokens Secure

- Add `.auth/` to `.gitignore`
- Don't commit storage state files
- Use environment variables for sensitive data
- Rotate credentials regularly

```gitignore
# .gitignore
.auth/
.env
*.json
```

### 4. Validate Authentication

```typescript
import { checkEnvironmentVariables } from 'power-platform-playwright-toolkit';

test.beforeAll(() => {
  // Validate required environment variables are set
  try {
    checkEnvironmentVariables();
    console.log('✅ All required environment variables are set');
  } catch (error) {
    console.error('❌ Missing environment variables:', error.message);
    process.exit(1);
  }
});
```

## Troubleshooting

### Token Expired

If tests fail with authentication errors:

```bash
# Re-run authentication
npx ts-node scripts/authenticate.ts

# Verify storage state exists
ls -la .auth/storageState.json

# Check token expiration
npx ts-node -e "
import { ConfigHelper } from 'power-platform-playwright-toolkit';
const check = ConfigHelper.checkStorageStateExpiration();
console.log('Expired:', check.expired);
console.log('Expires On:', check.expiresOn ? new Date(check.expiresOn * 1000) : 'Unknown');
"
```

### MFA Required

If your account requires MFA (Multi-Factor Authentication):

1. Run authentication in headed mode
2. Complete MFA challenge manually
3. Storage state will be saved after successful auth

```typescript
await authenticate({
  headless: false, // Must be false for MFA
  timeout: 300000, // Longer timeout for manual MFA
});
```

### Certificate Authentication Issues

If certificate auth fails:

- Verify certificate file path is correct
- Ensure certificate is not expired
- Check certificate has required permissions
- Verify `MS_AUTH_CREDENTIAL_TYPE=certificate` is set

### Storage State Not Found

If Playwright can't find storage state:

```bash
# Check if file exists
ls .auth/storageState.json

# Re-run authentication
npx ts-node scripts/authenticate.ts

# Verify Playwright config path is correct
# storageState: '.auth/storageState.json'
```

## Advanced Authentication Scenarios

### Multiple Environments

```typescript
// authenticate-dev.ts
await authenticate({
  outputFile: '.auth/dev-storageState.json',
});

// authenticate-prod.ts
await authenticate({
  outputFile: '.auth/prod-storageState.json',
});

// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'dev',
      use: {
        storageState: '.auth/dev-storageState.json',
      },
    },
    {
      name: 'prod',
      use: {
        storageState: '.auth/prod-storageState.json',
      },
    },
  ],
});
```

### Conditional Authentication

```typescript
test.beforeEach(async ({ page, context }) => {
  // Check if storage state exists
  const fs = require('fs');
  const storageStatePath = '.auth/storageState.json';

  if (!fs.existsSync(storageStatePath)) {
    console.log('Storage state not found, running authentication...');
    await authenticate({
      outputFile: storageStatePath,
      headless: false
    });
  }

  // Proceed with test
  const appProvider = new AppProvider(page, context);
  await appProvider.launch({...});
});
```

### Token Refresh

```typescript
test.beforeAll(async () => {
  const check = ConfigHelper.checkStorageStateExpiration();

  if (check.expired) {
    console.log('Token expired, refreshing...');
    await authenticate({
      outputFile: '.auth/storageState.json',
      headless: true,
    });
  } else if (check.expiresOn) {
    const hoursUntilExpiry = (check.expiresOn - Date.now() / 1000) / 3600;
    console.log(`Token expires in ${hoursUntilExpiry.toFixed(1)} hours`);

    if (hoursUntilExpiry < 1) {
      console.log('Token expiring soon, refreshing...');
      await authenticate({
        outputFile: '.auth/storageState.json',
        headless: true,
      });
    }
  }
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Authenticate
        env:
          MS_AUTH_EMAIL: ${{ secrets.MS_AUTH_EMAIL }}
          MS_USER_PASSWORD: ${{ secrets.MS_USER_PASSWORD }}
          AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
        run: npx ts-node scripts/authenticate.ts

      - name: Run tests
        env:
          CANVAS_APP_URL: ${{ secrets.CANVAS_APP_URL }}
          MODEL_DRIVEN_APP_URL: ${{ secrets.MODEL_DRIVEN_APP_URL }}
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Environment Variable Reference

### Required Variables

```env
# Authentication
MS_AUTH_EMAIL=user@domain.com
MS_USER_PASSWORD=password

# Azure/Power Platform
AZURE_TENANT_ID=your-tenant-id
POWER_APPS_ENVIRONMENT_ID=your-environment-id

# App URLs
CANVAS_APP_URL=https://apps.powerapps.com/play/...
MODEL_DRIVEN_APP_URL=https://org.crm.dynamics.com/...
```

### Optional Variables

```env
# Certificate authentication
MS_AUTH_CREDENTIAL_TYPE=certificate
MS_AUTH_CREDENTIAL_PROVIDER=local
MS_AUTH_LOCAL_FILE_PATH=path/to/cert.pfx

# Custom URLs
POWER_APPS_BASE_URL=https://make.powerapps.com
BAP_API_URL=https://api.bap.microsoft.com
AUTH_ENDPOINT=https://login.microsoftonline.com
```

## Next Steps

- [Advanced Usage](./05-advanced-usage.md) - Advanced patterns and techniques
- [playwright-ms-auth Documentation](https://github.com/microsoft/playwright-ms-auth) - Official authentication package docs
