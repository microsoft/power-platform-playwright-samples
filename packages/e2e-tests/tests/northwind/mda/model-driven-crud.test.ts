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

test.describe('Model-Driven App - CRUD Operations', () => {
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

    // Wait for save to complete
    await page.waitForTimeout(3000);
    console.log('✅ Record created successfully!\n');

    // ========================================
    // STEP 2: READ - Find record in grid
    // ========================================
    console.log('🔍 STEP 2: READ - Finding record in grid...');

    // Navigate to grid view (this will show the newly created record)
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);

    console.log('⏳ Waiting for grid to load...');
    await modelDrivenApp.grid.waitForGridLoad();

    // Filter grid by order number to find the record
    console.log(`🔎 Filtering grid for order: ${testOrderNumber}`);
    await modelDrivenApp.grid.filterByKeyword(testOrderNumber);
    await modelDrivenApp.grid.waitForGridLoad();

    // After filtering, the record should be in the grid (if it exists)
    const rowCount = await modelDrivenApp.grid.getRowCount();
    console.log(`📊 Filtered grid has ${rowCount} row(s)`);

    // Verify at least one record found
    expect(
      rowCount,
      `Record with Order Number "${testOrderNumber}" should exist in filtered grid`
    ).toBeGreaterThan(0);

    // Get the first row (should be our record)
    const foundRow = 0;
    const cellValue = await modelDrivenApp.grid.getCellValue(foundRow, 'Order Number');
    console.log(`✅ Found record: "${cellValue}"\n`);

    // Verify it matches what we're looking for
    expect(cellValue).toBe(testOrderNumber);

    // ========================================
    // STEP 3: UPDATE - Edit the record
    // ========================================
    console.log('✏️  STEP 3: UPDATE - Editing the record...');

    // Open the record from grid
    console.log(`📂 Opening record at row ${foundRow}...`);
    await modelDrivenApp.grid.openRecord({ rowNumber: foundRow });

    console.log('⏳ Waiting for form to load...');
    await page.waitForTimeout(3000);

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

    await page.waitForTimeout(3000);
    console.log('✅ Record updated successfully!\n');

    // Verify update persisted by checking field value on the form (before navigating away)
    const savedOrderNumber = await page
      .locator('input[data-id="nwind_ordernumber.fieldControl-text-box-text"]')
      .inputValue()
      .catch(() => '');
    console.log(`✅ Form shows updated Order Number: "${savedOrderNumber}"`);
    expect(savedOrderNumber).toContain(updatedOrderNumber);

    // Update our test variable for deletion step
    testOrderNumber = updatedOrderNumber;

    // ========================================
    // STEP 4: VERIFY UPDATE - Check in grid
    // ========================================
    console.log('🔍 STEP 4: VERIFY UPDATE - Checking updated record in grid...');

    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();

    // Filter by the updated order number
    console.log(`🔎 Filtering grid for updated order: ${testOrderNumber}`);
    await modelDrivenApp.grid.filterByKeyword(testOrderNumber);
    await modelDrivenApp.grid.waitForGridLoad();

    const updatedRowCount = await modelDrivenApp.grid.getRowCount();
    console.log(`📊 Filtered grid has ${updatedRowCount} row(s)`);

    expect(
      updatedRowCount,
      `Updated record with Order Number "${updatedOrderNumber}" should exist in filtered grid`
    ).toBeGreaterThan(0);

    const updatedFoundRow = 0;
    const updatedCellValue = await modelDrivenApp.grid.getCellValue(
      updatedFoundRow,
      'Order Number'
    );
    console.log(`✅ Found updated record: "${updatedCellValue}"`);
    expect(updatedCellValue).toContain(testOrderNumber);
    console.log();

    // ========================================
    // STEP 5: DELETE - Remove the record
    // ========================================
    console.log('🗑️  STEP 5: DELETE - Removing the record...');

    // Select the row
    console.log(`☑️  Selecting row ${updatedFoundRow}...`);
    await modelDrivenApp.grid.selectRow(updatedFoundRow);
    await page.waitForTimeout(1000);

    // Click Delete button in command bar
    console.log('🗑️  Clicking Delete button...');
    const deleteButton = page.locator('button[aria-label*="Delete"]').first();
    await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
    await deleteButton.click();

    // Confirm deletion in dialog
    console.log('⏳ Waiting for confirmation dialog...');
    await page.waitForTimeout(1000);

    // Wait for confirmation dialog to appear
    const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]');
    const hasDialog = await confirmDialog
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (hasDialog) {
      // Look for confirm button within the dialog
      const confirmDeleteButton = confirmDialog
        .locator(
          'button[data-id="confirmButton"], button:has-text("Delete"), button:has-text("Confirm")'
        )
        .first();
      const hasConfirmButton = await confirmDeleteButton
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (hasConfirmButton) {
        console.log('✅ Confirming deletion...');
        await confirmDeleteButton.click();
      } else {
        console.log('⚠️  Confirmation button not found in dialog');
      }
    } else {
      console.log('⚠️  Confirmation dialog not found, deletion might be immediate');
    }

    // Wait for deletion to complete
    await page.waitForTimeout(3000);
    console.log('✅ Record deleted successfully!\n');

    // ========================================
    // STEP 6: VERIFY DELETE - Check record is gone
    // ========================================
    console.log('🔍 STEP 6: VERIFY DELETE - Confirming record is removed...');

    // Navigate to grid and clear any filters
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();

    // Try to filter by the deleted order number
    console.log(`🔎 Searching for deleted order ${updatedOrderNumber}...`);
    await modelDrivenApp.grid.filterByKeyword(updatedOrderNumber);
    await modelDrivenApp.grid.waitForGridLoad();

    const finalRowCount = await modelDrivenApp.grid.getRowCount();
    console.log(`📊 Filtered grid has ${finalRowCount} row(s)`);

    // Verify no records found (record was deleted)
    expect(
      finalRowCount,
      `Deleted record with Order Number "${updatedOrderNumber}" should NOT exist`
    ).toBe(0);
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
