# Getting Started with Power Platform Playwright Toolkit

This guide will walk you through setting up and writing your first test for a Power Platform application.

## Installation

First, install the toolkit in your project:

```bash
npm install power-platform-playwright-toolkit
npm install -D @playwright/test
```

## Project Setup

Create a Playwright configuration file `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
  },
});
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Direct App URLs (recommended for fastest execution)
CANVAS_APP_URL=https://apps.powerapps.com/play/e/YOUR-ENV-ID/a/YOUR-APP-ID?tenantId=YOUR-TENANT-ID
MODEL_DRIVEN_APP_URL=https://yourorg.crm.dynamics.com/main.aspx?appid=YOUR-APP-ID

# Power Apps Environment
POWER_APPS_ENVIRONMENT_ID=your-environment-id
AZURE_TENANT_ID=your-tenant-id

# Authentication (using playwright-ms-auth)
MS_AUTH_EMAIL=your.email@domain.com
MS_USER_PASSWORD=your-password
# OR certificate-based auth
MS_AUTH_CREDENTIAL_TYPE=certificate
MS_AUTH_CREDENTIAL_PROVIDER=local
MS_AUTH_LOCAL_FILE_PATH=path/to/cert.pfx
```

## Core Architecture

The toolkit uses **AppProvider** as the single entry point for all Power Platform app testing:

```typescript
import { AppProvider, AppType, AppLaunchMode } from 'power-platform-playwright-toolkit';

// Create AppProvider with page and context
const appProvider = new AppProvider(page, context);

// Launch app with direct URL (fastest approach)
await appProvider.launch({
  app: 'My App Name',
  type: AppType.Canvas, // or AppType.ModelDriven
  mode: AppLaunchMode.Play, // or AppLaunchMode.Edit
  skipMakerPortal: true, // Skip maker portal navigation
  directUrl: process.env.CANVAS_APP_URL,
});

// Get the appropriate page object
const canvasApp = appProvider.getCanvasAppPage();
// or
const modelDrivenApp = appProvider.getModelDrivenAppPage();
```

## Writing Your First Test

### Canvas App Test

Create a test file `tests/canvas-app.test.ts`:

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  CanvasAppPage,
  buildCanvasAppUrlFromEnv,
} from 'power-platform-playwright-toolkit';

const CANVAS_APP_URL = buildCanvasAppUrlFromEnv();

test.describe('Canvas App Tests', () => {
  let appProvider: AppProvider;
  let canvasApp: CanvasAppPage;

  test.beforeEach(async ({ page, context }) => {
    appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'My Canvas App',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: CANVAS_APP_URL,
    });

    canvasApp = appProvider.getCanvasAppPage();
  });

  test('should interact with canvas controls', async () => {
    // Interact with canvas controls using data-test-id
    const textInput = canvasApp.getControl({ dataTestId: 'txtOrderNumber' });
    await textInput.fill('ORD-12345');

    const submitButton = canvasApp.getControl({ dataTestId: 'btnSubmit' });
    await submitButton.click();

    // Verify results
    const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
    await expect(statusLabel).toContainText('Order Created');
  });
});
```

### Model-Driven App Test

Create a test file `tests/model-driven-app.test.ts`:

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

const MODEL_APP_URL = process.env.MODEL_DRIVEN_APP_URL!;

test.describe('Model-Driven App Tests', () => {
  let appProvider: AppProvider;
  let modelDrivenApp: ModelDrivenAppPage;

  test.beforeEach(async ({ page, context }) => {
    appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'My Model-Driven App',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: MODEL_APP_URL,
    });

    modelDrivenApp = appProvider.getModelDrivenAppPage();
  });

  test('should open record from grid', async () => {
    // Wait for grid to load
    await modelDrivenApp.grid.waitForGridLoad();

    // Open first record
    await modelDrivenApp.grid.openRecord({ rowNumber: 0 });

    // Interact with form using FormComponent
    await modelDrivenApp.form.setAttribute('name', 'Contoso Ltd');
    await modelDrivenApp.form.save();

    // Verify
    const name = await modelDrivenApp.form.getAttribute('name');
    expect(name).toBe('Contoso Ltd');
  });

  test('should work with grid data', async () => {
    // Get cell value from grid
    const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
    console.log('Order Number:', orderNumber);

    // Select multiple rows
    await modelDrivenApp.grid.selectRows([0, 1, 2]);

    // Check row count
    const rowCount = await modelDrivenApp.grid.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });
});
```

## Component-Based Architecture

The toolkit provides reusable components for common UI patterns:

### GridComponent

```typescript
// Access GridComponent via ModelDrivenAppPage
const grid = modelDrivenApp.grid;

// Open records
await grid.openRecord({ rowNumber: 0 });
await grid.openRecord({ columnValue: 'ORD-123', columnName: 'Order Number' });

// Get data
const cellValue = await grid.getCellValue(0, 'Order Number');
const rowCount = await grid.getRowCount();

// Select rows
await grid.selectRow(0);
await grid.selectRows([0, 1, 2]);

// Sort and wait
await grid.sortByColumn('Order Date', 'desc');
await grid.waitForGridLoad();
```

### FormComponent

```typescript
// Access FormComponent via ModelDrivenAppPage
const form = modelDrivenApp.form;

// Get/Set attributes
const name = await form.getAttribute('name');
await form.setAttribute('name', 'New Value');

// Form operations
await form.save();
const isDirty = await form.isDirty();
const isValid = await form.isValid();

// Navigation
await form.navigateToTab({ tabName: 'Details' });
await form.navigateToSection({ sectionName: 'Address' });

// Field controls
await form.setFieldVisibility('telephone1', false);
await form.setFieldDisabled('name', true);
await form.setFieldRequiredLevel('email', 'required');

// Notifications
await form.showNotification('Record saved', 'success', 'save-msg');
await form.clearNotification('save-msg');

// Execute custom FormContext code
const formType = await form.execute((Xrm) => {
  return Xrm.Page.ui.getFormType();
});
```

## Running Tests

Run your tests using Playwright:

```bash
# Run all tests
npx playwright test

# Run in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/canvas-app.test.ts

# Run with UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Understanding the Architecture

### 1. AppProvider Pattern (Mandatory)

**AppProvider is the ONLY entry point for all Power Platform testing.** Never directly instantiate page objects.

✅ **CORRECT:**

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({...});
const app = appProvider.getCanvasAppPage();
```

❌ **INCORRECT:**

```typescript
// NEVER do this
const app = new CanvasAppPage(page);
```

### 2. Direct URL Launch (Recommended)

For fastest test execution, use direct URLs with `skipMakerPortal: true`:

```typescript
await appProvider.launch({
  app: 'My App',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true, // Skip maker portal
  directUrl: process.env.APP_URL, // Direct URL
});
```

### 3. Component-Based Testing

Use GridComponent and FormComponent for Model-Driven Apps:

```typescript
// Grid operations
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
const value = await modelDrivenApp.grid.getCellValue(0, 'Column Name');

// Form operations
await modelDrivenApp.form.setAttribute('name', 'Value');
await modelDrivenApp.form.save();
```

## Utility Functions

### Test Data Generation

```typescript
import {
  generateUniqueOrderNumber,
  generateUniqueTestId,
  generateRandomAlphaNumeric,
} from 'power-platform-playwright-toolkit';

const orderNumber = generateUniqueOrderNumber(); // ORD-12345
const testId = generateUniqueTestId('USER'); // USER-ABC123
const randomString = generateRandomAlphaNumeric(8); // X7K9M2P4
```

### Canvas App URL Building

```typescript
import { buildCanvasAppUrl, buildCanvasAppUrlFromEnv } from 'power-platform-playwright-toolkit';

// Build from environment variables
const url = buildCanvasAppUrlFromEnv();

// Build from specific values
const url = buildCanvasAppUrl({
  environmentId: 'env-id',
  appId: 'app-id',
  tenantId: 'tenant-id',
});
```

### Authentication Token Management

```typescript
import { ConfigHelper } from 'power-platform-playwright-toolkit';

// Get auth token from storage state
const token = ConfigHelper.getAuthToken();

// Check token expiration
const check = ConfigHelper.checkStorageStateExpiration();
if (check.expired) {
  console.log('Token expired, re-authenticate');
}
```

## Next Steps

- [Testing Canvas Apps](./02-canvas-apps.md) - Deep dive into Canvas App testing
- [Testing Model-Driven Apps](./03-model-driven-apps.md) - Deep dive into Model-Driven App testing
- [Authentication](./04-authentication.md) - Setting up authentication with playwright-ms-auth
- [Advanced Usage](./05-advanced-usage.md) - Advanced patterns and techniques

## Troubleshooting

### App Not Loading

If your app doesn't load, check:

- The direct URL is correct and accessible
- Authentication is properly configured (storage state exists)
- Timeouts are sufficient (use 60-120 seconds for initial load)
- Environment variables are set correctly

### Control Not Found

If controls aren't found:

- Verify the data-test-id or control name matches exactly (case-sensitive)
- Use `await grid.waitForGridLoad()` before interacting with grid
- Wait for app to fully load before interacting
- Use browser DevTools to inspect the control selectors

### Authentication Issues

For authentication problems:

- Ensure `playwright-ms-auth` is configured (see [Authentication Guide](./04-authentication.md))
- Check that storage state file exists and is not expired
- Verify your account has access to the app
- Run authentication script separately: `npx ts-node scripts/authenticate.ts`

### Grid/Form Issues

If grid or form operations fail:

- Wait for grid to load: `await modelDrivenApp.grid.waitForGridLoad()`
- Check if form is loaded: `await modelDrivenApp.form.getContext()`
- Verify column names match exactly (case-sensitive)
- Use FormContext API for complex form operations
