# Advanced Usage

This guide covers advanced patterns, custom page objects, test organization, and best practices for testing Power Platform applications.

## Custom Page Objects

Extend the base page objects for app-specific functionality:

### Canvas App Custom Page

```typescript
import { CanvasAppPage, AppProvider } from 'power-platform-playwright-toolkit';
import { Page, BrowserContext } from '@playwright/test';

export class NorthwindCanvasAppPage extends CanvasAppPage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Create a new order with all required fields
   */
  async createOrder(orderData: {
    orderNumber: string;
    customer: string;
    product: string;
    quantity: number;
  }): Promise<void> {
    // Click New Order button
    const newOrderButton = this.getControl({ dataTestId: 'btnNewOrder' });
    await newOrderButton.click();
    await this.page.waitForTimeout(2000);

    // Fill order details
    const orderNumberInput = this.getControl({ dataTestId: 'txtOrderNumber' });
    await orderNumberInput.fill(orderData.orderNumber);

    const customerInput = this.getControl({ dataTestId: 'txtCustomer' });
    await customerInput.fill(orderData.customer);

    const productInput = this.getControl({ dataTestId: 'txtProduct' });
    await productInput.fill(orderData.product);

    const quantityInput = this.getControl({ dataTestId: 'txtQuantity' });
    await quantityInput.fill(orderData.quantity.toString());

    // Submit order
    const submitButton = this.getControl({ dataTestId: 'btnSubmit' });
    await submitButton.click();
  }

  /**
   * Search for orders by order number
   */
  async searchOrder(orderNumber: string): Promise<void> {
    const searchInput = this.getControl({ dataTestId: 'txtSearch' });
    await searchInput.fill(orderNumber);

    const searchButton = this.getControl({ dataTestId: 'btnSearch' });
    await searchButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage(): Promise<string> {
    const statusLabel = this.getControl({ dataTestId: 'lblStatus' });
    const text = await statusLabel.textContent();
    return text || '';
  }
}

// Usage in tests
test('create order with custom page', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);
  await appProvider.launch({
    app: 'Northwind Canvas',
    type: AppType.Canvas,
    mode: AppLaunchMode.Play,
    skipMakerPortal: true,
    directUrl: process.env.CANVAS_APP_URL!,
  });

  // Get custom page object
  const northwindApp = new NorthwindCanvasAppPage(page);

  // Use custom method
  await northwindApp.createOrder({
    orderNumber: generateUniqueOrderNumber(),
    customer: 'Contoso Ltd',
    product: 'Widget A',
    quantity: 10,
  });

  const successMessage = await northwindApp.verifySuccessMessage();
  expect(successMessage).toContain('Order Created');
});
```

### Model-Driven App Custom Page

```typescript
import { ModelDrivenAppPage, AppProvider } from 'power-platform-playwright-toolkit';
import { Page } from '@playwright/test';

export class NorthwindModelDrivenAppPage extends ModelDrivenAppPage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Open first order record from grid
   */
  async openFirstOrderRecord(): Promise<void> {
    await this.grid.waitForGridLoad();
    await this.grid.openRecord({ rowNumber: 0 });
    await this.page.waitForTimeout(3000);
  }

  /**
   * Create a new order using form
   */
  async createOrder(orderData: {
    orderNumber: string;
    customer: string;
    product: string;
    quantity: number;
  }): Promise<void> {
    // Click New button
    await this.page.getByRole('button', { name: 'New' }).click();
    await this.page.waitForTimeout(3000);

    // Fill form using FormComponent
    await this.form.setAttribute('nwind_ordernumber', orderData.orderNumber);
    await this.form.setAttribute('nwind_customer', orderData.customer);
    await this.form.setAttribute('nwind_product', orderData.product);
    await this.form.setAttribute('nwind_quantity', orderData.quantity);

    // Save
    await this.form.save();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Update order quantity
   */
  async updateOrderQuantity(newQuantity: number): Promise<void> {
    await this.form.setAttribute('nwind_quantity', newQuantity);
    await this.form.save();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get order details from form
   */
  async getOrderDetails(): Promise<{
    orderNumber: string;
    customer: string;
    quantity: number;
  }> {
    const orderNumber = await this.form.getAttribute('nwind_ordernumber');
    const customer = await this.form.getAttribute('nwind_customer');
    const quantity = await this.form.getAttribute('nwind_quantity');

    return {
      orderNumber: orderNumber as string,
      customer: customer as string,
      quantity: quantity as number,
    };
  }
}

// Usage in tests
test('manage orders with custom page', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);
  await appProvider.launch({
    app: 'Northwind Orders',
    type: AppType.ModelDriven,
    mode: AppLaunchMode.Play,
    skipMakerPortal: true,
    directUrl: process.env.MODEL_DRIVEN_APP_URL!,
  });

  const northwindApp = new NorthwindModelDrivenAppPage(page);

  // Use custom methods
  await northwindApp.createOrder({
    orderNumber: generateUniqueOrderNumber(),
    customer: 'Contoso Ltd',
    product: 'Widget A',
    quantity: 10,
  });

  await northwindApp.openFirstOrderRecord();
  await northwindApp.updateOrderQuantity(25);

  const details = await northwindApp.getOrderDetails();
  expect(details.quantity).toBe(25);
});
```

## Test Fixtures

Create reusable test fixtures for common setup:

### Canvas App Fixture

```typescript
import { test as base, Page, BrowserContext } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  CanvasAppPage,
} from 'power-platform-playwright-toolkit';

type CanvasAppFixtures = {
  canvasApp: CanvasAppPage;
  appProvider: AppProvider;
};

export const test = base.extend<CanvasAppFixtures>({
  appProvider: async ({ page, context }, use) => {
    const appProvider = new AppProvider(page, context);
    await use(appProvider);
  },

  canvasApp: async ({ page, context, appProvider }, use) => {
    await appProvider.launch({
      app: 'My Canvas App',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: process.env.CANVAS_APP_URL!,
    });

    const canvasApp = appProvider.getCanvasAppPage();
    await use(canvasApp);
  },
});

// Usage - no setup needed in each test!
test('create order', async ({ canvasApp }) => {
  const orderInput = canvasApp.getControl({ dataTestId: 'txtOrderNumber' });
  await orderInput.fill('ORD-12345');
  // ... rest of test
});

test('search order', async ({ canvasApp }) => {
  const searchInput = canvasApp.getControl({ dataTestId: 'txtSearch' });
  await searchInput.fill('ORD-');
  // ... rest of test
});
```

### Model-Driven App Fixture

```typescript
import { test as base } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

type ModelDrivenAppFixtures = {
  modelDrivenApp: ModelDrivenAppPage;
};

export const test = base.extend<ModelDrivenAppFixtures>({
  modelDrivenApp: async ({ page, context }, use) => {
    const appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'My Model-Driven App',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: process.env.MODEL_DRIVEN_APP_URL!,
    });

    const modelDrivenApp = appProvider.getModelDrivenAppPage();
    await use(modelDrivenApp);
  },
});

// Usage
test('work with grid', async ({ modelDrivenApp }) => {
  await modelDrivenApp.grid.waitForGridLoad();
  const rowCount = await modelDrivenApp.grid.getRowCount();
  expect(rowCount).toBeGreaterThan(0);
});

test('work with form', async ({ modelDrivenApp }) => {
  await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
  const name = await modelDrivenApp.form.getAttribute('name');
  expect(name).toBeTruthy();
});
```

## Test Data Management

### Test Data Factory

```typescript
import {
  generateUniqueOrderNumber,
  generateUniqueTestId,
  generateRandomAlphaNumeric,
} from 'power-platform-playwright-toolkit';

export class TestDataFactory {
  /**
   * Generate complete order data
   */
  static createOrderData() {
    return {
      orderNumber: generateUniqueOrderNumber(),
      customer: `Customer-${generateRandomAlphaNumeric(6)}`,
      product: 'Widget A',
      quantity: Math.floor(Math.random() * 100) + 1,
      reference: generateUniqueTestId('REF'),
    };
  }

  /**
   * Generate customer data
   */
  static createCustomerData() {
    const id = generateRandomAlphaNumeric(6);
    return {
      name: `Test Customer ${id}`,
      email: `customer-${id}@example.com`,
      phone: `555-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`,
    };
  }

  /**
   * Generate product data
   */
  static createProductData() {
    return {
      name: `Product-${generateRandomAlphaNumeric(6)}`,
      sku: `SKU-${generateRandomAlphaNumeric(8)}`,
      price: (Math.random() * 1000).toFixed(2),
    };
  }
}

// Usage in tests
test('create order with test data', async ({ canvasApp }) => {
  const orderData = TestDataFactory.createOrderData();

  const orderNumberInput = canvasApp.getControl({ dataTestId: 'txtOrderNumber' });
  await orderNumberInput.fill(orderData.orderNumber);

  const customerInput = canvasApp.getControl({ dataTestId: 'txtCustomer' });
  await customerInput.fill(orderData.customer);

  // ... rest of test
});
```

### Data-Driven Tests

```typescript
const testCases = [
  { customer: 'Contoso Ltd', product: 'Widget A', quantity: 10 },
  { customer: 'Fabrikam Inc', product: 'Widget B', quantity: 25 },
  { customer: 'Adventure Works', product: 'Widget C', quantity: 50 },
];

for (const testCase of testCases) {
  test(`create order for ${testCase.customer}`, async ({ canvasApp }) => {
    const orderNumber = generateUniqueOrderNumber();

    // Fill form
    await canvasApp.getControl({ dataTestId: 'txtOrderNumber' }).fill(orderNumber);
    await canvasApp.getControl({ dataTestId: 'txtCustomer' }).fill(testCase.customer);
    await canvasApp.getControl({ dataTestId: 'txtProduct' }).fill(testCase.product);
    await canvasApp.getControl({ dataTestId: 'txtQuantity' }).fill(testCase.quantity.toString());

    // Submit
    await canvasApp.getControl({ dataTestId: 'btnSubmit' }).click();

    // Verify
    const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
    await expect(statusLabel).toContainText('Success');
  });
}
```

## Performance Optimization

### 1. Use Direct URL Launch

Always use `skipMakerPortal: true` for fastest execution:

```typescript
await appProvider.launch({
  app: 'My App',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true, // Skip slow maker portal navigation
  directUrl: process.env.APP_URL, // Direct URL is fastest
});
```

### 2. Parallelize Tests

Run tests in parallel for faster execution:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Parallel workers
  fullyParallel: true, // Run tests in parallel
});
```

### 3. Optimize Waits

Use smart waits instead of fixed timeouts:

```typescript
// ❌ Bad: Fixed timeout
await page.waitForTimeout(5000);

// ✅ Good: Wait for specific condition
await modelDrivenApp.grid.waitForGridLoad();

// ✅ Good: Wait for element
const button = canvasApp.getControl({ dataTestId: 'btnSubmit' });
await button.waitFor({ state: 'visible', timeout: 10000 });
```

### 4. Reuse Authentication

Reuse storage state instead of logging in every time:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    storageState: '.auth/storageState.json', // Reuse auth
  },
});
```

### 5. Use Test Fixtures

Reduce setup code duplication with fixtures:

```typescript
// Define fixture once
export const test = base.extend<{ canvasApp: CanvasAppPage }>({
  canvasApp: async ({ page, context }, use) => {
    // Setup
    const appProvider = new AppProvider(page, context);
    await appProvider.launch({...});
    const canvasApp = appProvider.getCanvasAppPage();

    await use(canvasApp);

    // Teardown (if needed)
  },
});

// Use in many tests without setup code
test('test 1', async ({ canvasApp }) => { /* ... */ });
test('test 2', async ({ canvasApp }) => { /* ... */ });
```

## Error Handling and Retries

### Retry Failed Tests

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // Retry on CI
});
```

### Conditional Retries

```typescript
test('flaky test', async ({ canvasApp }, testInfo) => {
  // Retry up to 3 times for this specific test
  testInfo.setTimeout(testInfo.timeout * 3);

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Test code
      await canvasApp.getControl({ dataTestId: 'btnSubmit' }).click();
      break; // Success, exit loop
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        throw error; // Give up after max attempts
      }
      console.log(`Attempt ${attempts} failed, retrying...`);
      await canvasApp.page.reload();
    }
  }
});
```

### Graceful Error Handling

```typescript
test('handle missing controls gracefully', async ({ canvasApp }) => {
  const optionalButton = canvasApp.getControl({ dataTestId: 'btnOptional' });

  // Check if control exists before interacting
  const isVisible = await optionalButton.isVisible().catch(() => false);

  if (isVisible) {
    await optionalButton.click();
  } else {
    console.log('Optional button not found, skipping');
  }
});
```

## Debugging Techniques

### Visual Debugging

```typescript
test('debug with screenshots and trace', async ({ canvasApp, page }) => {
  // Take screenshot before action
  await page.screenshot({ path: 'before-submit.png' });

  await canvasApp.getControl({ dataTestId: 'btnSubmit' }).click();

  // Take screenshot after action
  await page.screenshot({ path: 'after-submit.png' });

  // Add pause for manual inspection
  await page.pause();
});
```

### Verbose Logging

```typescript
test('debug with logging', async ({ canvasApp }) => {
  console.log('🚀 Starting test...');

  const orderNumber = generateUniqueOrderNumber();
  console.log('📝 Generated order number:', orderNumber);

  const orderInput = canvasApp.getControl({ dataTestId: 'txtOrderNumber' });
  await orderInput.fill(orderNumber);
  console.log('✅ Filled order number');

  const submitButton = canvasApp.getControl({ dataTestId: 'btnSubmit' });
  await submitButton.click();
  console.log('✅ Clicked submit button');

  const statusLabel = canvasApp.getControl({ dataTestId: 'lblStatus' });
  const status = await statusLabel.textContent();
  console.log('📊 Status:', status);
});
```

### Trace Recording

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry', // Record trace on retry
    video: 'retain-on-failure', // Keep video on failure
    screenshot: 'only-on-failure', // Screenshot on failure
  },
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

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
          retention-days: 30

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: test-results/
          retention-days: 7
```

## Best Practices Summary

### 1. Architecture

- ✅ Always use AppProvider as entry point
- ✅ Use direct URL launch with `skipMakerPortal: true`
- ✅ Extend page objects for app-specific logic
- ✅ Use test fixtures for common setup

### 2. Test Organization

- ✅ One test file per app or feature
- ✅ Use descriptive test names
- ✅ Group related tests with `test.describe()`
- ✅ Keep tests independent

### 3. Data Management

- ✅ Use test data factories
- ✅ Generate unique test data
- ✅ Clean up test data after tests
- ✅ Use data-driven tests for similar scenarios

### 4. Performance

- ✅ Run tests in parallel
- ✅ Reuse authentication state
- ✅ Use smart waits instead of fixed timeouts
- ✅ Optimize direct URL launch

### 5. Reliability

- ✅ Add retries for flaky tests
- ✅ Handle missing controls gracefully
- ✅ Use proper waits for async operations
- ✅ Take screenshots on failure

## Next Steps

- [Getting Started](./01-getting-started.md) - Start from basics
- [Canvas Apps](./02-canvas-apps.md) - Canvas app testing patterns
- [Model-Driven Apps](./03-model-driven-apps.md) - Model-driven app patterns with GridComponent and FormComponent
- [Authentication](./04-authentication.md) - Authentication setup
- [FormContext API](./FORMCONTEXT.md) - Advanced form operations
