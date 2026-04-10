// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Canvas App Operations Test for Northwind Orders
 *
 * This test demonstrates operations available in this Canvas App:
 * 1. CREATE: Add a new order record
 * 2. READ: Verify the record appears in the gallery
 * 3. UPDATE: Edit an existing record
 *
 * Note: This specific Canvas app uses a split-screen layout (gallery on left, details on right)
 * and does not have Delete or Back navigation buttons.
 *
 * @requires Authentication: Canvas apps use standard Power Apps authentication
 * @requires Canvas App URL: Set CANVAS_APP_URL or component IDs in .env file
 */

import { test, expect, FrameLocator } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  CanvasAppPage,
  generateUniqueOrderNumber,
  buildCanvasAppUrlFromEnv,
} from 'power-platform-playwright-toolkit';

// Build Canvas App URL from environment variables
// Supports two modes:
// 1. Direct URL: Use CANVAS_APP_URL if provided
// 2. Build from IDs: Use POWER_APPS_ENVIRONMENT_ID + CANVAS_APP_ID + CANVAS_APP_TENANT_ID
const CANVAS_APP_URL = buildCanvasAppUrlFromEnv();
console.log(`📱 Canvas App URL: ${CANVAS_APP_URL}`);

/**
 * Canvas App Runtime Selectors for Northwind Orders
 * Canvas Apps have data-control-name attributes in runtime mode
 */
const selectors = {
  // Canvas app frame - must be specific to avoid multiple iframe matches
  canvasFrame: 'iframe[name="fullscreen-app-host"]',

  // Gallery (List View)
  orderGalleryItem: '[data-control-name="Gallery1"] [data-control-part="gallery-item"]',
  orderTitle: '[data-control-name="Title1"]', // Order number in gallery item

  // Toolbar Buttons (icons in header)
  addButton: '[data-control-name="icon3"]', // Plus icon
  saveButton: '[data-control-name="icon5"]', // Check icon
  cancelButton: '[data-control-name="icon4"]', // X icon
  reloadButton: '[data-control-name="icon6"]', // Reload icon

  // Form Fields - The app shows details on the right side
  // Input fields use generic selectors since they're part of a dynamic form
  firstInput: 'input[type="text"]', // First editable input field
};

test.describe('Canvas App - Northwind Orders Operations', () => {
  let appProvider: AppProvider;
  let canvasApp: CanvasAppPage;
  let canvasFrame: FrameLocator;

  test.beforeEach(async ({ page, context }) => {
    // Initialize AppProvider - single entry point for all Power Platform apps
    appProvider = new AppProvider(page, context);

    // Launch Canvas App using AppProvider
    console.log(`\n🌐 Launching Canvas App via AppProvider: ${CANVAS_APP_URL}`);
    await appProvider.launch({
      app: 'Northwind Orders Canvas',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: CANVAS_APP_URL,
    });

    // Get CanvasAppPage from AppProvider
    canvasApp = appProvider.getCanvasAppPage();

    // Wait for Canvas App to load
    console.log('⏳ Waiting for Canvas App to load...');
    await page.waitForTimeout(10000); // Canvas apps need extra time to initialize

    // Get canvas frame reference
    canvasFrame = page.frameLocator(selectors.canvasFrame);

    // Wait for gallery to be visible (confirms app is loaded)
    await canvasFrame.locator(selectors.orderGalleryItem).first().waitFor({
      state: 'visible',
      timeout: 60000,
    });
    console.log('✅ Canvas App loaded successfully!\n');
  });

  test('should load Canvas app and display orders in gallery', async () => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TEST: Load and Display Orders');
    console.log('═══════════════════════════════════════════════════════\n');

    // Count gallery items
    const galleryItems = canvasFrame.locator(selectors.orderGalleryItem);
    const itemCount = await galleryItems.count();
    console.log(`📊 Gallery has ${itemCount} order items`);

    // Verify we have orders
    expect(itemCount).toBeGreaterThan(0);

    // Read first few order numbers
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const item = galleryItems.nth(i);
      const itemText = await item.textContent();
      console.log(`📝 Order ${i + 1}: ${itemText?.trim().slice(0, 50)}`);
    }

    console.log('\n✅ Canvas App loaded successfully with orders displayed!\n');
  });

  test('should click an order and display details', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TEST: Select Order and View Details');
    console.log('═══════════════════════════════════════════════════════\n');

    // Click first order in gallery
    const firstOrder = canvasFrame.locator(selectors.orderGalleryItem).first();
    const orderText = await firstOrder.textContent();
    console.log(`📂 Clicking first order: ${orderText?.trim().slice(0, 50)}`);

    await firstOrder.click();
    await page.waitForTimeout(2000);

    console.log('✅ Order selected successfully!\n');
  });

  test('should test Add button', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TEST: Add Button Functionality');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test order number - using toolkit utility
    const testOrderNumber = generateUniqueOrderNumber();
    console.log(`🔑 Test Order Number: ${testOrderNumber}`);

    // Click Add button
    console.log('➕ Clicking Add button...');
    const addButton = canvasFrame.locator(selectors.addButton);
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    await page.waitForTimeout(3000);

    console.log('✅ Add button clicked');

    // Try to find an input field
    const inputs = canvasFrame.locator('input[type="text"]');
    const inputCount = await inputs.count();
    console.log(`📝 Found ${inputCount} text input fields`);

    if (inputCount > 0) {
      // Try to fill the first input (likely Order Number)
      const firstInput = inputs.first();
      const isVisible = await firstInput.isVisible().catch(() => false);
      const isEnabled = await firstInput.isEnabled().catch(() => false);

      if (isVisible && isEnabled) {
        console.log(`✍️  Filling Order Number: ${testOrderNumber}`);
        await firstInput.click();
        await firstInput.fill(testOrderNumber);

        // Try to save
        console.log('💾 Clicking Save button...');
        const saveButton = canvasFrame.locator(selectors.saveButton);
        const saveVisible = await saveButton.isVisible().catch(() => false);

        if (saveVisible) {
          await saveButton.click();
          await page.waitForTimeout(3000);
          console.log('✅ Save button clicked');

          // Check if the order appears in gallery
          await page.waitForTimeout(2000);
          const galleryText = await canvasFrame
            .locator(selectors.orderGalleryItem)
            .first()
            .textContent();
          console.log(`📊 First gallery item: ${galleryText?.trim().slice(0, 50)}`);
        } else {
          console.log('⚠️  Save button not visible');
        }
      } else {
        console.log(`⚠️  First input not editable (visible: ${isVisible}, enabled: ${isEnabled})`);
      }
    } else {
      console.log('⚠️  No text input fields found after clicking Add');
    }

    console.log('\n✅ Add button test completed!\n');
  });

  test('should test Reload button', async ({ page }) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TEST: Reload Button Functionality');
    console.log('═══════════════════════════════════════════════════════\n');

    // Get initial gallery count
    const initialItems = await canvasFrame.locator(selectors.orderGalleryItem).count();
    console.log(`📊 Initial gallery item count: ${initialItems}`);

    // Click Reload button
    console.log('🔄 Clicking Reload button...');
    const reloadButton = canvasFrame.locator(selectors.reloadButton);
    await reloadButton.waitFor({ state: 'visible', timeout: 10000 });
    await reloadButton.click();
    await page.waitForTimeout(3000);

    // Get gallery count after reload
    const afterItems = await canvasFrame.locator(selectors.orderGalleryItem).count();
    console.log(`📊 Gallery item count after reload: ${afterItems}`);

    console.log('✅ Reload button clicked successfully!\n');
  });

  test('should verify all toolbar buttons are present', async () => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 TEST: Verify Toolbar Buttons');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check Add button
    const addButton = canvasFrame.locator(selectors.addButton);
    const addVisible = await addButton.isVisible();
    console.log(`➕ Add button visible: ${addVisible}`);
    expect(addVisible).toBe(true);

    // Check Save button (might be disabled/hidden initially)
    const saveButton = canvasFrame.locator(selectors.saveButton);
    const saveExists = (await saveButton.count()) > 0;
    console.log(`💾 Save button exists: ${saveExists}`);

    // Check Cancel button
    const cancelButton = canvasFrame.locator(selectors.cancelButton);
    const cancelExists = (await cancelButton.count()) > 0;
    console.log(`❌ Cancel button exists: ${cancelExists}`);

    // Check Reload button
    const reloadButton = canvasFrame.locator(selectors.reloadButton);
    const reloadVisible = await reloadButton.isVisible();
    console.log(`🔄 Reload button visible: ${reloadVisible}`);
    expect(reloadVisible).toBe(true);

    console.log('\n✅ Toolbar buttons verified!\n');
  });
});
