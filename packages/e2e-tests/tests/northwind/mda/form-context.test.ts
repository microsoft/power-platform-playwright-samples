// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * FormContext API Test for Northwind Model-Driven App
 *
 * Demonstrates using the FormContext API to interact with Model-Driven App
 * forms programmatically via the Xrm client API.
 *
 * @requires Authentication: npm run auth:mda:headful
 * @requires MODEL_DRIVEN_APP_URL in .env
 */

import {
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
import { test, expect } from '../../../fixtures/mda.fixtures';

const ENTITY_NAME = 'nwind_orders';

test.describe.serial('FormContext API - Northwind Orders', () => {
  // beforeEach uses the modelDrivenApp fixture (already launched) to navigate to the
  // grid and find a writable (non-inactive) record before each test.
  test.beforeEach(async ({ page, modelDrivenApp }) => {
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();

    // Dynamics 365 does not bind Xrm attributes for inactive/closed records.
    // Try up to 5 rows to find one whose attributes collection is populated and the
    // form is in a valid (editable) state.
    let editableRecordFound = false;
    for (let row = 0; row < 5; row++) {
      console.log(`Opening record at row ${row}...`);
      await modelDrivenApp.grid.openRecord({ rowNumber: row });
      await page.waitForURL(/pagetype=entityrecord/, { timeout: 15_000 });
      await page.waitForTimeout(2_000); // brief pause for Xrm to initialize after navigation

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
        if (count === 0) return false; // inactive record — no attribute bindings
        try {
          return entity.isValid() === true;
        } catch {
          return false;
        }
      });

      if (isWritable) {
        console.log(`Found writable record at row ${row}`);
        editableRecordFound = true;
        break;
      }

      console.log(`Row ${row} not writable — trying next row...`);
      await modelDrivenApp.navigateToGridView(ENTITY_NAME);
      await modelDrivenApp.grid.waitForGridLoad();
    }

    if (!editableRecordFound) {
      throw new Error(
        'No writable order record found in the first 5 rows. ' +
          'Ensure there are active Northwind Orders with no pre-existing validation errors.'
      );
    }
  });

  test('should get form context information', async ({ page }) => {
    const formContext = await getFormContext(page);

    console.log('Entity Name:', formContext.entityName);
    console.log('Entity ID:', formContext.entityId);
    console.log('Primary Attribute:', formContext.primaryAttributeValue);
    console.log('Is Dirty:', formContext.isDirty);
    console.log('Is Valid:', formContext.isValid);
    console.log('Number of Attributes:', formContext.attributeNames.length);

    expect(formContext.entityName).toBe(ENTITY_NAME);
    expect(formContext.entityId).toBeTruthy();
    expect(formContext.entityId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(formContext.attributeNames.length).toBeGreaterThan(0);
  });

  test('should read attribute values', async ({ page }) => {
    const formContext = await getFormContext(page);
    console.log('Available fields:', formContext.attributeNames);

    try {
      const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
      console.log('Order Number:', orderNumber);
      expect(orderNumber).toBeTruthy();
    } catch {
      console.log('Order Number field not found or empty');
    }

    try {
      const statusCode = await getEntityAttribute(page, 'statuscode');
      console.log('Status Code:', statusCode);
      expect(statusCode).toBeDefined();
    } catch {
      console.log('Status Code field not found');
    }

    const allData = await getAllEntityAttributes(page);
    console.log(`Retrieved ${Object.keys(allData).length} attributes`);
    expect(Object.keys(allData).length).toBeGreaterThan(0);
  });

  test('should update and save attribute values', async ({ page }) => {
    const initialFormContext = await getFormContext(page);
    console.log('Initial form dirty state:', initialFormContext.isDirty);

    let currentOrderNumber: string;
    try {
      currentOrderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
      console.log('Current Order Number:', currentOrderNumber);
    } catch {
      currentOrderNumber = 'N/A';
    }

    const newOrderNumber = generateUniqueOrderNumber();
    console.log(`Updating Order Number to: ${newOrderNumber}`);
    await setEntityAttribute(page, 'nwind_ordernumber', newOrderNumber);

    await page.waitForTimeout(500);
    const isDirty = await isFormDirty(page);
    expect(isDirty).toBe(true);

    const isValid = await isFormValid(page);
    if (isValid) {
      await saveForm(page);
      await page.waitForTimeout(2000);

      const isDirtyAfterSave = await isFormDirty(page);
      expect(isDirtyAfterSave).toBe(false);

      const savedOrderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
      console.log('Saved Order Number:', savedOrderNumber);
      expect(savedOrderNumber).toBe(newOrderNumber);
    } else {
      console.log('Form has validation errors, skipping save');
      await page.screenshot({ path: 'form-validation-errors.png' });
    }
  });

  test('should execute custom Xrm code', async ({ page }) => {
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

    try {
      await executeInFormContext(page, (Xrm) => {
        Xrm.Page.ui.setFormNotification(
          'FormContext API test is running',
          'INFO',
          'playwright-test-notification'
        );
      });
      await page.waitForTimeout(2000);
      await executeInFormContext(page, (Xrm) => {
        Xrm.Page.ui.clearFormNotification('playwright-test-notification');
      });
    } catch (error) {
      // setFormNotification can throw "Container does not exist" in certain form states
      console.log('Form notification skipped (UI container not ready):', (error as Error).message);
    }
  });

  test('should handle form state checks', async ({ page }) => {
    let isDirty = await isFormDirty(page);
    let isValid = await isFormValid(page);

    console.log('Initial — Dirty:', isDirty, '| Valid:', isValid);
    expect(isValid).toBe(true);

    await setEntityAttribute(page, 'nwind_ordernumber', generateUniqueOrderNumber());
    await page.waitForTimeout(500);

    isDirty = await isFormDirty(page);
    isValid = await isFormValid(page);
    console.log('After change — Dirty:', isDirty, '| Valid:', isValid);
    expect(isDirty).toBe(true);

    if (isValid) {
      await saveForm(page);
      await page.waitForTimeout(2000);

      isDirty = await isFormDirty(page);
      isValid = await isFormValid(page);
      console.log('After save — Dirty:', isDirty, '| Valid:', isValid);
      expect(isDirty).toBe(false);
    }
  });

  test('should extract all form data', async ({ page }) => {
    const formContext = await getFormContext(page);
    console.log('Extracting data from:', formContext.entityName);
    console.log('Record ID:', formContext.entityId);

    const allData = await getAllEntityAttributes(page);
    const dataCount = Object.keys(allData).length;
    console.log(`Total fields: ${dataCount}`);

    Object.entries(allData)
      .slice(0, 10)
      .forEach(([key, value]) => console.log(`  ${key}:`, value));

    if (dataCount > 10) console.log(`  ... and ${dataCount - 10} more fields`);

    expect(dataCount).toBeGreaterThan(0);
  });
});
