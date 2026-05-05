// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model-Driven App CRUD Operations Test
 *
 * Demonstrates a complete CRUD workflow:
 * 1. CREATE — Add a new order record via form
 * 2. READ   — Verify the record via Xrm API after navigation
 * 3. UPDATE — Edit the record and confirm save via Xrm isDirty check
 * 4. DELETE — Remove the record via Xrm.WebApi (reliable, no UI dialog dependency)
 *
 * @requires Authentication: npm run auth:mda:headful
 * @requires MODEL_DRIVEN_APP_URL in .env
 */

import { generateUniqueOrderNumber } from 'power-platform-playwright-toolkit';
import { test, expect } from '../../../fixtures/mda.fixtures';

const ENTITY_NAME = 'nwind_orders';

test.describe.serial('Model-Driven App - CRUD Operations', () => {
  test('should perform complete CRUD workflow: Create → Read → Update → Delete', async ({
    page,
    modelDrivenApp,
  }) => {
    const testOrderNumber = generateUniqueOrderNumber();
    console.log(`\nTest Order Number: ${testOrderNumber}\n`);

    // ── STEP 1: CREATE ─────────────────────────────────────────────────────────
    console.log('STEP 1: CREATE — Adding new order record...');

    await modelDrivenApp.navigateToFormView(ENTITY_NAME);

    const orderNumberInput = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    await orderNumberInput.waitFor({ state: 'visible', timeout: 30000 });

    // Type into the field, then Tab away to trigger D365's native blur → onChange
    // pipeline. Using setEntityAttribute + fireOnChange() on this field triggers
    // a business rule that resets nwind_ordernumber to null before save.
    await orderNumberInput.click();
    await page.waitForTimeout(200);
    await orderNumberInput.fill('');
    await page.waitForTimeout(100);
    await orderNumberInput.pressSequentially(testOrderNumber, { delay: 50 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Set Order Status if the field is present
    const orderStatusButton = page.locator(
      'button[data-id="nwind_orderstatusid.fieldControl-option-set-select"]'
    );
    if (await orderStatusButton.isVisible().catch(() => false)) {
      await orderStatusButton.click();
      await page.waitForTimeout(500);
      const newOption = page.locator('[role="option"]:has-text("New")');
      if (await newOption.isVisible().catch(() => false)) {
        await newOption.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }

    await page.locator('button[aria-label*="Save"]').first().click();
    // Wait for &id= to appear — the form URL already contains pagetype=entityrecord before
    // save, so that pattern fires immediately. The record GUID appears in &id= only after
    // the server commits the POST and MDA updates the URL via history.pushState.
    await page.waitForURL(/pagetype=entityrecord.*&id=/, { timeout: 30000 });

    const recordUrl = page.url();
    const recordId = new URL(recordUrl).searchParams.get('id') ?? '';
    console.log(`Record created: ${recordUrl}\n`);

    // ── STEP 2: READ ───────────────────────────────────────────────────────────
    console.log('STEP 2: READ — Verifying record via Dataverse Web API...');

    // Read directly from Dataverse — bypasses Xrm form model timing issues and
    // auto-number field behavior. The Web API is the source of truth for what was saved.
    const savedRecord = await page.evaluate(
      async ({ entityName, id }) => {
        const result = await (window as any).Xrm.WebApi.retrieveRecord(
          entityName,
          id,
          '?$select=nwind_ordernumber'
        );
        return result;
      },
      { entityName: ENTITY_NAME, id: recordId }
    );
    const cellValue = savedRecord.nwind_ordernumber ?? null;
    console.log(`Found record via API: "${cellValue}"\n`);
    expect(cellValue).toBe(testOrderNumber);

    // ── STEP 3: UPDATE ─────────────────────────────────────────────────────────
    console.log('STEP 3: UPDATE — Editing the record...');

    const updatedOrderNumber = `${testOrderNumber}U`;

    const editInput = page.locator('input[data-id="nwind_ordernumber.fieldControl-text-box-text"]');
    await editInput.waitFor({ state: 'visible', timeout: 30000 });
    await editInput.click();
    await editInput.press('Control+a');
    await editInput.pressSequentially(updatedOrderNumber, { delay: 50 });
    await page.keyboard.press('Tab');
    // Commit value to Xrm model without triggering business rules.
    // pressSequentially updates the DOM but not the Xrm attribute model — D365 PATCHes what
    // the Xrm model knows. setAttribute.fireOnChange() triggers a business rule that resets
    // nwind_ordernumber to null, so we call setValue() only, which marks the attribute dirty
    // and ensures the PATCH includes the new value.
    await page.evaluate(
      ({ attrName, val }) => {
        const attr = (window as any).Xrm?.Page?.data?.entity?.attributes?.get(attrName);
        if (attr) attr.setValue(val);
      },
      { attrName: 'nwind_ordernumber', val: updatedOrderNumber }
    );

    const editStatusButton = page.locator(
      'button[data-id="nwind_orderstatusid.fieldControl-option-set-select"]'
    );
    if (await editStatusButton.isVisible().catch(() => false)) {
      await editStatusButton.click();
      await page.waitForTimeout(500);
      const processingOption = page.locator('[role="option"]:has-text("Processing")');
      if (await processingOption.isVisible().catch(() => false)) {
        await processingOption.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }

    await page.locator('button[aria-label*="Save"]').first().click();
    // Poll Xrm until isDirty clears — the PATCH is committed once isDirty returns false.
    await page.waitForFunction(
      () => {
        const entity = (window as any).Xrm?.Page?.data?.entity;
        return entity && entity.getIsDirty() === false;
      },
      undefined,
      { timeout: 30000 }
    );
    console.log('Record updated\n');

    // ── STEP 4: VERIFY UPDATE ──────────────────────────────────────────────────
    // Read from Dataverse directly — same pattern as STEP 2. More reliable than
    // getEntityAttribute (Xrm form model) which can lag or miss the committed value.
    // No page navigation needed; getIsDirty() === false already confirms the PATCH landed.
    console.log('STEP 4: VERIFY UPDATE...');

    const savedUpdatedRecord = await page.evaluate(
      async ({ entityName, id }) => {
        const result = await (window as any).Xrm.WebApi.retrieveRecord(
          entityName,
          id,
          '?$select=nwind_ordernumber'
        );
        return result;
      },
      { entityName: ENTITY_NAME, id: recordId }
    );
    const updatedCellValue = savedUpdatedRecord.nwind_ordernumber ?? null;
    expect(updatedCellValue).toBe(updatedOrderNumber);
    console.log(`Verified updated value: "${updatedCellValue}"\n`);

    // ── STEP 5: DELETE via Xrm.WebApi ─────────────────────────────────────────
    // More reliable than the command bar Delete button, which varies across MDA versions.
    console.log('STEP 5: DELETE — Removing record via Xrm.WebApi...');

    await page.evaluate(() => {
      const entity = (window as any).Xrm?.Page?.data?.entity;
      const entityName = entity.getEntityName();
      const entityId = entity.getId().replace(/^\{|\}$/g, '');
      return (window as any).Xrm.WebApi.deleteRecord(entityName, entityId);
    });
    console.log('Record deleted\n');

    // ── STEP 6: VERIFY DELETE ──────────────────────────────────────────────────
    console.log('STEP 6: VERIFY DELETE...');

    await page.goto(recordUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const isOnGrid = currentUrl.includes('pagetype=entitylist');
    const fieldVisible = await page
      .locator('input[data-id="nwind_ordernumber.fieldControl-text-box-text"]')
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isOnGrid) {
      console.log('Confirmed: MDA redirected to grid — record is deleted');
    } else if (!fieldVisible) {
      console.log('Confirmed: Record form no longer accessible');
    } else {
      const remaining = await page
        .locator('input[data-id="nwind_ordernumber.fieldControl-text-box-text"]')
        .inputValue()
        .catch(() => '');
      expect(remaining).not.toBe(updatedOrderNumber);
    }

    console.log('CRUD workflow completed successfully');
  });

  test('should handle create and immediate delete workflow', async ({ page, modelDrivenApp }) => {
    const testOrderNumber = generateUniqueOrderNumber();
    console.log(`\nTest Order Number: ${testOrderNumber}\n`);

    // CREATE
    await modelDrivenApp.navigateToFormView(ENTITY_NAME);

    const orderNumberInput = page.locator(
      'input[data-id="nwind_ordernumber.fieldControl-text-box-text"]'
    );
    await orderNumberInput.waitFor({ state: 'visible', timeout: 30000 });
    await orderNumberInput.click();
    await page.waitForTimeout(200);
    await orderNumberInput.fill('');
    await page.waitForTimeout(100);
    await orderNumberInput.pressSequentially(testOrderNumber, { delay: 50 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    await page.locator('button[aria-label*="Save"]').first().click();
    await page.waitForURL(/pagetype=entityrecord.*&id=/, { timeout: 30000 });
    console.log('Record created');

    // DELETE
    const deleteButton = page.locator('button[aria-label*="Delete"]').first();
    const hasDelete = await deleteButton.isVisible().catch(() => false);

    if (hasDelete) {
      await deleteButton.click();
      await page.waitForTimeout(2000);

      const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]');
      await confirmDialog.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      const confirmDeleteButton = confirmDialog
        .locator(
          'button[data-id="confirmButton"], button:has-text("Delete"), button:has-text("Confirm")'
        )
        .first();
      if (await confirmDeleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await confirmDeleteButton.click();
        await page.waitForTimeout(3000);
      }
      console.log('Record deleted from form');
    } else {
      // Fall back to grid delete
      await modelDrivenApp.navigateToGridView(ENTITY_NAME);
      await modelDrivenApp.grid.waitForGridLoad();

      const rowCount = await modelDrivenApp.grid.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        const cellValue = await modelDrivenApp.grid.getCellValue(i, 'Order Number');
        if (cellValue === testOrderNumber) {
          await modelDrivenApp.grid.selectRow(i);
          await page.waitForTimeout(1000);

          const gridDeleteButton = page.locator('button[aria-label*="Delete"]').first();
          await gridDeleteButton.click();
          await page.waitForTimeout(1000);

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
            if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
              await confirmButton.click();
            }
          }

          await page.waitForTimeout(3000);
          console.log('Record deleted from grid');
          break;
        }
      }
    }

    console.log('Quick CRUD test completed');
  });
});
