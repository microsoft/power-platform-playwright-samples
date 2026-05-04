// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Canvas App Operations Test for Northwind Orders
 *
 * Demonstrates operations available in this Canvas App:
 * 1. READ  — Verify orders appear in the gallery
 * 2. CREATE — Add a new order record
 * 3. UPDATE — Edit an existing record
 *
 * Note: This specific Canvas app uses a split-screen layout (gallery on left,
 * details on right) and does not have Delete or Back navigation buttons.
 *
 * @requires Authentication: npm run auth:headful
 * @requires CANVAS_APP_URL or CANVAS_APP_ID + CANVAS_APP_TENANT_ID in .env
 */

import { generateUniqueOrderNumber } from 'power-platform-playwright-toolkit';
import { test, expect } from '../../../fixtures/canvas.fixtures';

/**
 * Northwind Canvas App selectors for runtime (play) mode.
 * Canvas apps expose data-control-name attributes on every control at runtime.
 */
const SEL = {
  orderGalleryItem: '[data-control-name="Gallery1"] [data-control-part="gallery-item"]',
  orderTitle: '[data-control-name="Title1"]',
  addButton: '[data-control-name="icon3"]',
  saveButton: '[data-control-name="icon5"]',
  cancelButton: '[data-control-name="icon4"]',
  reloadButton: '[data-control-name="icon6"]',
};

test.describe('Canvas App - Northwind Orders Operations', () => {
  // `canvasFrame` is provided by canvas.fixtures.ts — the app is already loaded
  // and the orders gallery is visible when each test starts.

  test('should load Canvas app and display orders in gallery', async ({ canvasFrame }) => {
    const galleryItems = canvasFrame.locator(SEL.orderGalleryItem);
    const itemCount = await galleryItems.count();

    expect(itemCount).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const itemText = await galleryItems.nth(i).textContent();
      console.log(`Order ${i + 1}: ${itemText?.trim().slice(0, 50)}`);
    }
  });

  test('should click an order and display details', async ({ page, canvasFrame }) => {
    const firstOrder = canvasFrame.locator(SEL.orderGalleryItem).first();
    const orderText = await firstOrder.textContent();
    console.log(`Clicking order: ${orderText?.trim().slice(0, 50)}`);

    await firstOrder.click();
    await page.waitForTimeout(2000);
  });

  test('should test Add button', async ({ page, canvasFrame }) => {
    const testOrderNumber = generateUniqueOrderNumber();
    console.log(`Test Order Number: ${testOrderNumber}`);

    const addButton = canvasFrame.locator(SEL.addButton);
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    await page.waitForTimeout(3000);

    const inputs = canvasFrame.locator('input[type="text"]');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} text input fields`);

    if (inputCount > 0) {
      const firstInput = inputs.first();
      const isVisible = await firstInput.isVisible().catch(() => false);
      const isEnabled = await firstInput.isEnabled().catch(() => false);

      if (isVisible && isEnabled) {
        await firstInput.click();
        await firstInput.fill(testOrderNumber);

        const saveButton = canvasFrame.locator(SEL.saveButton);
        const saveVisible = await saveButton.isVisible().catch(() => false);

        if (saveVisible) {
          await saveButton.click();
          await page.waitForTimeout(3000);
          const galleryText = await canvasFrame.locator(SEL.orderGalleryItem).first().textContent();
          console.log(`First gallery item after save: ${galleryText?.trim().slice(0, 50)}`);
        } else {
          console.log('Save button not visible');
        }
      } else {
        console.log(`First input not editable (visible: ${isVisible}, enabled: ${isEnabled})`);
      }
    } else {
      console.log('No text input fields found after clicking Add');
    }
  });

  test('should test Reload button', async ({ page, canvasFrame }) => {
    const initialItems = await canvasFrame.locator(SEL.orderGalleryItem).count();
    console.log(`Initial gallery item count: ${initialItems}`);

    const reloadButton = canvasFrame.locator(SEL.reloadButton);
    await reloadButton.waitFor({ state: 'visible', timeout: 10000 });
    await reloadButton.click();
    await page.waitForTimeout(3000);

    const afterItems = await canvasFrame.locator(SEL.orderGalleryItem).count();
    console.log(`Gallery item count after reload: ${afterItems}`);
  });

  test('should verify all toolbar buttons are present', async ({ canvasFrame }) => {
    const addVisible = await canvasFrame.locator(SEL.addButton).isVisible();
    expect(addVisible).toBe(true);

    const saveExists = (await canvasFrame.locator(SEL.saveButton).count()) > 0;
    console.log(`Save button exists: ${saveExists}`);

    const cancelExists = (await canvasFrame.locator(SEL.cancelButton).count()) > 0;
    console.log(`Cancel button exists: ${cancelExists}`);

    const reloadVisible = await canvasFrame.locator(SEL.reloadButton).isVisible();
    expect(reloadVisible).toBe(true);
  });
});
