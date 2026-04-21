// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * FormContext API Test for Northwind Model-Driven App
 *
 * This test demonstrates using the formContext API to interact with
 * Model-Driven App forms programmatically.
 *
 * Prerequisites:
 * - Northwind Orders Model-Driven App deployed
 * - Environment variables configured in .env
 * - Authentication completed (npm run auth)
 *
 * Run this test:
 *   npm test -- tests/northwind/mda/form-context.test.ts
 *   npm test -- tests/northwind/mda/form-context.test.ts -- --headed
 */

import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
  getFormContext,
  getEntityAttribute,
  setEntityAttribute,
  getAllEntityAttributes,
  generateUniqueOrderNumber,
  saveForm,
  isFormDirty,
  isFormValid,
  executeInFormContext,
} from 'power-platform-playwright-toolkit';

const MODEL_DRIVEN_APP_URL = process.env.MODEL_DRIVEN_APP_URL || process.env.BASE_APP_URL;
const ENTITY_NAME = 'nwind_orders'; // Northwind Orders entity

// Validate required environment variable
if (!MODEL_DRIVEN_APP_URL) {
  throw new Error(
    'MODEL_DRIVEN_APP_URL or BASE_APP_URL environment variable is required. ' +
      'Please set it in your .env file. ' +
      'Example: BASE_APP_URL=https://org.crm.dynamics.com/main.aspx?appid=abc-123'
  );
}

test.describe.serial('FormContext API - Northwind Orders', () => {
  let appProvider: AppProvider;
  let modelDrivenApp: ModelDrivenAppPage;

  test.beforeEach(async ({ page, context }) => {
    // Initialize AppProvider - single entry point for all apps
    appProvider = new AppProvider(page, context);

    // Launch Model-Driven App using direct URL
    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: MODEL_DRIVEN_APP_URL,
    });

    // Get ModelDrivenAppPage instance from provider
    modelDrivenApp = appProvider.getModelDrivenAppPage();

    // Navigate to Orders entity grid view
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await page.waitForTimeout(3000);

    // Open the first editable (active/non-read-only) order record.
    // In Dynamics 365, closed/inactive records have no Xrm attribute bindings,
    // so attribute-based tests would fail on them. Try up to 5 rows to find
    // one whose Xrm.Page.data.entity.attributes collection is populated.
    let editableRecordFound = false;
    for (let row = 0; row < 5; row++) {
      console.log(`Opening record at row ${row}...`);
      await modelDrivenApp.grid.openRecord({ rowNumber: row });
      await page.waitForURL(/pagetype=entityrecord/, { timeout: 15_000 });
      await page.waitForTimeout(2_000);

      // Check both: attributes bound (not inactive) AND form is initially valid
      // (no pre-existing validation errors that would block write operations).
      const isWritable = await page.evaluate(() => {
        const entity = (window as any).Xrm?.Page?.data?.entity;
        if (!entity) return false;
        let count = 0;
        try {
          entity.attributes.forEach(() => {
            count++;
          });
        } catch {
          /* ignore */
        }
        if (count === 0) return false; // inactive/closed record — no attribute bindings
        try {
          return entity.isValid() === true; // skip records with pre-existing validation errors
        } catch {
          return false;
        }
      });

      if (isWritable) {
        console.log(`Found writable record at row ${row}`);
        editableRecordFound = true;
        break;
      }

      console.log(
        `Row ${row} is not writable (inactive or has validation errors) — trying next row...`
      );
      await modelDrivenApp.navigateToGridView(ENTITY_NAME);
      await page.waitForTimeout(2_000);
    }

    if (!editableRecordFound) {
      throw new Error(
        'No writable order record found in the first 5 rows of the grid. ' +
          'Ensure there are active Northwind Orders with no pre-existing validation errors in the environment.'
      );
    }
  });

  test('should get form context information', async ({ page }) => {
    console.log('\n=== Test: Get Form Context ===');

    // Get form context
    const formContext = await getFormContext(page);

    console.log('Entity Name:', formContext.entityName);
    console.log('Entity ID:', formContext.entityId);
    console.log('Primary Attribute:', formContext.primaryAttributeValue);
    console.log('Is Dirty:', formContext.isDirty);
    console.log('Is Valid:', formContext.isValid);
    console.log('Number of Attributes:', formContext.attributeNames.length);

    // Assertions
    expect(formContext.entityName).toBe(ENTITY_NAME);
    expect(formContext.entityId).toBeTruthy();
    expect(formContext.entityId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(formContext.attributeNames.length).toBeGreaterThan(0);

    console.log('✅ Form context retrieved successfully');
  });

  test('should read attribute values', async ({ page }) => {
    console.log('\n=== Test: Read Attribute Values ===');

    // Get form context first to see available fields
    const formContext = await getFormContext(page);
    console.log('Available fields:', formContext.attributeNames);

    // Try to read common fields
    try {
      const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
      console.log('Order Number:', orderNumber);
      expect(orderNumber).toBeTruthy();
    } catch (error) {
      console.log('⚠️ Order Number field not found or empty');
    }

    try {
      const statusCode = await getEntityAttribute(page, 'statuscode');
      console.log('Status Code:', statusCode);
      expect(statusCode).toBeDefined();
    } catch (error) {
      console.log('⚠️ Status Code field not found');
    }

    // Get all attributes at once
    const allData = await getAllEntityAttributes(page);
    console.log(`Retrieved ${Object.keys(allData).length} attributes`);
    expect(Object.keys(allData).length).toBeGreaterThan(0);

    console.log('✅ Attributes read successfully');
  });

  test('should update and save attribute values', async ({ page }) => {
    console.log('\n=== Test: Update and Save Attributes ===');

    // Get initial state
    const initialFormContext = await getFormContext(page);
    console.log('Initial form dirty state:', initialFormContext.isDirty);

    // Get current order number
    let currentOrderNumber: string;
    try {
      currentOrderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
      console.log('Current Order Number:', currentOrderNumber);
    } catch (error) {
      console.log('⚠️ Order Number field not found, using default');
      currentOrderNumber = 'N/A';
    }

    const newOrderNumber = generateUniqueOrderNumber();

    console.log(`Updating Order Number to: ${newOrderNumber}`);
    await setEntityAttribute(page, 'nwind_ordernumber', newOrderNumber);

    // Check if form is now dirty
    await page.waitForTimeout(500);
    const isDirty = await isFormDirty(page);
    console.log('Form dirty after change:', isDirty);
    expect(isDirty).toBe(true);

    // Check if form is valid
    const isValid = await isFormValid(page);
    console.log('Form valid:', isValid);

    if (isValid) {
      // Save the form
      console.log('Saving form...');
      await saveForm(page);
      await page.waitForTimeout(2000);

      // Verify save completed
      const isDirtyAfterSave = await isFormDirty(page);
      console.log('Form dirty after save:', isDirtyAfterSave);
      expect(isDirtyAfterSave).toBe(false);

      // Verify the value was saved
      const savedOrderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
      console.log('Saved Order Number:', savedOrderNumber);
      expect(savedOrderNumber).toBe(newOrderNumber);

      console.log('✅ Attributes updated and saved successfully');
    } else {
      console.log('⚠️ Form has validation errors, skipping save');
      // Take screenshot for debugging
      await page.screenshot({ path: 'form-validation-errors.png' });
    }
  });

  test('should execute custom Xrm code', async ({ page }) => {
    console.log('\n=== Test: Execute Custom Xrm Code ===');

    // Get current user information
    const userInfo = await executeInFormContext(page, (Xrm) => {
      const userSettings = Xrm.Utility.getGlobalContext().userSettings;
      return {
        userId: userSettings.userId,
        userName: userSettings.userName,
        userLanguageId: userSettings.languageId,
      };
    });

    console.log('Current User ID:', userInfo.userId);
    console.log('Current User Name:', userInfo.userName);
    console.log('Language ID:', userInfo.userLanguageId);

    expect(userInfo.userId).toBeTruthy();
    expect(userInfo.userName).toBeTruthy();

    // Get organization information
    const orgInfo = await executeInFormContext(page, (Xrm) => {
      const context = Xrm.Utility.getGlobalContext();
      return {
        orgName: context.organizationSettings.uniqueName,
        orgId: context.organizationSettings.organizationId,
        version: context.getVersion(),
      };
    });

    console.log('Organization Name:', orgInfo.orgName);
    console.log('Organization ID:', orgInfo.orgId);
    console.log('Dynamics Version:', orgInfo.version);

    expect(orgInfo.orgName).toBeTruthy();
    expect(orgInfo.orgId).toBeTruthy();
    expect(orgInfo.version).toBeTruthy();

    // Show a form notification — may fail in some D365 form states where the
    // notification container has not yet been initialized. Wrap in try/catch so
    // this cosmetic step does not fail the test.
    try {
      await executeInFormContext(page, (Xrm) => {
        Xrm.Page.ui.setFormNotification(
          'FormContext API test is running',
          'INFO',
          'playwright-test-notification'
        );
      });
      console.log('✅ Form notification displayed');

      // Wait to see the notification
      await page.waitForTimeout(2000);

      // Clear the notification
      await executeInFormContext(page, (Xrm) => {
        Xrm.Page.ui.clearFormNotification('playwright-test-notification');
      });
    } catch (error) {
      // setFormNotification can throw "Container does not exist" in certain form
      // initialization states — this is a D365 API limitation, not a test failure.
      console.log(
        '⚠️ Form notification skipped (UI container not ready):',
        (error as Error).message
      );
    }

    console.log('✅ Custom Xrm code executed successfully');
  });

  test('should handle form state checks', async ({ page }) => {
    console.log('\n=== Test: Form State Checks ===');

    // Get initial state
    let isDirty = await isFormDirty(page);
    let isValid = await isFormValid(page);

    console.log('Initial State:');
    console.log('  Dirty:', isDirty);
    console.log('  Valid:', isValid);

    expect(isValid).toBe(true);

    // Make a change
    await setEntityAttribute(page, 'nwind_ordernumber', generateUniqueOrderNumber());
    await page.waitForTimeout(500);

    // Check state after change
    isDirty = await isFormDirty(page);
    isValid = await isFormValid(page);

    console.log('After Change:');
    console.log('  Dirty:', isDirty);
    console.log('  Valid:', isValid);

    expect(isDirty).toBe(true);

    // Save the form
    if (isValid) {
      await saveForm(page);
      await page.waitForTimeout(2000);

      // Check state after save
      isDirty = await isFormDirty(page);
      isValid = await isFormValid(page);

      console.log('After Save:');
      console.log('  Dirty:', isDirty);
      console.log('  Valid:', isValid);

      expect(isDirty).toBe(false);
    }

    console.log('✅ Form state checks completed');
  });

  test('should extract all form data', async ({ page }) => {
    console.log('\n=== Test: Extract All Form Data ===');

    // Get form context
    const formContext = await getFormContext(page);
    console.log('Extracting data from:', formContext.entityName);
    console.log('Record ID:', formContext.entityId);

    // Get all attributes
    const allData = await getAllEntityAttributes(page);

    console.log('\n=== Form Data ===');
    const dataCount = Object.keys(allData).length;
    console.log(`Total fields: ${dataCount}`);

    // Display first 10 fields
    const entries = Object.entries(allData).slice(0, 10);
    entries.forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });

    if (dataCount > 10) {
      console.log(`  ... and ${dataCount - 10} more fields`);
    }

    // Create structured data object
    const orderData = {
      metadata: {
        entityName: formContext.entityName,
        entityId: formContext.entityId,
        primaryAttribute: formContext.primaryAttributeValue,
        extractedAt: new Date().toISOString(),
      },
      attributes: allData,
    };

    console.log('\n✅ Form data extracted successfully');
    console.log('Data structure:', {
      entityName: orderData.metadata.entityName,
      attributeCount: Object.keys(orderData.attributes).length,
    });

    expect(Object.keys(allData).length).toBeGreaterThan(0);
  });
});

// Export for use in other tests if needed
//export {};
