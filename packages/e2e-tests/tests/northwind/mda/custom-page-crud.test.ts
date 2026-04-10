// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Custom Page CRUD Tests for Northwind Model-Driven App - Account Entity
 *
 * Opens the Model-Driven App directly via URL (Play mode), navigates to the
 * AccountsCustomPage via the app sidebar once (beforeAll), then runs each
 * CRUD operation as an independent test.
 *
 * Prerequisites:
 * - Northwind Orders Model-Driven App deployed with AccountsCustomPage
 * - Environment variables configured in .env
 * - Authentication completed (npm run auth)
 *
 * Run this test:
 *   npm test -- tests/northwind/mda/custom-page-crud.test.ts
 *   npm test -- tests/northwind/mda/custom-page-crud.test.ts -- --headed
 */

import * as path from 'path';
import { test, expect, Page, BrowserContext } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  getStorageStatePath,
} from 'power-platform-playwright-toolkit';

const MODEL_DRIVEN_APP_URL = process.env.MODEL_DRIVEN_APP_URL || process.env.BASE_APP_URL;
const CUSTOM_PAGE_NAME = process.env.CUSTOM_PAGE_NAME || 'AccountsCustomPage';

if (!MODEL_DRIVEN_APP_URL) {
  throw new Error(
    'MODEL_DRIVEN_APP_URL or BASE_APP_URL environment variable is required. ' +
      'Please set it in your .env file.'
  );
}

// ─── Canvas custom page selectors ─────────────────────────────────────────────
const SEL = {
  newRecordButton: '[title="New record"]',
  accountNameInput: 'input[aria-label="Account Name"]',
  mainPhoneInput: 'input[aria-label="Main Phone"]',
  cityInput: 'input[aria-label="Address 1: City"]',
  // Command bar icon buttons — click the inner role="button" element
  btnSave: '[data-control-name="IconButton_Accept1"] [role="button"]',
  btnEdit: '[data-control-name="IconButton_Edit1"] [role="button"]',
  btnDelete: '[data-control-name="IconButton_Delete1"] [role="button"]',
  btnCancel: '[data-control-name="IconButton_Cancel1"] [role="button"]',
  // Gallery
  galleryItem: '[role="listitem"][data-control-part="gallery-item"]',
  galleryItemTitle: '[data-control-name="Title1"]',
  galleryItemButton: '[data-control-name="Rectangle1"]',
  // Delete confirmation dialog
  deleteDialogText: '[data-control-name="DeleteText1"]',
  deleteConfirmButton: '[data-control-name="DeleteConfirmBtn1"] [data-control-part="button"]',
  deleteCancelButton: '[data-control-name="DeleteCancelBtn1"] [data-control-part="button"]',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a unique account name (timestamp-based) */
function generateUniqueAccountName(): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  return `Test Account ${timestamp}`;
}

/** Returns a locator for a gallery item whose title matches the given account name */
function getGalleryItem(page: Page, accountName: string) {
  return page
    .locator(SEL.galleryItem)
    .filter({ has: page.locator(SEL.galleryItemTitle).getByText(accountName, { exact: true }) });
}

/**
 * Selects a gallery item by clicking its Rectangle1 button.
 * force: true bypasses the Subtitle1 overlay (z-index 4) that intercepts pointer events.
 */
async function selectGalleryItem(page: Page, accountName: string): Promise<void> {
  const item = getGalleryItem(page, accountName);
  await item.waitFor({ state: 'visible', timeout: 15000 });
  await item.locator(SEL.galleryItemButton).click({ force: true });
  await page.waitForTimeout(1000);
}

/** Creates a new account record via the custom page form */
async function createAccount(
  page: Page,
  accountName: string,
  mainPhone: string = '555-1234',
  city: string = 'Test City'
): Promise<void> {
  // If the form is in edit mode (Cancel visible), exit it first
  const cancelVisible = await page
    .locator(SEL.btnCancel)
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  if (cancelVisible) {
    await page.locator(SEL.btnCancel).click();
    await page.waitForTimeout(1000);
  }

  // If "New record" is still not visible (can happen after edit+save transitions),
  // re-navigate to the custom page via the sidebar to restore clean state
  const newRecordVisible = await page
    .locator(SEL.newRecordButton)
    .isVisible({ timeout: 5000 })
    .catch(() => false);
  if (!newRecordVisible) {
    console.log('New record button not visible — re-navigating to custom page via sidebar');
    const sidebarItem = page.locator(`[role="presentation"][title="${CUSTOM_PAGE_NAME}"]`).first();
    await sidebarItem.waitFor({ state: 'visible', timeout: 15000 });
    await sidebarItem.click();
    await page.waitForTimeout(3000);
  }

  await page.locator(SEL.newRecordButton).waitFor({ state: 'visible', timeout: 15000 });
  await page.locator(SEL.newRecordButton).click();

  const input = page.locator(SEL.accountNameInput);
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(accountName);

  await page.locator(SEL.mainPhoneInput).fill(mainPhone);
  await page.locator(SEL.cityInput).fill(city);

  await page.locator(SEL.btnSave).waitFor({ state: 'visible', timeout: 10000 });
  await page.locator(SEL.btnSave).click();
  // Wait for Dataverse write to commit before reloading the canvas app
  await page.waitForTimeout(8000);

  // Full URL navigation to the app root forces the canvas page to reinitialize and
  // reload its gallery data. A sidebar re-click when already on AccountsCustomPage
  // is a no-op in the MDA and won't trigger a gallery refresh.
  console.log('Refreshing gallery: navigating to app root and back to custom page...');
  await page.goto(MODEL_DRIVEN_APP_URL!, { waitUntil: 'load', timeout: 60000 });
  // Wait for MDA ready signal before clicking into the canvas page
  await page.locator('[role="menuitem"]').first().waitFor({ state: 'visible', timeout: 30000 });
  const refreshSidebar = page.locator(`[role="presentation"][title="${CUSTOM_PAGE_NAME}"]`).first();
  await refreshSidebar.waitFor({ state: 'visible', timeout: 30000 });
  await refreshSidebar.click();
  // Wait for the newly created account to appear in the gallery
  const specificItem = page
    .locator(SEL.galleryItem)
    .filter({ has: page.locator(SEL.galleryItemTitle).getByText(accountName, { exact: true }) });
  await specificItem.waitFor({ state: 'visible', timeout: 60000 });
}

/** Waits for the delete confirmation dialog then clicks the Delete button */
async function confirmDelete(page: Page): Promise<void> {
  await page.locator(SEL.deleteDialogText).waitFor({ state: 'visible', timeout: 10000 });
  await page.locator(SEL.deleteConfirmButton).waitFor({ state: 'visible', timeout: 5000 });
  await page.locator(SEL.deleteConfirmButton).click();
  await page.waitForTimeout(2000);
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('Custom Page CRUD - Account Entity', () => {
  let sharedPage: Page;
  let sharedContext: BrowserContext;

  // Launch the app and navigate to AccountsCustomPage once for all tests
  test.beforeAll(async ({ browser }) => {
    console.log('\n=== beforeAll: Launching app and navigating to custom page ===');

    // Replicate the storage state path used by the model-driven-app project
    const storageStatePath = process.env.MS_AUTH_EMAIL
      ? path.join(
          path.dirname(getStorageStatePath(process.env.MS_AUTH_EMAIL)),
          `state-mda-${process.env.MS_AUTH_EMAIL}.json`
        )
      : undefined;

    sharedContext = storageStatePath
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();

    sharedPage = await sharedContext.newPage();

    const appProvider = new AppProvider(sharedPage, sharedContext);
    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: MODEL_DRIVEN_APP_URL!,
    });

    // Navigate to AccountsCustomPage via sidebar (done once for all tests)
    const sidebarItem = sharedPage
      .locator(`[role="presentation"][title="${CUSTOM_PAGE_NAME}"]`)
      .first();
    await sidebarItem.waitFor({ state: 'visible', timeout: 30000 });
    await sidebarItem.click();
    await sharedPage.waitForTimeout(3000);
    console.log(`Navigated to: ${CUSTOM_PAGE_NAME}\n`);
  });

  test.afterAll(async () => {
    await sharedContext.close();
  });

  // ─── Test 1: Load ──────────────────────────────────────────────────────────
  test('should load AccountsCustomPage from sidebar and display the gallery', async () => {
    console.log('TEST: Load Custom Page');

    await expect(sharedPage.locator(SEL.galleryItem).first()).toBeVisible({ timeout: 15000 });
    console.log('Gallery is visible');

    await expect(sharedPage.locator(SEL.newRecordButton)).toBeVisible({ timeout: 10000 });
    console.log('New record button is visible — AccountsCustomPage loaded successfully');
  });

  // ─── Test 2: Create ────────────────────────────────────────────────────────
  test('should create a new account record and verify it appears in the gallery', async () => {
    const testAccountName = generateUniqueAccountName();
    console.log(`TEST: Create Account — "${testAccountName}"`);

    await createAccount(sharedPage, testAccountName);

    await expect(getGalleryItem(sharedPage, testAccountName)).toBeVisible({ timeout: 15000 });
    console.log(`Verified in gallery: "${testAccountName}"`);
  });

  // ─── Test 3: Read ──────────────────────────────────────────────────────────
  test('should select an account record from the gallery and read its details in the form', async () => {
    const testAccountName = generateUniqueAccountName();
    console.log(`TEST: Read Account — "${testAccountName}"`);

    await createAccount(sharedPage, testAccountName);
    await expect(getGalleryItem(sharedPage, testAccountName)).toBeVisible({ timeout: 15000 });

    console.log('Selecting record from gallery...');
    await selectGalleryItem(sharedPage, testAccountName);

    // Form should display all saved field values
    await expect(sharedPage.locator(SEL.accountNameInput)).toHaveValue(testAccountName, {
      timeout: 10000,
    });
    await expect(sharedPage.locator(SEL.mainPhoneInput)).toHaveValue('555-1234', {
      timeout: 5000,
    });
    await expect(sharedPage.locator(SEL.cityInput)).toHaveValue('Test City', { timeout: 5000 });
    console.log(
      `Form shows correct values: name="${testAccountName}", phone="555-1234-123", city="Test City"`
    );

    // Edit and Delete buttons appear once a record is selected
    await expect(sharedPage.locator(SEL.btnEdit)).toBeVisible({ timeout: 5000 });
    await expect(sharedPage.locator(SEL.btnDelete)).toBeVisible({ timeout: 5000 });
    console.log('Edit and Delete command bar buttons are visible');
  });

  // ─── Test 4: Update ────────────────────────────────────────────────────────
  test('should update an account record and verify the new name in the gallery', async () => {
    const testAccountName = generateUniqueAccountName();
    console.log(`TEST: Update Account — "${testAccountName}"`);

    await createAccount(sharedPage, testAccountName);
    await expect(getGalleryItem(sharedPage, testAccountName)).toBeVisible({ timeout: 15000 });

    await selectGalleryItem(sharedPage, testAccountName);

    await sharedPage.locator(SEL.btnEdit).waitFor({ state: 'visible', timeout: 10000 });
    await sharedPage.locator(SEL.btnEdit).click();

    const updatedName = `${testAccountName} UPDATED`;
    const input = sharedPage.locator(SEL.accountNameInput);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.fill('');
    await input.fill(updatedName);
    console.log(`Updating to: "${updatedName}"`);

    await sharedPage.locator(SEL.btnSave).waitFor({ state: 'visible', timeout: 10000 });
    await sharedPage.locator(SEL.btnSave).click();
    await sharedPage.waitForTimeout(2000);

    await expect(getGalleryItem(sharedPage, updatedName)).toBeVisible({ timeout: 15000 });
    console.log(`Verified updated record in gallery: "${updatedName}"`);

    await expect(getGalleryItem(sharedPage, testAccountName)).toHaveCount(0);
    console.log('Original name no longer in gallery');
  });

  // ─── Test 5: Delete ────────────────────────────────────────────────────────
  test('should select an account record from the gallery and delete it using the command bar Delete button', async () => {
    const testAccountName = generateUniqueAccountName();
    console.log(`TEST: Delete Account — "${testAccountName}"`);

    await createAccount(sharedPage, testAccountName);
    await expect(getGalleryItem(sharedPage, testAccountName)).toBeVisible({ timeout: 15000 });
    console.log(`Record ready to delete: "${testAccountName}"`);

    console.log('Selecting record from gallery list...');
    await selectGalleryItem(sharedPage, testAccountName);

    await sharedPage.locator(SEL.btnDelete).waitFor({ state: 'visible', timeout: 10000 });
    console.log('Delete button visible — clicking...');
    await sharedPage.locator(SEL.btnDelete).click();

    await confirmDelete(sharedPage);

    await expect(getGalleryItem(sharedPage, testAccountName)).toHaveCount(0);
    console.log(`Record removed from gallery: "${testAccountName}"`);
  });
});
