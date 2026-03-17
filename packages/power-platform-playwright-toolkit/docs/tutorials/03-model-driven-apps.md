# Testing Model-Driven Apps

This guide covers testing Model-Driven Apps (Dynamics 365) in detail, including grid operations, form interactions, and FormContext API usage.

## Model-Driven App Architecture

Model-Driven Apps are built on Microsoft Dataverse and follow a structured approach with:

- **Entities (Tables)**: Data structures like Accounts, Contacts, Orders
- **Forms**: UI for viewing and editing records
- **Views (Grids)**: Lists of records with columns
- **Business Logic**: Validation, calculations, and workflows

The toolkit provides **GridComponent** and **FormComponent** for reusable UI interactions.

## Setup and Launch

### Basic Model-Driven App Test Structure

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
    // Create AppProvider instance
    appProvider = new AppProvider(page, context);

    // Launch Model-Driven App with direct URL (fastest approach)
    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: MODEL_APP_URL,
    });

    // Get ModelDrivenAppPage instance
    modelDrivenApp = appProvider.getModelDrivenAppPage();
  });

  test('should interact with grid and form', async () => {
    // Your test code here
  });
});
```

## GridComponent - Working with Grids/Views

The **GridComponent** provides comprehensive grid operations accessible via `modelDrivenApp.grid`.

### Opening Records from Grid

```typescript
// Open record by row number (0-based index)
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });

// Open record by searching for column value
await modelDrivenApp.grid.openRecord({
  columnValue: 'ORD-12345',
  columnName: 'Order Number',
});
```

### Getting Grid Data

```typescript
// Get cell value
const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
const customerName = await modelDrivenApp.grid.getCellValue(0, 'Customer');
console.log(`Order: ${orderNumber}, Customer: ${customerName}`);

// Get row count
const rowCount = await modelDrivenApp.grid.getRowCount();
expect(rowCount).toBeGreaterThan(0);

// Check if grid is empty
const isEmpty = await modelDrivenApp.grid.isGridEmpty();
if (isEmpty) {
  console.log('No records found');
}
```

### Selecting Rows

```typescript
// Select single row
await modelDrivenApp.grid.selectRow(0);

// Select multiple rows
await modelDrivenApp.grid.selectRows([0, 1, 2]);
```

### Sorting and Waiting

```typescript
// Sort by column
await modelDrivenApp.grid.sortByColumn('Order Date', 'desc');
await modelDrivenApp.grid.sortByColumn('Order Number', 'asc');

// Wait for grid to fully load
await modelDrivenApp.grid.waitForGridLoad();
```

### Convenience Methods

```typescript
// Alternative: Use convenience methods on ModelDrivenAppPage
await modelDrivenApp.openRecordFromGrid({ rowNumber: 0 });
await modelDrivenApp.selectGridRow(0);
const value = await modelDrivenApp.getGridCellValue(0, 'Order Number');
```

## FormComponent - Working with Forms

The **FormComponent** provides comprehensive form operations accessible via `modelDrivenApp.form`.

### Getting and Setting Attributes

```typescript
// Get attribute value
const orderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
const customer = await modelDrivenApp.form.getAttribute('nwind_customer');
console.log(`Order: ${orderNumber}, Customer: ${customer}`);

// Set attribute value
await modelDrivenApp.form.setAttribute('nwind_ordernumber', 'ORD-12345');
await modelDrivenApp.form.setAttribute('nwind_quantity', 10);
await modelDrivenApp.form.setAttribute('nwind_customer', 'Contoso Ltd');
```

### Form Operations

```typescript
// Save form
await modelDrivenApp.form.save();

// Save and close
await modelDrivenApp.form.save({ saveMode: 'saveandclose' });

// Check if form has unsaved changes
const isDirty = await modelDrivenApp.form.isDirty();
if (isDirty) {
  console.log('Form has unsaved changes');
  await modelDrivenApp.form.save();
}

// Check if form is valid
const isValid = await modelDrivenApp.form.isValid();
if (!isValid) {
  console.log('Form has validation errors');
}
```

### Form Navigation

```typescript
// Navigate to tab
await modelDrivenApp.form.navigateToTab({ tabName: 'General' });
await modelDrivenApp.form.navigateToTab({ tabIndex: 0 });

// Navigate to section
await modelDrivenApp.form.navigateToSection({
  tabName: 'General',
  sectionName: 'Order Details',
});
```

### Field Control Operations

```typescript
// Set field visibility
await modelDrivenApp.form.setFieldVisibility('nwind_internalnotess', false);
await modelDrivenApp.form.setFieldVisibility('nwind_internalnotess', true);

// Set field disabled state
await modelDrivenApp.form.setFieldDisabled('nwind_ordernumber', true);
await modelDrivenApp.form.setFieldDisabled('nwind_customer', false);

// Set field required level
await modelDrivenApp.form.setFieldRequiredLevel('nwind_customer', 'required');
await modelDrivenApp.form.setFieldRequiredLevel('nwind_notes', 'recommended');
await modelDrivenApp.form.setFieldRequiredLevel('nwind_discount', 'none');
```

### Form Notifications

```typescript
// Show notification
await modelDrivenApp.form.showNotification(
  'Order saved successfully',
  'success',
  'save-notification'
);

await modelDrivenApp.form.showNotification(
  'Please fill required fields',
  'error',
  'validation-error'
);

// Clear notification
await modelDrivenApp.form.clearNotification('save-notification');
```

### Tab and Section Visibility

```typescript
// Set tab visibility
await modelDrivenApp.form.setTabVisibility('GeneralTab', false);
await modelDrivenApp.form.setTabVisibility('NotesTab', true);

// Set section visibility
await modelDrivenApp.form.setSectionVisibility({
  tabName: 'General',
  sectionName: 'Address',
  visible: false,
});
```

### Refreshing the Form

```typescript
// Refresh form (reload data)
await modelDrivenApp.form.refresh();
await modelDrivenApp.form.refresh({ save: true }); // Save before refresh
```

### FormContext API

```typescript
// Get full FormContext data
const formContext = await modelDrivenApp.form.getContext();
console.log('Entity Name:', formContext.entityName);
console.log('Entity ID:', formContext.entityId);
console.log('Form Type:', formContext.formType);
console.log('Is Dirty:', formContext.isDirty);

// Execute custom FormContext code
const formType = await modelDrivenApp.form.execute((Xrm) => {
  return Xrm.Page.ui.getFormType();
});
console.log('Form Type:', formType); // 1 = Create, 2 = Update
```

## Complete CRUD Test Example

### Northwind Orders Model-Driven App

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
  generateUniqueOrderNumber,
} from 'power-platform-playwright-toolkit';

const MODEL_APP_URL = process.env.MODEL_DRIVEN_APP_URL!;

test.describe('Northwind Orders CRUD Tests', () => {
  let appProvider: AppProvider;
  let modelDrivenApp: ModelDrivenAppPage;

  test.beforeEach(async ({ page, context }) => {
    appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: MODEL_APP_URL,
    });

    modelDrivenApp = appProvider.getModelDrivenAppPage();
  });

  test('should create a new order', async ({ page }) => {
    const orderNumber = generateUniqueOrderNumber();

    // Wait for grid to load
    await modelDrivenApp.grid.waitForGridLoad();

    // Click New button
    await page.getByRole('button', { name: 'New' }).click();
    await page.waitForTimeout(3000);

    // Fill form using FormComponent
    await modelDrivenApp.form.setAttribute('nwind_ordernumber', orderNumber);
    await modelDrivenApp.form.setAttribute('nwind_customer', 'Contoso Ltd');
    await modelDrivenApp.form.setAttribute('nwind_product', 'Widget A');
    await modelDrivenApp.form.setAttribute('nwind_quantity', 10);

    // Save the order
    await modelDrivenApp.form.save();
    await page.waitForTimeout(2000);

    // Verify the order was created
    const savedOrderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
    expect(savedOrderNumber).toBe(orderNumber);

    console.log(`✅ Order ${orderNumber} created successfully`);
  });

  test('should read order from grid', async ({ page }) => {
    // Wait for grid to load
    await modelDrivenApp.grid.waitForGridLoad();

    // Get data from first row
    const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
    const customer = await modelDrivenApp.grid.getCellValue(0, 'Customer');
    const quantity = await modelDrivenApp.grid.getCellValue(0, 'Quantity');

    console.log(`Order: ${orderNumber}, Customer: ${customer}, Quantity: ${quantity}`);

    // Verify we got valid data
    expect(orderNumber).toBeTruthy();
    expect(customer).toBeTruthy();

    console.log('✅ Read order data from grid');
  });

  test('should update existing order', async ({ page }) => {
    // Wait for grid and open first record
    await modelDrivenApp.grid.waitForGridLoad();
    await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
    await page.waitForTimeout(3000);

    // Get current values
    const originalQuantity = await modelDrivenApp.form.getAttribute('nwind_quantity');
    console.log('Original Quantity:', originalQuantity);

    // Update quantity
    const newQuantity = 25;
    await modelDrivenApp.form.setAttribute('nwind_quantity', newQuantity);

    // Check if form is dirty
    const isDirty = await modelDrivenApp.form.isDirty();
    expect(isDirty).toBe(true);

    // Save changes
    await modelDrivenApp.form.save();
    await page.waitForTimeout(2000);

    // Verify update
    const updatedQuantity = await modelDrivenApp.form.getAttribute('nwind_quantity');
    expect(updatedQuantity).toBe(newQuantity);

    console.log(`✅ Order quantity updated from ${originalQuantity} to ${newQuantity}`);
  });

  test('should delete order', async ({ page }) => {
    // Wait for grid
    await modelDrivenApp.grid.waitForGridLoad();

    // Get initial row count
    const initialRowCount = await modelDrivenApp.grid.getRowCount();
    console.log('Initial row count:', initialRowCount);

    // Select first row
    await modelDrivenApp.grid.selectRow(0);

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(1000);

    // Confirm deletion
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.waitForTimeout(3000);

    // Verify row count decreased
    await modelDrivenApp.grid.waitForGridLoad();
    const finalRowCount = await modelDrivenApp.grid.getRowCount();
    expect(finalRowCount).toBe(initialRowCount - 1);

    console.log(`✅ Order deleted. Row count: ${initialRowCount} → ${finalRowCount}`);
  });
});
```

## Advanced FormContext Usage

For complex form operations, use the low-level FormContext API:

```typescript
import {
  getFormContext,
  getEntityAttribute,
  setEntityAttribute,
  saveForm,
  isFormDirty,
  isFormValid,
  executeInFormContext,
} from 'power-platform-playwright-toolkit';

test('advanced form operations', async ({ page }) => {
  // ... launch app ...

  // Get full form context
  const context = await getFormContext(page);
  console.log('Entity:', context.entityName);
  console.log('Form Type:', context.formType);

  // Get/Set attributes directly
  const value = await getEntityAttribute(page, 'nwind_ordernumber');
  await setEntityAttribute(page, 'nwind_customer', 'New Customer');

  // Save form with options
  await saveForm(page, { saveMode: 'saveandnew' });

  // Check form state
  const dirty = await isFormDirty(page);
  const valid = await isFormValid(page);

  // Execute custom Xrm code
  const result = await executeInFormContext(page, (Xrm) => {
    // Access full Xrm.Page API
    const formType = Xrm.Page.ui.getFormType();
    const entityName = Xrm.Page.data.entity.getEntityName();
    return { formType, entityName };
  });
});
```

## Best Practices

### 1. Always Use AppProvider

**NEVER** directly instantiate ModelDrivenAppPage:

✅ **CORRECT:**

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({...});
const modelDrivenApp = appProvider.getModelDrivenAppPage();
```

❌ **INCORRECT:**

```typescript
// NEVER do this
const modelDrivenApp = new ModelDrivenAppPage(page);
```

### 2. Use Direct URL Launch

For fastest test execution:

```typescript
await appProvider.launch({
  app: 'My App',
  type: AppType.ModelDriven,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true, // Skip maker portal navigation
  directUrl: process.env.MODEL_DRIVEN_APP_URL,
});
```

### 3. Wait for Grid and Form Loading

```typescript
// Wait for grid before interacting
await modelDrivenApp.grid.waitForGridLoad();

// Wait for form before getting attributes
await page.waitForTimeout(3000); // After opening record
const value = await modelDrivenApp.form.getAttribute('fieldname');
```

### 4. Use GridComponent for All Grid Operations

```typescript
// Use GridComponent methods
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
const value = await modelDrivenApp.grid.getCellValue(0, 'Column Name');

// Or use convenience methods
await modelDrivenApp.openRecordFromGrid({ rowNumber: 0 });
```

### 5. Use FormComponent for All Form Operations

```typescript
// Use FormComponent for consistency
await modelDrivenApp.form.setAttribute('fieldname', 'value');
await modelDrivenApp.form.save();
const isDirty = await modelDrivenApp.form.isDirty();
```

### 6. Handle Form State

```typescript
// Check if form has unsaved changes
const isDirty = await modelDrivenApp.form.isDirty();
if (isDirty) {
  await modelDrivenApp.form.save();
}

// Check if form is valid before saving
const isValid = await modelDrivenApp.form.isValid();
if (isValid) {
  await modelDrivenApp.form.save();
} else {
  console.log('Form has validation errors');
}
```

### 7. Use Test Data Utilities

```typescript
import { generateUniqueOrderNumber } from 'power-platform-playwright-toolkit';

const orderNumber = generateUniqueOrderNumber(); // ORD-12345
await modelDrivenApp.form.setAttribute('nwind_ordernumber', orderNumber);
```

## Debugging Tips

### Taking Screenshots

```typescript
// Take screenshot at specific point
await page.screenshot({ path: 'grid-view.png' });
await page.screenshot({ path: 'form-view.png' });

// Automatic failure screenshots (Playwright config)
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    await page.screenshot({ path: `failure-${testInfo.title}.png` });
  }
});
```

### Logging Form State

```typescript
// Log form context
const context = await modelDrivenApp.form.getContext();
console.log('Form Context:', JSON.stringify(context, null, 2));

// Log grid data
const rowCount = await modelDrivenApp.grid.getRowCount();
console.log('Grid row count:', rowCount);

for (let i = 0; i < Math.min(rowCount, 3); i++) {
  const orderNumber = await modelDrivenApp.grid.getCellValue(i, 'Order Number');
  console.log(`Row ${i}: ${orderNumber}`);
}
```

### Using Playwright Inspector

```bash
# Run with debug mode
npx playwright test --debug

# Add breakpoint in code
await page.pause();
```

## Troubleshooting

### Grid Not Loading

If grid doesn't load:

- Wait for grid: `await modelDrivenApp.grid.waitForGridLoad()`
- Increase timeout: `{ timeout: 60000 }`
- Check if authentication expired
- Verify direct URL is correct

### Form Fields Not Found

If form fields aren't found:

- Verify field schema name (e.g., `nwind_ordernumber` not `Order Number`)
- Wait after opening record: `await page.waitForTimeout(3000)`
- Check if field is visible on the form
- Use FormContext API: `await modelDrivenApp.form.getAttribute('fieldname')`

### Save Operation Fails

If save fails:

- Check form validation: `await modelDrivenApp.form.isValid()`
- Fill required fields
- Check for business rule errors
- Wait after save: `await page.waitForTimeout(2000)`

### Column Names Don't Match

If getCellValue fails:

- Column names must match grid header text exactly (case-sensitive)
- Use browser DevTools to inspect column headers
- Check `aria-label` attribute on `[role="columnheader"]`

## Next Steps

- [Authentication](./04-authentication.md) - Setting up authentication with playwright-ms-auth
- [Advanced Usage](./05-advanced-usage.md) - Advanced patterns and techniques
- [FormContext API Tutorial](./FORMCONTEXT.md) - Deep dive into FormContext API
