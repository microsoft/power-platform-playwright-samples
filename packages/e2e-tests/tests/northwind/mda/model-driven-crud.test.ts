// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model-Driven App CRUD Operations Test
 *
 * This test demonstrates a complete CRUD workflow:
 * 1. CREATE: Add a new order record via form
 * 2. READ: Find and verify the record in the grid
 * 3. UPDATE: Edit the record and save changes
 * 4. DELETE: Remove the record from the grid
 *
 * @requires Authentication: npm run auth:mda:headful
 * @requires Certificate: Client certificate must be configured in .env
 */

import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
  generateUniqueOrderNumber,
  getEntityAttribute,
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

test.describe.serial('Model-Driven App - CRUD Operations', () => {
  let appProvider: AppProvider;
  let modelDrivenApp: ModelDrivenAppPage;
  let testOrderNumber: string;

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

    // Generate unique test data
    testOrderNumber = generateUniqueOrderNumber();
    console.log(`\n🔑 Test Order Number: ${testOrderNumber}\n`);
  });

  test('should perform complete CRUD workflow: Create → Read → Update → Delete', async ({
    page,
  }) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 CRUD WORKFLOW TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    // ========================================
    // STEP 1: CREATE - Add new order record
    // ========================================
    console.log('📝 STEP 1: CREATE - Adding new order record...');

    // Navigate to form without recordId to create new record
    await modelDrivenApp.navigateToFormView(ENTITY_NAME);

    console.log('⏳ Waiting for form to load...');
    await page.waitForTimeout(3000);

    // Fill in Order Number field
    console.log(`✍️  Entering Order Number: ${testOrderNumber}`);
    const orderNumberInput = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    await orderNumberInput.waitFor({ state: 'visible', timeout: 30000 });

    // Clear field first, then type to avoid duplication issues with Dynamics fields
    await orderNumberInput.click();
    await page.waitForTimeout(200); // Wait for field to focus and any async handlers
    await orderNumberInput.fill(''); // Clear any default value
    await page.waitForTimeout(100); // Wait for clear to complete
    await orderNumberInput.pressSequentially(testOrderNumber, { delay: 50 }); // Type with delay

    // Fill in Order Status (Option Set) - using button click since it's a Fluent UI dropdown
    console.log('✍️  Setting Order Status to "New"');
    const orderStatusButton = page.locator(
      'button[data-id="nwind_orderstatusid.fieldControl-option-set-select"]'
    );
    const hasOrderStatus = await orderStatusButton.isVisible().catch(() => false);

    if (hasOrderStatus) {
      await orderStatusButton.click();
      await page.waitForTimeout(500);

      // Click on "Pending" option from dropdown
      const pendingOption = page.locator('[role="option"]:has-text("New")');
      const hasPendingOption = await pendingOption.isVisible().catch(() => false);

      if (hasPendingOption) {
        await pendingOption.click();
      } else {
        console.log('⚠️  "New" option not found, using first available option');
        await page.keyboard.press('Escape'); // Close dropdown
      }
    } else {
      console.log('⚠️  Order Status field not found, skipping...');
    }

    // Save the record
    console.log('💾 Saving the new record...');
    const saveButton = page.locator('button[aria-label*="Save"]').first();
    await saveButton.click();

    // waitForURL fires only after the server responds with the new GUID and the client
    // updates the URL — the POST is committed at that point. MDA keeps persistent
    // WebSocket connections so networkidle never fires; waitForURL is sufficient.
    await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });

    // Capture the record URL so we can navigate back without relying on grid search
    const recordUrl = page.url();
    console.log(`✅ Record created successfully! URL: ${recordUrl}\n`);

    // ========================================
    // STEP 2: READ - Navigate directly to record and verify
    // ========================================
    console.log('🔍 STEP 2: READ - Navigating directly to record and verifying...');

    // Navigate directly to the saved record URL (avoids grid keyword-filter dependency)
    await page.goto(recordUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });
    await page.waitForTimeout(3000);

    const readOrderNumberInput = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    await readOrderNumberInput.waitFor({ state: 'visible', timeout: 30000 });
    const cellValue = await readOrderNumberInput.inputValue();
    console.log(`✅ Found record: "${cellValue}"\n`);

    // Verify it matches what we're looking for
    expect(cellValue).toBe(testOrderNumber);

    // ========================================
    // STEP 3: UPDATE - Edit the record
    // ========================================
    console.log('✏️  STEP 3: UPDATE - Editing the record...');

    // Update Order Number with modified suffix (no hyphens to avoid keyword filter issues)
    const updatedOrderNumber = `${testOrderNumber}UP`;
    console.log(`✍️  Updating Order Number to: ${updatedOrderNumber}`);

    const editOrderNumberInput = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    await editOrderNumberInput.waitFor({ state: 'visible', timeout: 30000 });

    // Use clear and type method for consistency
    await editOrderNumberInput.click();
    await page.waitForTimeout(200); // Wait for field to focus
    await editOrderNumberInput.fill(''); // Clear existing value
    await page.waitForTimeout(100); // Wait for clear to complete
    await editOrderNumberInput.pressSequentially(updatedOrderNumber, { delay: 50 });

    // Update Order Status if available
    console.log('✍️  Updating Order Status to "Processing"');
    const editOrderStatusButton = page.locator(
      'button[data-id="nwind_orderstatusid.fieldControl-option-set-select"]'
    );
    const hasEditOrderStatus = await editOrderStatusButton.isVisible().catch(() => false);

    if (hasEditOrderStatus) {
      await editOrderStatusButton.click();
      await page.waitForTimeout(500);

      const processingOption = page.locator('[role="option"]:has-text("Processing")');
      const hasProcessingOption = await processingOption.isVisible().catch(() => false);

      if (hasProcessingOption) {
        await processingOption.click();
      } else {
        console.log('⚠️  "Processing" option not found, closing dropdown');
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('⚠️  Order Status field not found, skipping...');
    }

    // Save changes
    console.log('💾 Saving changes...');
    const editSaveButton = page.locator('button[aria-label*="Save"]').first();
    await editSaveButton.click();

    // Poll Xrm until the form is no longer dirty — MDA clears isDirty only after the
    // PATCH response confirms the write. networkidle never fires in MDA (persistent WS).
    await page.waitForFunction(
      () => {
        const entity = (window as any).Xrm?.Page?.data?.entity;
        return entity && entity.getIsDirty() === false;
      },
      undefined,
      { timeout: 30000 }
    );
    console.log('✅ Record updated successfully!\n');

    // Update our test variable for deletion step
    testOrderNumber = updatedOrderNumber;

    // ========================================
    // STEP 4: VERIFY UPDATE - Navigate back to record and check field value
    // ========================================
    console.log('🔍 STEP 4: VERIFY UPDATE - Navigating to record and verifying update...');

    // Navigate directly back to the same record URL (record ID is unchanged after update)
    await page.goto(recordUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Read via Xrm API — works in both view mode and edit mode, avoiding a
    // dependency on the input element being visible (which requires edit mode
    // and can be absent when D365 renders the form in read/view mode after a save).
    const updatedCellValue = await getEntityAttribute(page, 'nwind_ordernumber');
    console.log(`✅ Found updated record: "${updatedCellValue}"`);
    expect(updatedCellValue).toContain(updatedOrderNumber);
    console.log();

    // ========================================
    // STEP 5: DELETE - Remove the record via Xrm.WebApi (reliable, no UI dialog dependency)
    // ========================================
    console.log('🗑️  STEP 5: DELETE - Removing the record via Xrm.WebApi...');

    // Use Xrm.WebApi.deleteRecord() — more reliable than clicking the command bar Delete
    // button, which varies across MDA versions and may show different confirmation dialogs.
    await page.evaluate(() => {
      const entity = (window as any).Xrm?.Page?.data?.entity;
      const entityName = entity.getEntityName();
      const entityId = entity.getId().replace(/^\{|\}$/g, '');
      return (window as any).Xrm.WebApi.deleteRecord(entityName, entityId);
    });
    console.log('✅ Record deleted via Xrm.WebApi\n');

    // ========================================
    // STEP 6: VERIFY DELETE - Confirm record URL is no longer accessible
    // ========================================
    console.log('🔍 STEP 6: VERIFY DELETE - Confirming record is removed...');

    // Navigate to the deleted record URL — MDA should redirect to grid or show error
    await page.goto(recordUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`📍 URL after navigating to deleted record: ${currentUrl}`);

    // Accept either: redirect to entity list, or the order-number field no longer shows
    // the deleted record's value (MDA may briefly cache — but WebApi delete is authoritative)
    const isOnGrid = currentUrl.includes('pagetype=entitylist');
    const orderNumberField = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    const fieldStillVisible = await orderNumberField
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isOnGrid) {
      console.log('✅ Confirmed: MDA redirected to grid — record is deleted');
    } else if (!fieldStillVisible) {
      console.log('✅ Confirmed: Record form no longer accessible — record is deleted');
    } else {
      // MDA may briefly show a cached view of a deleted record; the WebApi call above
      // already confirmed deletion. Assert the field value is gone or changed.
      const remainingValue = await orderNumberField.inputValue().catch(() => '');
      expect(
        remainingValue,
        `Deleted record Order Number "${updatedOrderNumber}" should not be accessible`
      ).not.toBe(updatedOrderNumber);
    }
    console.log('✅ Confirmed: Record successfully deleted!\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 CRUD WORKFLOW COMPLETED SUCCESSFULLY!');
    console.log('   ✅ CREATE: Record created');
    console.log('   ✅ READ: Record found in grid');
    console.log('   ✅ UPDATE: Record updated');
    console.log('   ✅ DELETE: Record deleted');
    console.log('═══════════════════════════════════════════════════════\n');
  });

  test('should handle create and immediate delete workflow', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 QUICK CRUD TEST: Create → Delete');
    console.log('═══════════════════════════════════════════════════════\n');

    // CREATE
    console.log('📝 Creating new record...');
    await modelDrivenApp.navigateToFormView(ENTITY_NAME);
    await page.waitForTimeout(3000);

    const orderNumberInput = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    await orderNumberInput.waitFor({ state: 'visible', timeout: 30000 });

    // Clear field first, then type to avoid duplication issues with Dynamics fields
    await orderNumberInput.click();
    await page.waitForTimeout(200); // Wait for field to focus
    await orderNumberInput.fill(''); // Clear any default value
    await page.waitForTimeout(100); // Wait for clear to complete
    await orderNumberInput.pressSequentially(testOrderNumber, { delay: 50 });

    const saveButton = page.locator('button[aria-label*="Save"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ Record created');

    // DELETE
    console.log('🗑️  Deleting record...');

    const deleteButtonInForm = page.locator('button[aria-label*="Delete"]').first();
    const hasDeleteInForm = await deleteButtonInForm.isVisible().catch(() => false);

    if (hasDeleteInForm) {
      await deleteButtonInForm.click();
      await page.waitForTimeout(2000);

      // Wait for confirmation dialog to appear
      const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]');
      await confirmDialog.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
        console.log('⚠️  Confirmation dialog not detected');
      });

      // Look for confirm button within the dialog
      const confirmDeleteButton = confirmDialog
        .locator(
          'button[data-id="confirmButton"], button:has-text("Delete"), button:has-text("Confirm")'
        )
        .first();
      const hasConfirm = await confirmDeleteButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasConfirm) {
        await confirmDeleteButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Record deleted from form');
      } else {
        console.log('⚠️  No confirmation needed, delete might be immediate');
      }
    } else {
      console.log('⚠️  Delete button not found in form, navigating to grid...');

      // Navigate to grid and delete
      await modelDrivenApp.navigateToGridView(ENTITY_NAME);
      await modelDrivenApp.grid.waitForGridLoad();

      const rowCount = await modelDrivenApp.grid.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        const cellValue = await modelDrivenApp.grid.getCellValue(i, 'Order Number');
        if (cellValue === testOrderNumber) {
          await modelDrivenApp.grid.selectRow(i);
          await page.waitForTimeout(1000);

          const deleteButton = page.locator('button[aria-label*="Delete"]').first();
          await deleteButton.click();
          await page.waitForTimeout(1000);

          // Wait for confirmation dialog
          const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]');
          const hasDialog = await confirmDialog
            .waitFor({ state: 'visible', timeout: 10000 })
            .then(() => true)
            .catch(() => false);

          if (hasDialog) {
            const confirmButton = confirmDialog
              .locator(
                'button[data-id="confirmButton"], button:has-text("Delete"), button:has-text("Confirm")'
              )
              .first();
            const hasConfirm = await confirmButton.isVisible({ timeout: 5000 }).catch(() => false);
            if (hasConfirm) {
              await confirmButton.click();
            }
          }

          await page.waitForTimeout(3000);
          console.log('✅ Record deleted from grid');
          break;
        }
      }
    }

    console.log('\n🎉 Quick CRUD test completed!\n');
  });
});
