# Model-Driven App Components - Complete Guide

This guide provides comprehensive documentation for all Model-Driven App components available in the Power Platform Playwright Toolkit.

## Table of Contents

1. [Overview](#overview)
2. [GridComponent](#gridcomponent)
3. [FormComponent](#formcomponent)
4. [CommandingComponent](#commandingcomponent)
5. [FormContext API](#formcontext-api)
6. [Types and Interfaces](#types-and-interfaces)
7. [Complete Examples](#complete-examples)

---

## Overview

The toolkit provides three main components for Model-Driven App testing:

| Component               | Purpose                              | Access                      |
| ----------------------- | ------------------------------------ | --------------------------- |
| **GridComponent**       | Grid/List view operations            | `modelDrivenApp.grid`       |
| **FormComponent**       | Form operations and field management | `modelDrivenApp.form`       |
| **CommandingComponent** | Command bar operations               | `modelDrivenApp.commanding` |

All components are **lazy-initialized** for optimal performance and accessed via properties on `ModelDrivenAppPage`.

### Component Architecture

```
ModelDrivenAppPage
├── grid: GridComponent              (List/Grid operations)
├── form: FormComponent              (Form field operations)
└── commanding: CommandingComponent  (Command bar operations)
```

---

## GridComponent

**Purpose**: Handle all grid/list view operations.

**Access**: `modelDrivenApp.grid`

**File**: `src/components/model-driven/grid.component.ts`

### Methods

#### Opening Records

##### `openRecord(options: GridRecordOptions): Promise<void>`

Open a record from the grid.

**Options**:

```typescript
interface GridRecordOptions {
  rowNumber?: number; // Open record by row index (0-based)
  columnValue?: string; // Open record by searching column value
  columnName?: string; // Column name to search (required with columnValue)
}
```

**Examples**:

```typescript
// Open first record
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });

// Open record by column value
await modelDrivenApp.grid.openRecord({
  columnValue: 'ORD-12345',
  columnName: 'Order Number',
});

// Open third record
await modelDrivenApp.grid.openRecord({ rowNumber: 2 });
```

**Implementation Details**:

- Uses multiple fallback strategies: link click, double-click
- Handles various grid configurations
- Waits for row to be visible before clicking

---

#### Getting Grid Data

##### `getCellValue(row: number, column: string): Promise<string>`

Get the value of a specific cell.

**Parameters**:

- `row` - Row index (0-based)
- `column` - Column name (matches column header text)

**Returns**: Cell text content as string

**Examples**:

```typescript
// Get order number from first row
const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
console.log('Order Number:', orderNumber);

// Get customer name from second row
const customer = await modelDrivenApp.grid.getCellValue(1, 'Customer');
console.log('Customer:', customer);

// Get multiple values
for (let i = 0; i < 5; i++) {
  const orderNum = await modelDrivenApp.grid.getCellValue(i, 'Order Number');
  const status = await modelDrivenApp.grid.getCellValue(i, 'Status');
  console.log(`Row ${i}: ${orderNum} - ${status}`);
}
```

**Important**: Column names must match the column header text exactly (case-sensitive).

---

##### `getRowCount(): Promise<number>`

Get the total number of rows in the grid (excluding header).

**Returns**: Number of data rows

**Examples**:

```typescript
const rowCount = await modelDrivenApp.grid.getRowCount();
console.log(`Grid has ${rowCount} rows`);

// Iterate through all rows
for (let i = 0; i < rowCount; i++) {
  const value = await modelDrivenApp.grid.getCellValue(i, 'Order Number');
  console.log(`Row ${i}: ${value}`);
}

// Check if grid has data
if (rowCount === 0) {
  console.log('Grid is empty');
} else {
  console.log(`Grid has ${rowCount} records`);
}
```

---

##### `isGridEmpty(): Promise<boolean>`

Check if the grid has no data rows.

**Returns**: `true` if grid is empty, `false` otherwise

**Examples**:

```typescript
const isEmpty = await modelDrivenApp.grid.isGridEmpty();
if (isEmpty) {
  console.log('No records found');
} else {
  console.log('Grid has records');
}
```

---

#### Selecting Rows

##### `selectRow(rowNumber: number): Promise<void>`

Select a single row by index.

**Parameters**:

- `rowNumber` - Row index (0-based)

**Examples**:

```typescript
// Select first row
await modelDrivenApp.grid.selectRow(0);

// Select third row
await modelDrivenApp.grid.selectRow(2);
```

**Implementation Details**:

- Tries checkbox selection first
- Falls back to clicking row if no checkbox

---

##### `selectRows(rowNumbers: number[]): Promise<void>`

Select multiple rows.

**Parameters**:

- `rowNumbers` - Array of row indices to select

**Examples**:

```typescript
// Select first three rows
await modelDrivenApp.grid.selectRows([0, 1, 2]);

// Select specific rows
await modelDrivenApp.grid.selectRows([0, 3, 5, 7]);
```

---

#### Sorting

##### `sortByColumn(columnName: string, direction?: 'asc' | 'desc'): Promise<void>`

Sort the grid by a column.

**Parameters**:

- `columnName` - Column name to sort by
- `direction` - Sort direction ('asc' or 'desc'), default: 'asc'

**Examples**:

```typescript
// Sort by Order Number ascending
await modelDrivenApp.grid.sortByColumn('Order Number', 'asc');

// Sort by Order Date descending
await modelDrivenApp.grid.sortByColumn('Order Date', 'desc');

// Sort by Customer name
await modelDrivenApp.grid.sortByColumn('Customer');
```

---

#### Waiting

##### `waitForGridLoad(): Promise<void>`

Wait for the grid to fully load.

**Examples**:

```typescript
// Wait for grid after navigation
await modelDrivenApp.grid.waitForGridLoad();

// Wait for grid after refresh
await modelDrivenApp.commanding.refresh();
await modelDrivenApp.grid.waitForGridLoad();
```

**Implementation Details**:

- Waits for grid container to be visible
- Waits for loading indicator to disappear
- Essential before interacting with grid

---

#### Low-Level Access

##### `getGrid(): Promise<Locator>`

Get the grid container locator for custom operations.

**Returns**: Playwright Locator for grid container

**Examples**:

```typescript
const grid = await modelDrivenApp.grid.getGrid();
const rows = await grid.locator('[role="row"]').all();
console.log(`Found ${rows.length} rows`);
```

---

### GridComponent Complete Example

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

test('complete grid operations', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);

  await appProvider.launch({
    app: 'Orders App',
    type: AppType.ModelDriven,
    mode: AppLaunchMode.Play,
    skipMakerPortal: true,
    directUrl: process.env.MODEL_DRIVEN_APP_URL,
  });

  const modelDrivenApp = appProvider.getModelDrivenAppPage();

  // Wait for grid to load
  await modelDrivenApp.grid.waitForGridLoad();

  // Get row count
  const rowCount = await modelDrivenApp.grid.getRowCount();
  console.log(`Grid has ${rowCount} rows`);

  // Get data from first row
  const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
  const customer = await modelDrivenApp.grid.getCellValue(0, 'Customer');
  console.log(`First order: ${orderNumber} - ${customer}`);

  // Sort by Order Date descending
  await modelDrivenApp.grid.sortByColumn('Order Date', 'desc');

  // Select multiple rows
  await modelDrivenApp.grid.selectRows([0, 1, 2]);

  // Open first record
  await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
});
```

---

## FormComponent

**Purpose**: Handle all form operations and field management.

**Access**: `modelDrivenApp.form`

**File**: `src/components/model-driven/form.component.ts`

### Methods

#### Getting/Setting Attributes

##### `getAttribute(attributeName: string): Promise<any>`

Get the value of a form field.

**Parameters**:

- `attributeName` - Schema name of the attribute (e.g., 'nwind_ordernumber')

**Returns**: Field value (type depends on field type)

**Examples**:

```typescript
// Get text field
const orderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
console.log('Order Number:', orderNumber);

// Get number field
const quantity = await modelDrivenApp.form.getAttribute('nwind_quantity');
console.log('Quantity:', quantity);

// Get lookup field
const customer = await modelDrivenApp.form.getAttribute('nwind_customer');
console.log('Customer:', customer);
```

---

##### `setAttribute(attributeName: string, value: any): Promise<void>`

Set the value of a form field.

**Parameters**:

- `attributeName` - Schema name of the attribute
- `value` - Value to set (type depends on field type)

**Examples**:

```typescript
// Set text field
await modelDrivenApp.form.setAttribute('nwind_ordernumber', 'ORD-12345');

// Set number field
await modelDrivenApp.form.setAttribute('nwind_quantity', 10);

// Set text area
await modelDrivenApp.form.setAttribute('nwind_notes', 'Order notes here');

// Set multiple fields
await modelDrivenApp.form.setAttribute('nwind_customer', 'Contoso Ltd');
await modelDrivenApp.form.setAttribute('nwind_product', 'Widget A');
await modelDrivenApp.form.setAttribute('nwind_quantity', 25);
```

---

#### Form Operations

##### `save(options?: FormSaveOptions): Promise<void>`

Save the form.

**Options**:

```typescript
interface FormSaveOptions {
  saveMode?: 'save' | 'saveandclose' | 'saveandnew';
}
```

**Examples**:

```typescript
// Simple save
await modelDrivenApp.form.save();

// Save and close
await modelDrivenApp.form.save({ saveMode: 'saveandclose' });

// Save and create new
await modelDrivenApp.form.save({ saveMode: 'saveandnew' });
```

---

##### `isDirty(): Promise<boolean>`

Check if the form has unsaved changes.

**Returns**: `true` if form has unsaved changes, `false` otherwise

**Examples**:

```typescript
// Check before saving
const isDirty = await modelDrivenApp.form.isDirty();
if (isDirty) {
  console.log('Form has unsaved changes');
  await modelDrivenApp.form.save();
} else {
  console.log('No changes to save');
}

// Verify changes were made
await modelDrivenApp.form.setAttribute('name', 'Test');
const isDirtyAfter = await modelDrivenApp.form.isDirty();
expect(isDirtyAfter).toBe(true);
```

---

##### `isValid(): Promise<boolean>`

Check if the form is valid (all required fields filled, no validation errors).

**Returns**: `true` if form is valid, `false` otherwise

**Examples**:

```typescript
// Validate before saving
const isValid = await modelDrivenApp.form.isValid();
if (isValid) {
  await modelDrivenApp.form.save();
} else {
  console.log('Form has validation errors');
}

// Fill required fields and validate
await modelDrivenApp.form.setAttribute('name', 'Test Account');
const isValidNow = await modelDrivenApp.form.isValid();
expect(isValidNow).toBe(true);
```

---

#### Form Navigation

##### `navigateToTab(options: FormTabOptions): Promise<void>`

Navigate to a specific tab on the form.

**Options**:

```typescript
interface FormTabOptions {
  tabName?: string; // Tab name (e.g., 'General', 'Details')
  tabIndex?: number; // Tab index (0-based)
}
```

**Examples**:

```typescript
// Navigate by tab name
await modelDrivenApp.form.navigateToTab({ tabName: 'General' });
await modelDrivenApp.form.navigateToTab({ tabName: 'Details' });

// Navigate by index
await modelDrivenApp.form.navigateToTab({ tabIndex: 0 });
await modelDrivenApp.form.navigateToTab({ tabIndex: 1 });
```

---

##### `navigateToSection(options: FormSectionOptions): Promise<void>`

Navigate to a specific section within a tab.

**Options**:

```typescript
interface FormSectionOptions {
  tabName: string;
  sectionName: string;
}
```

**Examples**:

```typescript
// Navigate to section
await modelDrivenApp.form.navigateToSection({
  tabName: 'General',
  sectionName: 'Order Details',
});

await modelDrivenApp.form.navigateToSection({
  tabName: 'Details',
  sectionName: 'Address Information',
});
```

---

#### Field Control Operations

##### `setFieldVisibility(attributeName: string, visible: boolean): Promise<void>`

Show or hide a field.

**Examples**:

```typescript
// Hide field
await modelDrivenApp.form.setFieldVisibility('nwind_internalnotes', false);

// Show field
await modelDrivenApp.form.setFieldVisibility('nwind_internalnotes', true);

// Conditional visibility
const isAdmin = true;
await modelDrivenApp.form.setFieldVisibility('nwind_adminfield', isAdmin);
```

---

##### `setFieldDisabled(attributeName: string, disabled: boolean): Promise<void>`

Enable or disable a field.

**Examples**:

```typescript
// Disable field (read-only)
await modelDrivenApp.form.setFieldDisabled('nwind_ordernumber', true);

// Enable field (editable)
await modelDrivenApp.form.setFieldDisabled('nwind_customer', false);

// Lock field after initial save
const formType = await modelDrivenApp.form.execute((Xrm) => {
  return Xrm.Page.ui.getFormType();
});
if (formType === 2) {
  // Update form
  await modelDrivenApp.form.setFieldDisabled('nwind_ordernumber', true);
}
```

---

##### `setFieldRequiredLevel(attributeName: string, level: string): Promise<void>`

Set the required level for a field.

**Parameters**:

- `attributeName` - Field schema name
- `level` - Required level: 'none', 'required', 'recommended'

**Examples**:

```typescript
// Make field required
await modelDrivenApp.form.setFieldRequiredLevel('nwind_customer', 'required');

// Make field recommended
await modelDrivenApp.form.setFieldRequiredLevel('nwind_notes', 'recommended');

// Make field optional
await modelDrivenApp.form.setFieldRequiredLevel('nwind_discount', 'none');
```

---

#### Form Notifications

##### `showNotification(message: string, level: string, uniqueId: string): Promise<void>`

Show a notification on the form.

**Parameters**:

- `message` - Notification message
- `level` - Notification level: 'success', 'error', 'warning', 'info'
- `uniqueId` - Unique identifier for the notification

**Examples**:

```typescript
// Success notification
await modelDrivenApp.form.showNotification(
  'Order saved successfully',
  'success',
  'save-notification'
);

// Error notification
await modelDrivenApp.form.showNotification(
  'Please fill required fields',
  'error',
  'validation-error'
);

// Warning notification
await modelDrivenApp.form.showNotification('Order quantity is high', 'warning', 'qty-warning');

// Info notification
await modelDrivenApp.form.showNotification('Processing order...', 'info', 'processing-info');
```

---

##### `clearNotification(uniqueId: string): Promise<void>`

Clear a specific notification.

**Examples**:

```typescript
// Clear notification after delay
await modelDrivenApp.form.showNotification('Saving...', 'info', 'save-msg');
await page.waitForTimeout(2000);
await modelDrivenApp.form.clearNotification('save-msg');
```

---

#### Tab/Section Visibility

##### `setTabVisibility(tabName: string, visible: boolean): Promise<void>`

Show or hide a tab.

**Examples**:

```typescript
// Hide tab
await modelDrivenApp.form.setTabVisibility('AdministrationTab', false);

// Show tab
await modelDrivenApp.form.setTabVisibility('DetailsTab', true);
```

---

##### `setSectionVisibility(options: FormSectionOptions & { visible: boolean }): Promise<void>`

Show or hide a section.

**Examples**:

```typescript
// Hide section
await modelDrivenApp.form.setSectionVisibility({
  tabName: 'General',
  sectionName: 'Address',
  visible: false,
});

// Show section
await modelDrivenApp.form.setSectionVisibility({
  tabName: 'General',
  sectionName: 'Contact Information',
  visible: true,
});
```

---

#### Refreshing

##### `refresh(options?: { save: boolean }): Promise<void>`

Refresh the form (reload data from server).

**Examples**:

```typescript
// Refresh without saving
await modelDrivenApp.form.refresh();

// Save and refresh
await modelDrivenApp.form.refresh({ save: true });
```

---

#### FormContext Access

##### `getContext(): Promise<FormContextData>`

Get complete form context information.

**Returns**: Form context data object

**Examples**:

```typescript
const context = await modelDrivenApp.form.getContext();
console.log('Entity Name:', context.entityName);
console.log('Entity ID:', context.entityId);
console.log('Form Type:', context.formType);
console.log('Is Dirty:', context.isDirty);
```

---

##### `execute<T>(fn: (Xrm: any) => T): Promise<T>`

Execute custom code with access to Xrm.Page API.

**Examples**:

```typescript
// Get form type
const formType = await modelDrivenApp.form.execute((Xrm) => {
  return Xrm.Page.ui.getFormType();
});
// 1 = Create, 2 = Update, 3 = Read Only, 4 = Disabled

// Get entity name
const entityName = await modelDrivenApp.form.execute((Xrm) => {
  return Xrm.Page.data.entity.getEntityName();
});

// Get all attributes
const attributes = await modelDrivenApp.form.execute((Xrm) => {
  return Xrm.Page.data.entity.attributes.get().map((attr) => ({
    name: attr.getName(),
    value: attr.getValue(),
  }));
});

// Custom business logic
const result = await modelDrivenApp.form.execute((Xrm) => {
  const quantity = Xrm.Page.getAttribute('nwind_quantity').getValue();
  const price = Xrm.Page.getAttribute('nwind_price').getValue();
  return quantity * price;
});
```

---

### FormComponent Complete Example

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
  generateUniqueOrderNumber,
} from 'power-platform-playwright-toolkit';

test('complete form operations', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);

  await appProvider.launch({
    app: 'Orders App',
    type: AppType.ModelDriven,
    mode: AppLaunchMode.Play,
    skipMakerPortal: true,
    directUrl: process.env.MODEL_DRIVEN_APP_URL,
  });

  const modelDrivenApp = appProvider.getModelDrivenAppPage();

  // Wait for grid and click New
  await modelDrivenApp.grid.waitForGridLoad();
  await modelDrivenApp.commanding.clickNew();
  await page.waitForTimeout(3000);

  // Fill form
  const orderNumber = generateUniqueOrderNumber();
  await modelDrivenApp.form.setAttribute('nwind_ordernumber', orderNumber);
  await modelDrivenApp.form.setAttribute('nwind_customer', 'Contoso Ltd');
  await modelDrivenApp.form.setAttribute('nwind_quantity', 10);

  // Navigate to tab
  await modelDrivenApp.form.navigateToTab({ tabName: 'Details' });

  // Set field visibility
  await modelDrivenApp.form.setFieldVisibility('nwind_internalnotes', false);

  // Set required level
  await modelDrivenApp.form.setFieldRequiredLevel('nwind_customer', 'required');

  // Check if form is dirty and valid
  const isDirty = await modelDrivenApp.form.isDirty();
  const isValid = await modelDrivenApp.form.isValid();
  console.log(`Form dirty: ${isDirty}, valid: ${isValid}`);

  // Save form
  if (isValid) {
    await modelDrivenApp.form.save();

    // Show success notification
    await modelDrivenApp.form.showNotification(
      'Order created successfully',
      'success',
      'create-success'
    );
  }

  // Get saved value
  const savedOrderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
  expect(savedOrderNumber).toBe(orderNumber);
});
```

---

## CommandingComponent

**Purpose**: Handle command bar operations.

**Access**: `modelDrivenApp.commanding`

**File**: `src/components/model-driven/commanding.component.ts`

### Methods

#### Button Operations

##### `clickButton(buttonName: string, options?: CommandBarButtonOptions): Promise<void>`

Click any command bar button by name or aria-label.

**Options**:

```typescript
interface CommandBarButtonOptions {
  checkOverflow?: boolean; // Check overflow menu (default: true)
  timeout?: number; // Timeout in milliseconds (default: 30000)
  waitForEnabled?: boolean; // Wait for button to be enabled (default: true)
  context?: CommandBarContext; // Command bar context (default: Form)
}
```

**Examples**:

```typescript
// Click New button
await modelDrivenApp.commanding.clickButton('New');

// Click Delete with overflow check
await modelDrivenApp.commanding.clickButton('Delete', {
  checkOverflow: true,
});

// Click custom button
await modelDrivenApp.commanding.clickButton('My Custom Action');

// Click with custom timeout
await modelDrivenApp.commanding.clickButton('Assign', {
  timeout: 60000,
});
```

---

#### Convenience Methods

##### `clickNew(): Promise<void>`

Click the New button.

**Examples**:

```typescript
await modelDrivenApp.commanding.clickNew();
await page.waitForTimeout(3000); // Wait for form to load
```

---

##### `save(waitForSave?: boolean): Promise<void>`

Click the Save button.

**Parameters**:

- `waitForSave` - Wait for save operation to complete (default: true)

**Examples**:

```typescript
// Save and wait
await modelDrivenApp.commanding.save();

// Save without waiting
await modelDrivenApp.commanding.save(false);
```

---

##### `saveAndClose(): Promise<void>`

Click the Save & Close button.

**Examples**:

```typescript
await modelDrivenApp.commanding.saveAndClose();
```

---

##### `refresh(): Promise<void>`

Click the Refresh button and wait for page to reload.

**Examples**:

```typescript
await modelDrivenApp.commanding.refresh();
await modelDrivenApp.grid.waitForGridLoad();
```

---

##### `clickDelete(): Promise<void>`

Click the Delete button (does not confirm deletion).

**Examples**:

```typescript
// Click Delete button
await modelDrivenApp.commanding.clickDelete();

// Confirm deletion in dialog
await page.getByRole('button', { name: 'Delete', exact: true }).click();
```

---

##### `share(): Promise<void>`

Click the Share button.

**Examples**:

```typescript
await modelDrivenApp.commanding.share();
// Handle share dialog
```

---

##### `assign(): Promise<void>`

Click the Assign button.

**Examples**:

```typescript
await modelDrivenApp.commanding.assign();
// Handle assign dialog
```

---

##### `activate(): Promise<void>`

Click the Activate button.

**Examples**:

```typescript
await modelDrivenApp.commanding.activate();
```

---

##### `deactivate(): Promise<void>`

Click the Deactivate button.

**Examples**:

```typescript
await modelDrivenApp.commanding.deactivate();
```

---

#### Overflow Menu

##### `openOverflowMenu(context?: CommandBarContext): Promise<void>`

Open the overflow menu (... more commands).

**Examples**:

```typescript
// Open overflow menu
await modelDrivenApp.commanding.openOverflowMenu();

// Then click button in overflow
await page.getByRole('button', { name: 'Export to Excel' }).click();
```

---

#### Button State

##### `isButtonVisible(buttonName: string, options?: CommandBarButtonOptions): Promise<boolean>`

Check if a button is visible.

**Returns**: `true` if button is visible, `false` otherwise

**Examples**:

```typescript
const isDeleteVisible = await modelDrivenApp.commanding.isButtonVisible('Delete');
if (isDeleteVisible) {
  await modelDrivenApp.commanding.clickDelete();
}
```

---

##### `isButtonEnabled(buttonName: string, options?: CommandBarButtonOptions): Promise<boolean>`

Check if a button is enabled.

**Returns**: `true` if button is enabled, `false` otherwise

**Examples**:

```typescript
const isSaveEnabled = await modelDrivenApp.commanding.isButtonEnabled('Save');
if (isSaveEnabled) {
  await modelDrivenApp.commanding.save();
} else {
  console.log('Save button is disabled');
}
```

---

##### `waitForButton(buttonName: string, timeout?: number): Promise<void>`

Wait for a button to be visible.

**Examples**:

```typescript
// Wait for Save button
await modelDrivenApp.commanding.waitForButton('Save', 10000);
```

---

#### Custom Commands

##### `executeCommand(dataId: string): Promise<void>`

Execute a custom command by clicking button with specific data-id.

**Examples**:

```typescript
// Click custom button by data-id
await modelDrivenApp.commanding.executeCommand('mycompany.custombutton');
await modelDrivenApp.commanding.executeCommand('new_approveorder');
```

---

##### `getCommandBar(): Promise<Locator>`

Get the command bar locator for advanced operations.

**Returns**: Command bar container locator

**Examples**:

```typescript
const commandBar = await modelDrivenApp.commanding.getCommandBar();
const buttons = await commandBar.locator('button').all();
console.log(`Found ${buttons.length} buttons`);
```

---

### CommandingComponent Complete Example

```typescript
import { test } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

test('complete commanding operations', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);

  await appProvider.launch({
    app: 'Orders App',
    type: AppType.ModelDriven,
    mode: AppLaunchMode.Play,
    skipMakerPortal: true,
    directUrl: process.env.MODEL_DRIVEN_APP_URL,
  });

  const modelDrivenApp = appProvider.getModelDrivenAppPage();

  // Wait for grid
  await modelDrivenApp.grid.waitForGridLoad();

  // Create new record
  await modelDrivenApp.commanding.clickNew();
  await page.waitForTimeout(3000);

  // Fill form
  await modelDrivenApp.form.setAttribute('name', 'Test Account');

  // Check if Save is enabled
  const isSaveEnabled = await modelDrivenApp.commanding.isButtonEnabled('Save');
  if (isSaveEnabled) {
    await modelDrivenApp.commanding.save();
  }

  // Refresh the page
  await modelDrivenApp.commanding.refresh();
  await modelDrivenApp.grid.waitForGridLoad();

  // Check if button is visible
  const isDeleteVisible = await modelDrivenApp.commanding.isButtonVisible('Delete');
  console.log(`Delete button visible: ${isDeleteVisible}`);
});
```

---

## FormContext API

**Purpose**: Low-level access to Dynamics 365 Xrm.Page API.

**File**: `src/components/model-driven/form.context.ts`

### Functions

These are low-level functions that FormComponent uses internally. You can use them directly for advanced scenarios.

#### `getFormContext(page: Page): Promise<FormContextData>`

Get complete form context.

**Examples**:

```typescript
import { getFormContext } from 'power-platform-playwright-toolkit';

const context = await getFormContext(page);
console.log('Entity:', context.entityName);
console.log('Form Type:', context.formType);
```

---

#### `getEntityAttribute(page: Page, attributeName: string): Promise<any>`

Get attribute value directly.

**Examples**:

```typescript
import { getEntityAttribute } from 'power-platform-playwright-toolkit';

const name = await getEntityAttribute(page, 'name');
console.log('Name:', name);
```

---

#### `setEntityAttribute(page: Page, attributeName: string, value: any): Promise<void>`

Set attribute value directly.

**Examples**:

```typescript
import { setEntityAttribute } from 'power-platform-playwright-toolkit';

await setEntityAttribute(page, 'name', 'Contoso Ltd');
```

---

#### `saveForm(page: Page, options?: FormSaveOptions): Promise<void>`

Save form directly.

**Examples**:

```typescript
import { saveForm } from 'power-platform-playwright-toolkit';

await saveForm(page);
await saveForm(page, { saveMode: 'saveandclose' });
```

---

#### `isFormDirty(page: Page): Promise<boolean>`

Check if form is dirty.

**Examples**:

```typescript
import { isFormDirty } from 'power-platform-playwright-toolkit';

const isDirty = await isFormDirty(page);
console.log('Form has changes:', isDirty);
```

---

#### `isFormValid(page: Page): Promise<boolean>`

Check if form is valid.

**Examples**:

```typescript
import { isFormValid } from 'power-platform-playwright-toolkit';

const isValid = await isFormValid(page);
if (isValid) {
  await saveForm(page);
}
```

---

#### `executeInFormContext<T>(page: Page, fn: (Xrm: any) => T): Promise<T>`

Execute custom code with Xrm.Page access.

**Examples**:

```typescript
import { executeInFormContext } from 'power-platform-playwright-toolkit';

// Get form type
const formType = await executeInFormContext(page, (Xrm) => {
  return Xrm.Page.ui.getFormType();
});

// Get all attributes
const attributes = await executeInFormContext(page, (Xrm) => {
  return Xrm.Page.data.entity.attributes.get().map((attr) => ({
    name: attr.getName(),
    value: attr.getValue(),
    isDirty: attr.getIsDirty(),
  }));
});

// Complex business logic
const result = await executeInFormContext(page, (Xrm) => {
  const qty = Xrm.Page.getAttribute('quantity').getValue();
  const price = Xrm.Page.getAttribute('price').getValue();
  const discount = Xrm.Page.getAttribute('discount').getValue() || 0;
  return qty * price * (1 - discount / 100);
});
```

---

## Types and Interfaces

**File**: `src/components/model-driven/types.ts`

### GridRecordOptions

Options for opening records from grid.

```typescript
interface GridRecordOptions {
  /** Open record at specific row index (0-based) */
  rowNumber?: number;
  /** Open record by matching column value */
  columnValue?: string;
  /** Column name to search in (required if columnValue is provided) */
  columnName?: string;
}
```

**Usage**:

```typescript
// By row number
await grid.openRecord({ rowNumber: 0 });

// By column value
await grid.openRecord({
  columnValue: 'ORD-12345',
  columnName: 'Order Number',
});
```

---

### FormSaveOptions

Options for saving forms.

```typescript
interface FormSaveOptions {
  /** Save mode: 'save' | 'saveandclose' | 'saveandnew' */
  saveMode?: 'save' | 'saveandclose' | 'saveandnew';
}
```

**Usage**:

```typescript
await form.save(); // Just save
await form.save({ saveMode: 'saveandclose' }); // Save and close
await form.save({ saveMode: 'saveandnew' }); // Save and create new
```

---

### FormTabOptions

Options for form tab navigation.

```typescript
interface FormTabOptions {
  /** Tab name (e.g., 'General', 'Details') */
  tabName?: string;
  /** Tab index (0-based) */
  tabIndex?: number;
}
```

**Usage**:

```typescript
await form.navigateToTab({ tabName: 'General' });
await form.navigateToTab({ tabIndex: 0 });
```

---

### FormSectionOptions

Options for form section navigation.

```typescript
interface FormSectionOptions {
  /** Tab name containing the section */
  tabName: string;
  /** Section name */
  sectionName: string;
}
```

**Usage**:

```typescript
await form.navigateToSection({
  tabName: 'General',
  sectionName: 'Order Details',
});
```

---

### CommandBarButtonOptions

Options for clicking command bar buttons.

```typescript
interface CommandBarButtonOptions {
  /** Check overflow menu if button not found in main command bar */
  checkOverflow?: boolean; // Default: true
  /** Timeout for waiting for button (milliseconds) */
  timeout?: number; // Default: 30000
  /** Wait for button to be enabled before clicking */
  waitForEnabled?: boolean; // Default: true
  /** Context where command bar is located */
  context?: CommandBarContext; // Default: Form
}
```

**Usage**:

```typescript
await commanding.clickButton('Delete', {
  checkOverflow: true,
  timeout: 60000,
  waitForEnabled: true,
});
```

---

### CommandBarContext

Enum for command bar contexts.

```typescript
enum CommandBarContext {
  Form = 'form', // Form page command bar
  Grid = 'grid', // Grid/View page command bar
  SubGrid = 'subgrid', // Subgrid command bar
}
```

**Usage**:

```typescript
await commanding.clickButton('New', {
  context: CommandBarContext.Grid,
});
```

---

### FormContextData

Form context data structure.

```typescript
interface FormContextData {
  /** Entity logical name */
  entityName: string;
  /** Entity record ID */
  entityId: string;
  /** Form type (1=Create, 2=Update, 3=ReadOnly, 4=Disabled) */
  formType: number;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** All form attributes */
  attributes: Array<{
    name: string;
    value: any;
    isDirty: boolean;
  }>;
}
```

**Usage**:

```typescript
const context = await form.getContext();
console.log('Entity:', context.entityName);
console.log('Form Type:', context.formType);
console.log('Is Dirty:', context.isDirty);
```

---

## Complete Examples

### Example 1: Complete CRUD Operations

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
  generateUniqueOrderNumber,
} from 'power-platform-playwright-toolkit';

test.describe('Order CRUD Operations', () => {
  let appProvider: AppProvider;
  let modelDrivenApp: ModelDrivenAppPage;

  test.beforeEach(async ({ page, context }) => {
    appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'Orders App',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: process.env.MODEL_DRIVEN_APP_URL,
    });

    modelDrivenApp = appProvider.getModelDrivenAppPage();
  });

  test('CREATE - create new order', async ({ page }) => {
    const orderNumber = generateUniqueOrderNumber();

    // Wait for grid
    await modelDrivenApp.grid.waitForGridLoad();

    // Click New via CommandingComponent
    await modelDrivenApp.commanding.clickNew();
    await page.waitForTimeout(3000);

    // Fill form via FormComponent
    await modelDrivenApp.form.setAttribute('nwind_ordernumber', orderNumber);
    await modelDrivenApp.form.setAttribute('nwind_customer', 'Contoso Ltd');
    await modelDrivenApp.form.setAttribute('nwind_product', 'Widget A');
    await modelDrivenApp.form.setAttribute('nwind_quantity', 10);

    // Validate form
    const isValid = await modelDrivenApp.form.isValid();
    expect(isValid).toBe(true);

    // Save via CommandingComponent
    await modelDrivenApp.commanding.save();
    await page.waitForTimeout(2000);

    // Verify
    const savedOrderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
    expect(savedOrderNumber).toBe(orderNumber);

    console.log(`✅ Order ${orderNumber} created`);
  });

  test('READ - read order from grid', async () => {
    // Wait for grid via GridComponent
    await modelDrivenApp.grid.waitForGridLoad();

    // Get data from grid
    const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
    const customer = await modelDrivenApp.grid.getCellValue(0, 'Customer');
    const quantity = await modelDrivenApp.grid.getCellValue(0, 'Quantity');

    console.log(`Order: ${orderNumber}, Customer: ${customer}, Qty: ${quantity}`);

    expect(orderNumber).toBeTruthy();
    expect(customer).toBeTruthy();

    console.log('✅ Read order data');
  });

  test('UPDATE - update order quantity', async ({ page }) => {
    // Open record via GridComponent
    await modelDrivenApp.grid.waitForGridLoad();
    await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
    await page.waitForTimeout(3000);

    // Get current value via FormComponent
    const originalQuantity = await modelDrivenApp.form.getAttribute('nwind_quantity');
    console.log('Original Quantity:', originalQuantity);

    // Update via FormComponent
    const newQuantity = 25;
    await modelDrivenApp.form.setAttribute('nwind_quantity', newQuantity);

    // Check dirty state
    const isDirty = await modelDrivenApp.form.isDirty();
    expect(isDirty).toBe(true);

    // Save via CommandingComponent
    await modelDrivenApp.commanding.save();
    await page.waitForTimeout(2000);

    // Verify
    const updatedQuantity = await modelDrivenApp.form.getAttribute('nwind_quantity');
    expect(updatedQuantity).toBe(newQuantity);

    console.log(`✅ Quantity updated: ${originalQuantity} → ${newQuantity}`);
  });

  test('DELETE - delete order', async ({ page }) => {
    // Wait for grid and select row
    await modelDrivenApp.grid.waitForGridLoad();
    const initialRowCount = await modelDrivenApp.grid.getRowCount();

    // Select row via GridComponent
    await modelDrivenApp.grid.selectRow(0);

    // Click Delete via CommandingComponent
    await modelDrivenApp.commanding.clickDelete();
    await page.waitForTimeout(1000);

    // Confirm deletion
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.waitForTimeout(3000);

    // Verify via GridComponent
    await modelDrivenApp.grid.waitForGridLoad();
    const finalRowCount = await modelDrivenApp.grid.getRowCount();
    expect(finalRowCount).toBe(initialRowCount - 1);

    console.log(`✅ Order deleted. Rows: ${initialRowCount} → ${finalRowCount}`);
  });
});
```

---

### Example 2: Advanced Form Operations

```typescript
test('advanced form operations', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);
  await appProvider.launch({...});

  const modelDrivenApp = appProvider.getModelDrivenAppPage();

  // Create new record
  await modelDrivenApp.grid.waitForGridLoad();
  await modelDrivenApp.commanding.clickNew();
  await page.waitForTimeout(3000);

  // Navigate to tabs
  await modelDrivenApp.form.navigateToTab({ tabName: 'General' });
  await modelDrivenApp.form.navigateToSection({
    tabName: 'General',
    sectionName: 'Order Details'
  });

  // Field visibility
  await modelDrivenApp.form.setFieldVisibility('nwind_internalnotes', false);
  await modelDrivenApp.form.setFieldVisibility('nwind_customerid', true);

  // Required levels
  await modelDrivenApp.form.setFieldRequiredLevel('nwind_customer', 'required');
  await modelDrivenApp.form.setFieldRequiredLevel('nwind_notes', 'recommended');

  // Disable field
  await modelDrivenApp.form.setFieldDisabled('nwind_ordernumber', true);

  // Show notifications
  await modelDrivenApp.form.showNotification(
    'Please fill all required fields',
    'warning',
    'required-warning'
  );

  // Fill form
  await modelDrivenApp.form.setAttribute('nwind_customer', 'Contoso Ltd');
  await modelDrivenApp.form.setAttribute('nwind_quantity', 10);

  // Clear notification
  await page.waitForTimeout(2000);
  await modelDrivenApp.form.clearNotification('required-warning');

  // Validate and save
  const isValid = await modelDrivenApp.form.isValid();
  if (isValid) {
    await modelDrivenApp.commanding.save();
  }
});
```

---

### Example 3: Custom FormContext Operations

```typescript
test('custom formcontext operations', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);
  await appProvider.launch({...});

  const modelDrivenApp = appProvider.getModelDrivenAppPage();

  // Open record
  await modelDrivenApp.grid.waitForGridLoad();
  await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
  await page.waitForTimeout(3000);

  // Get form context
  const formContext = await modelDrivenApp.form.getContext();
  console.log('Entity:', formContext.entityName);
  console.log('Form Type:', formContext.formType);

  // Execute custom Xrm code
  const allAttributes = await modelDrivenApp.form.execute((Xrm) => {
    return Xrm.Page.data.entity.attributes.get().map(attr => ({
      name: attr.getName(),
      value: attr.getValue(),
      isDirty: attr.getIsDirty(),
      type: attr.getAttributeType()
    }));
  });

  console.log('All Attributes:', allAttributes);

  // Calculate total (custom business logic)
  const total = await modelDrivenApp.form.execute((Xrm) => {
    const quantity = Xrm.Page.getAttribute('nwind_quantity').getValue() || 0;
    const price = Xrm.Page.getAttribute('nwind_price').getValue() || 0;
    const discount = Xrm.Page.getAttribute('nwind_discount').getValue() || 0;

    return (quantity * price) * (1 - discount / 100);
  });

  console.log('Calculated Total:', total);
});
```

---

## Best Practices

### 1. Always Use Components

✅ **CORRECT:**

```typescript
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
await modelDrivenApp.form.setAttribute('name', 'Value');
await modelDrivenApp.commanding.save();
```

❌ **INCORRECT:**

```typescript
// Don't construct locators manually
await page.locator('[role="row"]').first().click();
```

### 2. Wait Appropriately

```typescript
// Wait for grid before operations
await modelDrivenApp.grid.waitForGridLoad();

// Wait after opening record
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
await page.waitForTimeout(3000);

// Wait after save
await modelDrivenApp.commanding.save();
await page.waitForTimeout(2000);
```

### 3. Check State Before Actions

```typescript
// Check if form is valid before saving
const isValid = await modelDrivenApp.form.isValid();
if (isValid) {
  await modelDrivenApp.commanding.save();
}

// Check if button is enabled
const isSaveEnabled = await modelDrivenApp.commanding.isButtonEnabled('Save');
if (isSaveEnabled) {
  await modelDrivenApp.commanding.save();
}
```

### 4. Use Type-Safe Methods

```typescript
// Use component methods (type-safe)
await modelDrivenApp.form.setAttribute('name', 'Value');

// Instead of executeInFormContext for simple operations
// await executeInFormContext(page, (Xrm) => {
//   Xrm.Page.getAttribute('name').setValue('Value');
// });
```

### 5. Handle Errors Gracefully

```typescript
try {
  await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
  await page.waitForTimeout(3000);
} catch (error) {
  console.error('Failed to open record:', error);
  // Take screenshot or retry
}
```

---

## Summary

The Model-Driven App components provide a **comprehensive, type-safe, component-based API** for testing:

| Component               | Methods     | Purpose                                 |
| ----------------------- | ----------- | --------------------------------------- |
| **GridComponent**       | 10+ methods | Grid operations, row selection, sorting |
| **FormComponent**       | 20+ methods | Form fields, navigation, validation     |
| **CommandingComponent** | 15+ methods | Command bar buttons, operations         |

All components are:

- ✅ **Lazy-initialized** for performance
- ✅ **Type-safe** with full IntelliSense
- ✅ **Well-documented** with examples
- ✅ **Battle-tested** patterns
- ✅ **Consistent API** across components

**Ready to use in your tests!**

---

**Related Documentation**:

- [Getting Started](./01-getting-started.md)
- [Model-Driven Apps Tutorial](./03-model-driven-apps.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [FormContext API Tutorial](./FORMCONTEXT.md)
