// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model-Driven App - Direct URL Navigation Test
 *
 * Demonstrates opening a Model-Driven App directly from URL using
 * the baseAppUrl property, switching between grid and form views, and
 * auto-detecting the base URL from the current page.
 *
 * Model-Driven Apps run on *.crm.dynamics.com, which is a different domain
 * from Canvas Apps (apps.powerapps.com) and the Maker Portal (make.powerapps.com).
 * They therefore require a separate authentication step:
 *
 *   npm run auth:mda:headful
 *
 * Storage state is declared once in playwright.config.ts for the
 * `model-driven-app` project.
 *
 * @requires Authentication: npm run auth:mda:headful
 * @requires MODEL_DRIVEN_APP_URL in .env
 */

import { ModelDrivenAppPage } from 'power-platform-playwright-toolkit';
import { test, expect } from '../../../fixtures/mda.fixtures';

const BASE_APP_URL = process.env.MODEL_DRIVEN_APP_URL || process.env.BASE_APP_URL || '';
const ENTITY_NAME = 'nwind_orders';

test.describe.serial('Model-Driven App - Direct URL Navigation', () => {
  test.beforeAll(async () => {
    if (!BASE_APP_URL) {
      throw new Error('MODEL_DRIVEN_APP_URL or BASE_APP_URL environment variable is not set');
    }
  });

  test('should navigate directly to grid view from URL', async ({ modelDrivenApp }) => {
    // Use navigateToGridView which builds an explicit pagetype=entitylist URL (with appid).
    // Navigating to the bare BASE_APP_URL lets D365 restore session state, which can
    // redirect to a broken page if the last-visited page was removed from the app.
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);

    const rowCount = await modelDrivenApp.grid.getRowCount();
    console.log(`Grid loaded with ${rowCount} records`);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should navigate directly to new record form from URL', async ({ page, modelDrivenApp }) => {
    await modelDrivenApp.navigateToFormView(ENTITY_NAME);

    // waitForURL confirms the MDA navigated to a new-record form (pagetype=entityrecord)
    await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });

    const inputFields = page.locator('input[data-id]');
    const fieldCount = await inputFields.count();

    console.log(`Form loaded with ${fieldCount} input fields`);
    expect(fieldCount).toBeGreaterThan(0);
  });

  test('should navigate to grid, open record, and perform operations', async ({
    page,
    modelDrivenApp,
  }) => {
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();

    const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
    console.log(`First order: ${orderNumber}`);

    await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
    await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('pagetype=entityrecord');
    expect(currentUrl).toContain(`etn=${ENTITY_NAME}`);
  });

  test('should switch between grid and form views', async ({ page, modelDrivenApp }) => {
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();
    expect(page.url()).toContain('pagetype=entitylist');

    await modelDrivenApp.navigateToFormView(ENTITY_NAME);
    await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });
    expect(page.url()).toContain('pagetype=entityrecord');

    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();
    expect(page.url()).toContain('pagetype=entitylist');
  });

  test('should use baseAppUrl for multiple entity navigations', async ({ modelDrivenApp }) => {
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();
    expect(modelDrivenApp.page.url()).toContain(ENTITY_NAME);

    const baseUrl = modelDrivenApp.getBaseAppUrl();
    console.log(`Base URL: ${baseUrl}`);
    expect(baseUrl).toBeTruthy();
    expect(baseUrl).toContain('dynamics.com');
  });

  test('should dynamically set baseAppUrl and navigate', async ({ modelDrivenApp }) => {
    const dynamicApp = new ModelDrivenAppPage(modelDrivenApp.page);
    dynamicApp.setBaseAppUrl(BASE_APP_URL);

    expect(dynamicApp.getBaseAppUrl()).toBe(BASE_APP_URL);

    await dynamicApp.navigateToGridView(ENTITY_NAME);
    await dynamicApp.grid.waitForGridLoad();
    expect(dynamicApp.page.url()).toContain('pagetype=entitylist');
  });

  test('should auto-detect baseAppUrl from current page', async ({ modelDrivenApp }) => {
    // Navigate to a known-good entity list page so the current URL is predictable.
    // Using the bare BASE_APP_URL without an explicit pagetype lets D365 restore
    // session state, which can redirect to an error page if a previously-visited
    // page has been removed from the app.
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);

    const autoDetectApp = new ModelDrivenAppPage(modelDrivenApp.page);
    const detectedUrl = autoDetectApp.getBaseAppUrl();
    console.log(`Auto-detected base URL: ${detectedUrl}`);

    expect(detectedUrl).toBeTruthy();
    expect(detectedUrl).toContain('dynamics.com');

    await autoDetectApp.navigateToGridView(ENTITY_NAME);
    await autoDetectApp.grid.waitForGridLoad();
  });
});
