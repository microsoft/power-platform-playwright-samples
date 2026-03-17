# Testing Canvas Apps

This guide covers testing Canvas Apps in detail, including control interactions, navigation, and best practices.

## Canvas App Architecture

Canvas Apps are built with controls (buttons, text inputs, galleries, etc.) that have unique names or data-test-id attributes. The toolkit provides methods to interact with these controls using the CanvasAppPage class.

## Setup and Launch

### Basic Canvas App Test Structure

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
    // Create AppProvider instance
    appProvider = new AppProvider(page, context);

    // Launch Canvas App with direct URL (fastest approach)
    await appProvider.launch({
      app: 'My Canvas App',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: CANVAS_APP_URL,
    });

    // Get CanvasAppPage instance
    canvasApp = appProvider.getCanvasAppPage();
  });

  test('should interact with controls', async () => {
    // Your test code here
  });
});
```

### Building Canvas App URLs

```typescript
import { buildCanvasAppUrl, buildCanvasAppUrlFromEnv } from 'power-platform-playwright-toolkit';

// Option 1: Build from environment variables
const url1 = buildCanvasAppUrlFromEnv();
// Reads: CANVAS_APP_URL or builds from POWER_APPS_ENVIRONMENT_ID, CANVAS_APP_ID, CANVAS_APP_TENANT_ID

// Option 2: Build from specific values
const url2 = buildCanvasAppUrl({
  environmentId: 'abc-123',
  appId: 'xyz-789',
  tenantId: 'tenant-id',
});

// Option 3: Use direct URL
const url3 = buildCanvasAppUrl({
  directUrl: 'https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id',
});
```

## Control Interactions

### Using getControl() (Recommended)

The primary way to interact with Canvas App controls is through `getControl()`:

```typescript
// Get control by data-test-id (recommended if you've added custom attributes)
const orderInput = canvasApp.getControl({ dataTestId: 'txtOrderNumber' });
await orderInput.fill('ORD-12345');

const submitButton = canvasApp.getControl({ dataTestId: 'btnSubmit' });
await submitButton.click();

// Verify control content
const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
await expect(statusLabel).toContainText('Order Created');
```

### Using Control Names

```typescript
// Get control by name (fallback when data-test-id is not available)
const button = canvasApp.getControl({ name: 'ButtonSubmit' });
await button.click();

const textInput = canvasApp.getControl({ name: 'TextInputCustomerName' });
await textInput.fill('John Doe');
```

### Waiting for Controls

```typescript
// Wait for control to be visible
const control = canvasApp.getControl({ dataTestId: 'btnNext' });
await control.waitFor({ state: 'visible', timeout: 10000 });

// Check if control is visible
const isVisible = await control.isVisible();
if (isVisible) {
  await control.click();
}
```

## Working with Different Control Types

### Text Input Controls

```typescript
// Fill text input
const nameInput = canvasApp.getControl({ dataTestId: 'txtCustomerName' });
await nameInput.fill('John Doe');

// Clear and fill
await nameInput.clear();
await nameInput.fill('Jane Smith');

// Get text value
const value = await nameInput.inputValue();
expect(value).toBe('Jane Smith');
```

### Button Controls

```typescript
// Click button
const submitButton = canvasApp.getControl({ dataTestId: 'btnSubmit' });
await submitButton.click();

// Double click
await submitButton.dblclick();

// Click with options
await submitButton.click({ force: true });
```

### Label Controls

```typescript
// Get label text
const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
const text = await statusLabel.textContent();
console.log('Status:', text);

// Verify label content
await expect(statusLabel).toContainText('Success');
await expect(statusLabel).toHaveText('Order Created Successfully');
```

### Dropdown/Combobox Controls

```typescript
// Click to open dropdown
const dropdown = canvasApp.getControl({ dataTestId: 'ddlCountry' });
await dropdown.click();

// Select option
const option = canvasApp.getControl({ dataTestId: 'ddlCountry_USA' });
await option.click();
```

### Checkbox Controls

```typescript
// Check checkbox
const checkbox = canvasApp.getControl({ dataTestId: 'chkAgreeToTerms' });
await checkbox.check();

// Uncheck
await checkbox.uncheck();

// Verify checked state
const isChecked = await checkbox.isChecked();
expect(isChecked).toBe(true);
```

## Working with Galleries

### Gallery Item Interaction

```typescript
// Get gallery control
const gallery = canvasApp.getControl({ dataTestId: 'galProducts' });

// Get all gallery items
const items = await gallery.locator('[data-test-id*="galProducts_"]').all();
console.log('Gallery item count:', items.length);

// Click specific gallery item
const firstItem = canvasApp.getControl({ dataTestId: 'galProducts_1' });
await firstItem.click();

// Interact with controls inside gallery items
const itemButton = canvasApp.getControl({ dataTestId: 'galProducts_1_btnView' });
await itemButton.click();
```

## Complete Test Example

### Order Management Canvas App

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  CanvasAppPage,
  generateUniqueOrderNumber,
  buildCanvasAppUrlFromEnv,
} from 'power-platform-playwright-toolkit';

const CANVAS_APP_URL = buildCanvasAppUrlFromEnv();

test.describe('Northwind Orders Canvas App', () => {
  let appProvider: AppProvider;
  let canvasApp: CanvasAppPage;

  test.beforeEach(async ({ page, context }) => {
    appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'Northwind Orders Canvas',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: CANVAS_APP_URL,
    });

    canvasApp = appProvider.getCanvasAppPage();
  });

  test('should create a new order', async ({ page }) => {
    // Generate unique order number
    const orderNumber = generateUniqueOrderNumber();

    // Click New Order button
    const newOrderButton = canvasApp.getControl({ dataTestId: 'btnNewOrder' });
    await newOrderButton.click();

    // Wait for form to appear
    await page.waitForTimeout(2000);

    // Fill order details
    const orderNumberInput = canvasApp.getControl({ dataTestId: 'txtOrderNumber' });
    await orderNumberInput.fill(orderNumber);

    const customerInput = canvasApp.getControl({ dataTestId: 'txtCustomerName' });
    await customerInput.fill('Contoso Ltd');

    const quantityInput = canvasApp.getControl({ dataTestId: 'txtQuantity' });
    await quantityInput.fill('10');

    // Submit order
    const submitButton = canvasApp.getControl({ dataTestId: 'btnSubmit' });
    await submitButton.click();

    // Verify success message
    const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
    await expect(statusLabel).toContainText('Order Created');

    console.log(`✅ Order ${orderNumber} created successfully`);
  });

  test('should search and view existing order', async ({ page }) => {
    // Enter search term
    const searchInput = canvasApp.getControl({ dataTestId: 'txtSearch' });
    await searchInput.fill('ORD-');

    // Click search button
    const searchButton = canvasApp.getControl({ dataTestId: 'btnSearch' });
    await searchButton.click();

    // Wait for results
    await page.waitForTimeout(2000);

    // Click first result in gallery
    const firstResult = canvasApp.getControl({ dataTestId: 'galOrders_1' });
    await firstResult.click();

    // Verify order details displayed
    const orderDetailsLabel = canvasApp.getControl({ dataTestId: 'lblOrderDetails' });
    const details = await orderDetailsLabel.textContent();
    expect(details).toBeTruthy();

    console.log('✅ Order details displayed');
  });

  test('should update order quantity', async ({ page }) => {
    // Open first order
    const firstOrder = canvasApp.getControl({ dataTestId: 'galOrders_1' });
    await firstOrder.click();

    // Click edit button
    const editButton = canvasApp.getControl({ dataTestId: 'btnEdit' });
    await editButton.click();

    // Update quantity
    const quantityInput = canvasApp.getControl({ dataTestId: 'txtQuantity' });
    await quantityInput.clear();
    await quantityInput.fill('25');

    // Save changes
    const saveButton = canvasApp.getControl({ dataTestId: 'btnSave' });
    await saveButton.click();

    // Verify update message
    const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
    await expect(statusLabel).toContainText('Updated');

    console.log('✅ Order quantity updated');
  });
});
```

## Best Practices

### 1. Use data-test-id Attributes

When building Canvas Apps, add data-test-id attributes to controls for reliable test automation:

```typescript
// In your Canvas App, set custom properties:
// Button1.DataTestId = "btnSubmit"
// TextInput1.DataTestId = "txtCustomerName"

// Then in tests:
const button = canvasApp.getControl({ dataTestId: 'btnSubmit' });
const input = canvasApp.getControl({ dataTestId: 'txtCustomerName' });
```

### 2. Always Use AppProvider

**NEVER** directly instantiate CanvasAppPage:

✅ **CORRECT:**

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({...});
const canvasApp = appProvider.getCanvasAppPage();
```

❌ **INCORRECT:**

```typescript
// NEVER do this
const canvasApp = new CanvasAppPage(page);
```

### 3. Use Direct URL Launch

For fastest test execution, use direct URLs:

```typescript
await appProvider.launch({
  app: 'My Canvas App',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true, // Skip maker portal navigation
  directUrl: process.env.CANVAS_APP_URL,
});
```

### 4. Wait Appropriately

Canvas Apps can be slow to load and respond:

```typescript
// Wait for control to be visible before interacting
const button = canvasApp.getControl({ dataTestId: 'btnSubmit' });
await button.waitFor({ state: 'visible', timeout: 10000 });
await button.click();

// Add explicit waits for transitions
await page.waitForTimeout(2000); // Wait for screen transition
```

### 5. Use Test Data Utilities

Generate unique test data:

```typescript
import {
  generateUniqueOrderNumber,
  generateUniqueTestId,
  generateRandomAlphaNumeric,
} from 'power-platform-playwright-toolkit';

const orderNumber = generateUniqueOrderNumber(); // ORD-12345
const customerId = generateUniqueTestId('CUST'); // CUST-ABC123
const reference = generateRandomAlphaNumeric(8); // X7K9M2P4
```

### 6. Handle Conditional Controls

```typescript
// Check if control exists before interacting
const optionalButton = canvasApp.getControl({ dataTestId: 'btnOptional' });
const isVisible = await optionalButton.isVisible().catch(() => false);

if (isVisible) {
  await optionalButton.click();
}
```

### 7. Use Meaningful Control Names

When building Canvas Apps:

```typescript
// Good naming
ButtonSubmitOrder;
TextInputCustomerEmail;
LabelOrderStatus;
GalleryProductList;

// Avoid
Button1;
TextInput3;
Label5;
Gallery1;
```

## Custom Locators

For advanced scenarios, use locator helper functions:

```typescript
import {
  getCanvasControlByName,
  getCanvasDataTestId,
  getCanvasScreenByName,
} from 'power-platform-playwright-toolkit';

// Get control by name
const button = page.locator(getCanvasControlByName('ButtonSubmit'));

// Get control by data-test-id
const input = page.locator(getCanvasDataTestId('txtEmail'));

// Get screen by name
const screen = page.locator(getCanvasScreenByName('HomeScreen'));
```

## Debugging Tips

### Taking Screenshots

```typescript
// Take screenshot at specific point
await page.screenshot({ path: 'canvas-app-state.png' });

// Take screenshot on failure (automatic with Playwright)
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    await page.screenshot({ path: `failure-${testInfo.title}.png` });
  }
});
```

### Logging Control State

```typescript
// Log control content
const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
const text = await statusLabel.textContent();
console.log('Current status:', text);

// Log page URL
console.log('Current URL:', page.url());
```

### Inspecting Controls

Use browser DevTools:

1. Run test in headed mode: `npx playwright test --headed`
2. Add a breakpoint: `await page.pause()`
3. Inspect Canvas App controls in DevTools
4. Verify data-test-id attributes exist
5. Check control visibility and properties

## Troubleshooting

### Control Not Found

If controls aren't found:

- Verify data-test-id matches exactly (case-sensitive)
- Wait for app to fully load before interacting
- Check if control is inside an iframe
- Use DevTools to inspect the control

### App Loading Issues

If app doesn't load:

- Verify direct URL is correct
- Check authentication (storage state exists)
- Increase timeout: `await page.waitForLoadState('networkidle', { timeout: 60000 })`
- Check browser console for errors

### Slow Performance

If tests are slow:

- Use direct URL launch (skip maker portal)
- Reduce unnecessary waits
- Run in headless mode for CI/CD
- Parallelize tests

## Next Steps

- [Testing Model-Driven Apps](./03-model-driven-apps.md) - Deep dive into Model-Driven App testing with GridComponent and FormComponent
- [Authentication](./04-authentication.md) - Setting up authentication with playwright-ms-auth
- [Advanced Usage](./05-advanced-usage.md) - Advanced patterns and techniques
