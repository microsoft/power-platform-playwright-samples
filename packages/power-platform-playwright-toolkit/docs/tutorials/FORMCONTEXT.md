# FormContext API for Model-Driven Apps

This guide explains how to use the **formContext** helpers in Power Platform Playwright Toolkit to interact with Model-Driven App forms programmatically.

## Overview

The `formContext` object is the primary way to interact with form data in Model-Driven Apps. It provides access to:

- Entity information (name, ID, primary attribute)
- Form attributes (fields) and their values
- Form state (dirty, valid)
- Save operations
- Form controls and UI elements

**Microsoft Documentation:**

- [formContext API Reference](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data)
- [Xrm.Page (formContext)](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-page)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [getFormContext](#getformcontext)
  - [getEntityAttribute](#getentityattribute)
  - [setEntityAttribute](#setentityattribute)
  - [getAllEntityAttributes](#getallentityattributes)
  - [saveForm](#saveform)
  - [isFormDirty](#isformdirty)
  - [isFormValid](#isformvalid)
  - [refreshForm](#refreshform)
  - [executeInFormContext](#executeinformcontext)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)

## Installation

The formContext helpers are included in the Power Platform Playwright Toolkit:

```bash
npm install power-platform-playwright-toolkit
```

## Quick Start

```typescript
import { test } from '@playwright/test';
import {
  getFormContext,
  getEntityAttribute,
  setEntityAttribute,
  saveForm,
} from 'power-platform-playwright-toolkit';

test('update order form', async ({ page }) => {
  // Navigate to Model-Driven App form
  await page.goto('https://org.crm.dynamics.com/main.aspx?...');
  await page.waitForLoadState('networkidle');

  // Get form context
  const formContext = await getFormContext(page);
  console.log('Editing:', formContext.entityName);

  // Read attribute value
  const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
  console.log('Current Order Number:', orderNumber);

  // Update attribute value
  await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-12345');

  // Save form
  await saveForm(page);
});
```

## API Reference

### getFormContext

Get comprehensive information about the current form.

**Signature:**

```typescript
async function getFormContext(page: Page): Promise<FormContextData>;
```

**Returns:**

```typescript
interface FormContextData {
  entityName: string; // Logical name (e.g., 'nwind_order')
  entityId: string; // GUID
  primaryAttributeValue: string; // Primary field value (record name)
  isDirty: boolean; // Has unsaved changes
  isValid: boolean; // All data is valid
  attributeNames: string[]; // All attribute logical names
}
```

**Example:**

```typescript
const formContext = await getFormContext(page);

console.log('Entity:', formContext.entityName);
console.log('Record ID:', formContext.entityId);
console.log('Record Name:', formContext.primaryAttributeValue);
console.log('Unsaved changes:', formContext.isDirty);
console.log('Valid:', formContext.isValid);
console.log('Fields:', formContext.attributeNames);
```

---

### getEntityAttribute

Get the value of a specific form attribute (field).

**Signature:**

```typescript
async function getEntityAttribute(page: Page, attributeName: string): Promise<any>;
```

**Parameters:**

- `attributeName` - Logical name of the attribute (not display name)

**Return Type:** Depends on attribute type:

- **Text**: `string`
- **Number**: `number`
- **Boolean**: `boolean`
- **Date**: `Date` object
- **Lookup**: `{ id: string, name: string, entityType: string }[]`
- **OptionSet**: `number` (option value)

**Examples:**

```typescript
// Text field
const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
// Returns: "ORD-12345"

// Number field
const amount = await getEntityAttribute(page, 'nwind_orderamount');
// Returns: 1500.50

// Date field
const orderDate = await getEntityAttribute(page, 'nwind_orderdate');
// Returns: Date object

// Lookup field
const customer = await getEntityAttribute(page, 'customerid');
// Returns: [{ id: 'guid', name: 'Acme Corp', entityType: 'account' }]

// OptionSet field
const status = await getEntityAttribute(page, 'statuscode');
// Returns: 1 (option value)
```

---

### setEntityAttribute

Set the value of a form attribute.

**Signature:**

```typescript
async function setEntityAttribute(page: Page, attributeName: string, value: any): Promise<void>;
```

**Parameters:**

- `attributeName` - Logical name of the attribute
- `value` - Value to set (type must match attribute type)

**Examples:**

```typescript
// Set text field
await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-12345');

// Set number field
await setEntityAttribute(page, 'nwind_orderamount', 1500.5);

// Set date field
await setEntityAttribute(page, 'nwind_orderdate', new Date('2024-01-15'));

// Set boolean field
await setEntityAttribute(page, 'nwind_isurgent', true);

// Set lookup field
await setEntityAttribute(page, 'customerid', [
  {
    id: '{customer-guid}',
    name: 'Acme Corporation',
    entityType: 'account',
  },
]);

// Set OptionSet field
await setEntityAttribute(page, 'statuscode', 2);
```

---

### getAllEntityAttributes

Get all form attributes and their values in a single call.

**Signature:**

```typescript
async function getAllEntityAttributes(page: Page): Promise<Record<string, any>>;
```

**Returns:** Object with attribute names as keys and their values.

**Example:**

```typescript
const allData = await getAllEntityAttributes(page);

console.log('Order Number:', allData.nwind_ordernumber);
console.log('Order Amount:', allData.nwind_orderamount);
console.log('Status:', allData.statuscode);

// Iterate over all attributes
for (const [attrName, value] of Object.entries(allData)) {
  console.log(`${attrName}:`, value);
}
```

---

### saveForm

Save the form with optional save mode.

**Signature:**

```typescript
async function saveForm(
  page: Page,
  options?: {
    saveMode?: 'saveandclose' | 'saveandnew';
  }
): Promise<void>;
```

**Parameters:**

- `options.saveMode` - Optional save behavior:
  - Omit or `undefined`: Save and stay on form
  - `'saveandclose'`: Save and close the form
  - `'saveandnew'`: Save and open new form

**Examples:**

```typescript
// Save and stay on form (default)
await saveForm(page);

// Save and close
await saveForm(page, { saveMode: 'saveandclose' });

// Save and create new
await saveForm(page, { saveMode: 'saveandnew' });
```

**Best Practice:**

```typescript
// Check validity before saving
const isValid = await isFormValid(page);
if (isValid) {
  await saveForm(page);
} else {
  console.log('Form has validation errors');
}
```

---

### isFormDirty

Check if the form has unsaved changes.

**Signature:**

```typescript
async function isFormDirty(page: Page): Promise<boolean>;
```

**Returns:** `true` if form has unsaved changes.

**Example:**

```typescript
const hasChanges = await isFormDirty(page);

if (hasChanges) {
  console.log('⚠️ Form has unsaved changes');
  await saveForm(page);
} else {
  console.log('✅ No changes to save');
}
```

---

### isFormValid

Check if all form data passes validation.

**Signature:**

```typescript
async function isFormValid(page: Page): Promise<boolean>;
```

**Returns:** `true` if all form data is valid.

**Example:**

```typescript
const isValid = await isFormValid(page);

if (!isValid) {
  console.log('❌ Form has validation errors');
  // Take screenshot for debugging
  await page.screenshot({ path: 'validation-errors.png' });
}
```

---

### refreshForm

Refresh form data without reloading the page.

**Signature:**

```typescript
async function refreshForm(page: Page, save?: boolean): Promise<void>;
```

**Parameters:**

- `save` - If `true`, saves before refreshing (default: `false`)

**Examples:**

```typescript
// Refresh without saving (discards unsaved changes)
await refreshForm(page, false);

// Save and refresh
await refreshForm(page, true);
```

---

### executeInFormContext

Execute custom JavaScript with access to the Xrm object.

**Signature:**

```typescript
async function executeInFormContext<T>(page: Page, fn: (Xrm: any) => T): Promise<T>;
```

**Parameters:**

- `fn` - Function to execute in browser context (receives `Xrm` object)

**Returns:** Result from the executed function.

**Examples:**

```typescript
// Get current user information
const userInfo = await executeInFormContext(page, (Xrm) => {
  const userSettings = Xrm.Utility.getGlobalContext().userSettings;
  return {
    userId: userSettings.userId,
    userName: userSettings.userName,
  };
});
console.log('User:', userInfo.userName);

// Show form notification
await executeInFormContext(page, (Xrm) => {
  Xrm.Page.ui.setFormNotification('Form updated by automation', 'INFO', 'automation-notification');
});

// Get organization settings
const orgInfo = await executeInFormContext(page, (Xrm) => {
  const context = Xrm.Utility.getGlobalContext();
  return {
    orgName: context.organizationSettings.uniqueName,
    version: context.getVersion(),
  };
});
console.log('Org:', orgInfo.orgName, 'Version:', orgInfo.version);

// Hide/show form sections
await executeInFormContext(page, (Xrm) => {
  const formContext = Xrm.Page;
  const section = formContext.ui.tabs.get('general').sections.get('details');
  section.setVisible(false);
});
```

## Common Use Cases

### Use Case 1: Data Validation Before Save

```typescript
test('validate and save order', async ({ page }) => {
  // Navigate to form
  await page.goto('https://org.crm.dynamics.com/main.aspx?...');

  // Set required fields
  await setEntityAttribute(page, 'nwind_ordernumber', 'ORD-001');
  await setEntityAttribute(page, 'nwind_orderamount', 100);

  // Validate before saving
  const isValid = await isFormValid(page);
  expect(isValid).toBe(true);

  // Save
  await saveForm(page);

  // Verify save completed
  const isDirty = await isFormDirty(page);
  expect(isDirty).toBe(false);
});
```

### Use Case 2: Bulk Data Entry

```typescript
test('bulk create orders', async ({ page }) => {
  const orders = [
    { number: 'ORD-001', amount: 100 },
    { number: 'ORD-002', amount: 200 },
    { number: 'ORD-003', amount: 300 },
  ];

  for (const order of orders) {
    // Set fields
    await setEntityAttribute(page, 'nwind_ordernumber', order.number);
    await setEntityAttribute(page, 'nwind_orderamount', order.amount);

    // Save and create new
    await saveForm(page, { saveMode: 'saveandnew' });
    await page.waitForTimeout(2000);
  }
});
```

### Use Case 3: Data Extraction

```typescript
test('extract order data', async ({ page }) => {
  // Navigate to order record
  await page.goto('https://org.crm.dynamics.com/main.aspx?...');

  // Get all form data
  const formData = await getAllEntityAttributes(page);

  // Extract specific fields
  const orderData = {
    id: (await getFormContext(page)).entityId,
    orderNumber: formData.nwind_ordernumber,
    amount: formData.nwind_orderamount,
    customer: formData.customerid,
    status: formData.statuscode,
  };

  console.log('Extracted Order:', JSON.stringify(orderData, null, 2));

  // Save to file for later processing
  await require('fs/promises').writeFile('order-data.json', JSON.stringify(orderData, null, 2));
});
```

### Use Case 4: Conditional Form Updates

```typescript
test('update order based on status', async ({ page }) => {
  await page.goto('https://org.crm.dynamics.com/main.aspx?...');

  // Get current status
  const status = await getEntityAttribute(page, 'statuscode');

  // Update based on status
  if (status === 1) {
    // Active
    await setEntityAttribute(page, 'nwind_isurgent', true);
    await setEntityAttribute(page, 'nwind_priority', 'high');
  } else if (status === 2) {
    // Completed
    const completedDate = new Date();
    await setEntityAttribute(page, 'nwind_completeddate', completedDate);
  }

  // Save changes
  if (await isFormDirty(page)) {
    await saveForm(page);
  }
});
```

### Use Case 5: Form Monitoring and Logging

```typescript
test('monitor form changes', async ({ page }) => {
  await page.goto('https://org.crm.dynamics.com/main.aspx?...');

  // Capture initial state
  const initialData = await getAllEntityAttributes(page);

  // Make changes
  await setEntityAttribute(page, 'nwind_ordernumber', 'UPDATED-001');
  await setEntityAttribute(page, 'nwind_orderamount', 999);

  // Capture final state
  const finalData = await getAllEntityAttributes(page);

  // Log changes
  console.log('=== Form Changes ===');
  for (const attr of Object.keys(finalData)) {
    if (initialData[attr] !== finalData[attr]) {
      console.log(`${attr}: ${initialData[attr]} → ${finalData[attr]}`);
    }
  }

  await saveForm(page);
});
```

## Troubleshooting

### formContext Not Available

**Error:** `formContext not available. Make sure you are on a Model-Driven App form page.`

**Solutions:**

1. Ensure you're on a Model-Driven App form page (not grid/list view)
2. Wait for page to fully load before calling formContext methods:
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(3000); // Additional wait for Xrm to initialize
   ```
3. Check if you're on the correct URL pattern (should include `main.aspx`)

### Attribute Not Found

**Error:** `Attribute "xyz" not found on form`

**Solutions:**

1. Verify the attribute logical name (not display name)
2. Check if the attribute is on the form (may be hidden or on different tab)
3. List all available attributes:
   ```typescript
   const formContext = await getFormContext(page);
   console.log('Available attributes:', formContext.attributeNames);
   ```

### Save Not Working

**Problem:** Save completes but changes not persisted

**Solutions:**

1. Check form validity:
   ```typescript
   const isValid = await isFormValid(page);
   if (!isValid) {
     console.log('Form has validation errors');
   }
   ```
2. Increase wait time after save:
   ```typescript
   await saveForm(page);
   await page.waitForTimeout(3000);
   ```
3. Verify save completed by checking dirty state:
   ```typescript
   await saveForm(page);
   await page.waitForTimeout(2000);
   const stillDirty = await isFormDirty(page);
   expect(stillDirty).toBe(false);
   ```

### Xrm Object Not Available

**Error:** `Xrm object not available`

**Solutions:**

1. Ensure Model-Driven App has fully loaded
2. Check browser console for JavaScript errors
3. Try accessing Xrm in browser console manually to verify it exists

## Best Practices

1. **Always wait for form to load** before calling formContext methods
2. **Check form validity** before saving
3. **Use logical names** (schema names) not display names for attributes
4. **Handle errors** gracefully with try-catch blocks
5. **Verify saves** by checking `isFormDirty()` after save
6. **Use executeInFormContext** for advanced Xrm operations not covered by helpers
7. **Take screenshots** on errors for debugging

## Related Documentation

- [Microsoft formContext API](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data)
- [Xrm.Page Reference](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-page)
- [Client API Reference](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference)
- [Model-Driven App Testing Guide](./MODEL-DRIVEN-APP-TESTING.md)
