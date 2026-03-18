/**
 * Model-Driven App - Direct URL Navigation Test
 * Demonstrates opening Model-Driven app directly from URL using baseAppUrl property
 *
 * ## Authentication Architecture
 *
 * Model-Driven Apps (Dynamics 365) require SEPARATE certificate-based authentication
 * because they run on a different domain (*.crm.dynamics.com) than Power Apps maker
 * portal (make.powerapps.com) or Canvas Apps (apps.powerapps.com).
 *
 * ### Why Separate Authentication?
 *
 * 1. **Domain Difference**:
 *    - Power Apps / Canvas Apps: make.powerapps.com, apps.powerapps.com
 *    - Model-Driven Apps: org.crm.dynamics.com (DIFFERENT domain family)
 *
 * 2. **Authentication Method**:
 *    - Power Apps / Canvas Apps: MSAL (Microsoft Authentication Library) with OAuth
 *    - Model-Driven Apps: Certificate-based authentication at TLS layer
 *
 * 3. **Certificate Requirement**:
 *    - Model-Driven Apps require client certificate presented during TLS handshake
 *    - Uses certauth.login.microsoftonline.com endpoint
 *    - Certificate auth is handled via Playwright route interception
 *
 * ### Storage States
 *
 * - Base: `.playwright-ms-auth/state-{email}.json` (Power Apps/Canvas Apps)
 * - MDA: `.playwright-ms-auth/state-mda-{email}.json` (Model-Driven Apps)
 *
 * ### Automatic Certificate Authentication
 *
 * The `ModelDrivenAppPage` constructor automatically enables certificate authentication:
 *
 * ```typescript
 * // Certificate auth is automatic in constructor!
 * const modelDrivenApp = new ModelDrivenAppPage(page, baseAppUrl);
 *
 * // No manual cert auth setup needed
 * await page.goto(baseAppUrl);
 * ```
 *
 * ### Prerequisites
 *
 * 1. **Authenticate to Model-Driven App**:
 *    ```bash
 *    npm run auth:mda:headful
 *    ```
 *
 * 2. **Set Environment Variables** in .env:
 *    ```
 *    MODEL_DRIVEN_APP_URL=https://org.crm.dynamics.com/main.aspx?appid=xxx
 *    MS_AUTH_CREDENTIAL_TYPE=certificate
 *    MS_AUTH_LOCAL_FILE_PATH=./cert/cert.pfx
 *    ```
 *
 * 3. **Project Configuration**: This test uses MDA-specific storage state configured
 *    in playwright.config.ts under the 'model-driven-app' project.
 *
 * For complete authentication documentation, see:
 * packages/power-platform-playwright-toolkit/docs/tutorials/AUTHENTICATION.md
 */

import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

test.describe('Model-Driven App - Direct URL Navigation', () => {
  let appProvider: AppProvider;
  let modelDrivenApp: ModelDrivenAppPage;

  // Test configuration
  const BASE_APP_URL = process.env.MODEL_DRIVEN_APP_URL || process.env.BASE_APP_URL || '';
  const ENTITY_NAME = 'nwind_orders'; // Northwind Orders entity (plural)

  test.beforeAll(async () => {
    if (!BASE_APP_URL) {
      throw new Error('MODEL_DRIVEN_APP_URL or BASE_APP_URL environment variable is not set');
    }
  });

  test.beforeEach(async ({ page, context }) => {
    // Initialize AppProvider - single entry point for all apps
    appProvider = new AppProvider(page, context);

    // Launch Model-Driven App using direct URL (fastest method)
    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: BASE_APP_URL,
    });

    // Get ModelDrivenAppPage instance from provider
    modelDrivenApp = appProvider.getModelDrivenAppPage();
    console.log(`✅ Launched Model-Driven App via AppProvider: ${BASE_APP_URL}`);
  });

  test('should navigate directly to grid view from URL', async () => {
    console.log('\n🧪 TEST: Navigate directly to grid view');

    // Navigate directly to base app URL (which shows Orders grid by default)
    await modelDrivenApp.page.goto(BASE_APP_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for page to settle
    await modelDrivenApp.page.waitForTimeout(5000);

    // Verify grid loaded by getting row count
    const rowCount = await modelDrivenApp.grid.getRowCount();

    console.log(`✅ Grid loaded with ${rowCount} records`);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should navigate directly to new record form from URL', async () => {
    console.log('\n🧪 TEST: Navigate directly to new record form');

    // Navigate directly to new record form
    await modelDrivenApp.navigateToFormView(ENTITY_NAME);

    // Verify form loaded (check for form container)
    const formContainer = modelDrivenApp.page.locator('[data-id="form-container"]');
    await formContainer.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
      console.log('[TEST] Form container not found, checking for any input fields...');
    });

    // Alternative check: look for any input fields indicating form is loaded
    const inputFields = modelDrivenApp.page.locator('input[data-id]');
    const fieldCount = await inputFields.count();

    console.log(`✅ Form loaded with ${fieldCount} input fields`);
    expect(fieldCount).toBeGreaterThan(0);
  });

  test('should navigate to grid, open record, and perform operations', async () => {
    console.log('\n🧪 TEST: Complete workflow - Grid → Open Record → Read Data');

    // Step 1: Navigate to grid view
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();

    // Step 2: Read data from first row
    const orderNumber = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
    console.log(`📋 First order: ${orderNumber}`);

    // Step 3: Open the first record
    await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
    console.log('✅ Opened first order record');

    // Step 4: Wait for form to load
    await modelDrivenApp.page.waitForTimeout(3000);

    // Step 5: Verify we're on the form page
    const currentUrl = modelDrivenApp.page.url();
    expect(currentUrl).toContain('pagetype=entityrecord');
    expect(currentUrl).toContain(`etn=${ENTITY_NAME}`);

    console.log('✅ Successfully navigated to record form');
  });

  test('should switch between grid and form views', async () => {
    console.log('\n🧪 TEST: Switch between Grid and Form views');

    // Navigate to grid view
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();
    console.log('✅ Step 1: Grid view loaded');

    let currentUrl = modelDrivenApp.page.url();
    expect(currentUrl).toContain('pagetype=entitylist');

    // Navigate to new record form
    await modelDrivenApp.navigateToFormView(ENTITY_NAME);
    await modelDrivenApp.page.waitForTimeout(3000);
    console.log('✅ Step 2: Form view loaded (new record)');

    currentUrl = modelDrivenApp.page.url();
    expect(currentUrl).toContain('pagetype=entityrecord');

    // Navigate back to grid view
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();
    console.log('✅ Step 3: Navigated back to grid view');

    currentUrl = modelDrivenApp.page.url();
    expect(currentUrl).toContain('pagetype=entitylist');
  });

  test('should use baseAppUrl for multiple entity navigations', async () => {
    console.log('\n🧪 TEST: Navigate to multiple entities using same baseAppUrl');

    // Navigate to Orders grid
    await modelDrivenApp.navigateToGridView(ENTITY_NAME);
    await modelDrivenApp.grid.waitForGridLoad();
    console.log(`✅ Navigated to ${ENTITY_NAME} grid`);

    let currentUrl = modelDrivenApp.page.url();
    expect(currentUrl).toContain(ENTITY_NAME);

    // You can add more entities here if available in your environment
    // Example:
    // await modelDrivenApp.navigateToGridView('nwind_customer');
    // await modelDrivenApp.grid.waitForGridLoad();
    // console.log('✅ Navigated to customers grid');

    // Verify baseAppUrl is consistent
    const baseUrl = modelDrivenApp.getBaseAppUrl();
    console.log(`📍 Base URL being used: ${baseUrl}`);
    expect(baseUrl).toBeTruthy();
    expect(baseUrl).toContain('dynamics.com');
  });

  test('should dynamically set baseAppUrl and navigate', async () => {
    console.log('\n🧪 TEST: Dynamically set baseAppUrl');

    // Create ModelDrivenAppPage without base URL
    const dynamicApp = new ModelDrivenAppPage(modelDrivenApp.page);

    // Set base URL dynamically
    dynamicApp.setBaseAppUrl(BASE_APP_URL);
    console.log(`✅ Dynamically set base URL: ${BASE_APP_URL}`);

    // Verify it's set correctly
    const retrievedUrl = dynamicApp.getBaseAppUrl();
    expect(retrievedUrl).toBe(BASE_APP_URL);

    // Navigate using the dynamically set URL
    await dynamicApp.navigateToGridView(ENTITY_NAME);
    await dynamicApp.grid.waitForGridLoad();

    const currentUrl = dynamicApp.page.url();
    expect(currentUrl).toContain('pagetype=entitylist');
    console.log('✅ Successfully navigated using dynamically set baseAppUrl');
  });

  test('should auto-detect baseAppUrl from current page', async () => {
    console.log('\n🧪 TEST: Auto-detect baseAppUrl from current page');

    // First, navigate to the app URL manually
    await modelDrivenApp.page.goto(BASE_APP_URL, { waitUntil: 'domcontentloaded' });
    await modelDrivenApp.page.waitForTimeout(2000);

    // Create ModelDrivenAppPage without explicit base URL
    // It should auto-detect from current page
    const autoDetectApp = new ModelDrivenAppPage(modelDrivenApp.page);

    // Get the auto-detected base URL
    const detectedUrl = autoDetectApp.getBaseAppUrl();
    console.log(`📍 Auto-detected base URL: ${detectedUrl}`);

    expect(detectedUrl).toBeTruthy();
    expect(detectedUrl).toContain('dynamics.com');

    // Use it to navigate
    await autoDetectApp.navigateToGridView(ENTITY_NAME);
    await autoDetectApp.grid.waitForGridLoad();

    console.log('✅ Successfully navigated using auto-detected baseAppUrl');
  });
});
