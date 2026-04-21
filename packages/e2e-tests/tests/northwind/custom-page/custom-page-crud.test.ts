// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Custom Page CRUD Tests for Northwind Model-Driven App - Account Entity
 *
 * Opens the Model-Driven App directly via URL (Play mode), navigates to the
 * AccountsCustomPage via the app sidebar once (beforeAll), then runs each
 * CRUD operation as an independent test.
 *
 * Architecture note:
 *   The Canvas custom page is hosted in an https://apps.powerapps.com iframe that is
 *   cross-origin from the MDA (crm.dynamics.com). DOM keyboard events fired in the MDA
 *   main document cannot reach Canvas's Power Fx formula engine across the origin
 *   boundary. Record create and update operations therefore use the Dataverse Web API
 *   directly — the Canvas gallery reads from Dataverse, so changes appear after
 *   a page-navigation refresh. Gallery selection, form display, and delete operations
 *   all use Canvas button clicks, which work normally across the PCF bridge.
 *
 * Prerequisites:
 * - Northwind Orders Model-Driven App deployed with AccountsCustomPage
 * - Environment variables configured in .env
 * - Authentication completed (npm run auth)
 *
 * Run this test:
 *   npx playwright test --project=custom-page
 *   npx playwright test --project=custom-page --headed
 */

import * as path from 'path';
import { test, expect, Page, BrowserContext } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  getStorageStatePath,
  clickCanvasButton,
  scrollGalleryToItem,
  waitForCanvasReady,
  confirmCanvasDialog,
  generateUniqueAccountName,
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
  btnSave: '[data-control-name="IconButton_Accept1"] [role="button"]',
  btnEdit: '[data-control-name="IconButton_Edit1"] [role="button"]',
  btnDelete: '[data-control-name="IconButton_Delete1"] [role="button"]',
  btnCancel: '[data-control-name="IconButton_Cancel1"] [role="button"]',
  galleryItem: '[role="listitem"][data-control-part="gallery-item"]',
  galleryItemTitle: '[data-control-name="Title1"]',
  galleryItemButton: '[data-control-name="Rectangle1"]',
  deleteDialogText: '[data-control-name="DeleteText1"]',
  deleteConfirmButton: '[data-control-name="DeleteConfirmBtn1"] [data-control-part="button"]',
  deleteCancelButton: '[data-control-name="DeleteCancelBtn1"] [data-control-part="button"]',
};

// ─── Navigation helper ────────────────────────────────────────────────────────

/** Full-URL navigation to force the Canvas page to reinitialise and reload gallery data. */
async function navigateToCustomPage(page: Page): Promise<void> {
  // 'commit' fires as soon as the navigation response starts — D365 SPAs can stall
  // the 'load' event indefinitely while background scripts keep loading.
  await page.goto(MODEL_DRIVEN_APP_URL!, { waitUntil: 'commit', timeout: 30000 });
  await page.locator('[role="menuitem"]').first().waitFor({ state: 'visible', timeout: 30000 });
  const sidebar = page
    .locator(
      `[role="presentation"][title="${CUSTOM_PAGE_NAME}"], a[title="${CUSTOM_PAGE_NAME}"], a[aria-label="${CUSTOM_PAGE_NAME}"]`
    )
    .first();
  await sidebar.waitFor({ state: 'visible', timeout: 30000 });
  await sidebar.click();
  await waitForCanvasReady(page, SEL.newRecordButton);
}

// ─── Gallery helpers ──────────────────────────────────────────────────────────

/** Returns a locator for a gallery item whose title matches the given account name */
function getGalleryItem(page: Page, accountName: string) {
  return page
    .locator(SEL.galleryItem)
    .filter({ has: page.locator(SEL.galleryItemTitle).getByText(accountName, { exact: true }) });
}

/**
 * Selects a gallery item by clicking its Rectangle1 button.
 * Uses toolkit scrollGalleryToItem for virtualization and clickCanvasButton for overlay bypass.
 */
async function selectGalleryItem(page: Page, accountName: string): Promise<void> {
  await scrollGalleryToItem(page, SEL.galleryItem, getGalleryItem(page, accountName));
  const item = getGalleryItem(page, accountName);
  await item.waitFor({ state: 'visible', timeout: 15000 });
  await clickCanvasButton(item.locator(SEL.galleryItemButton));
  await page.locator(SEL.btnEdit).waitFor({ state: 'visible', timeout: 15000 });
}

// ─── Dataverse API helpers ────────────────────────────────────────────────────

/**
 * Creates an account record via the Dataverse Web API and navigates to the
 * custom page so the gallery reflects the new record.
 *
 * Why API instead of the Canvas form:
 *   The Canvas player iframe is hosted on https://apps.powerapps.com, which is
 *   cross-origin from the MDA (crm.dynamics.com). DOM keyboard events dispatched
 *   in the MDA main document do not bridge the origin boundary, so Canvas's
 *   Power Fx formula engine (DataCardValue1.Text) never sees the typed value and
 *   the SubmitForm validation always fails.
 */
async function createAccount(page: Page, accountName: string): Promise<void> {
  const result = await page.evaluate(async (name: string) => {
    const resp = await fetch(`${window.location.origin}/api/data/v9.2/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
      body: JSON.stringify({ name }),
    });
    return { ok: resp.ok, status: resp.status };
  }, accountName);

  if (!result.ok) {
    throw new Error(`Dataverse create failed for "${accountName}": HTTP ${result.status}`);
  }
  console.log(`[createAccount] "${accountName}" created via Dataverse API`);

  await navigateToCustomPage(page);
  await scrollGalleryToItem(page, SEL.galleryItem, getGalleryItem(page, accountName));
}

/**
 * Renames an existing account record via the Dataverse Web API and navigates
 * to the custom page so the gallery reflects the updated name.
 */
async function updateAccount(page: Page, currentName: string, newName: string): Promise<void> {
  const result = await page.evaluate(
    async (args: { currentName: string; newName: string }) => {
      const base = window.location.origin;
      // Find the account by its current name
      const findResp = await fetch(
        `${base}/api/data/v9.2/accounts?$filter=name eq '${args.currentName.replace(/'/g, "''")}'&$select=accountid&$top=1`,
        {
          headers: {
            Accept: 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
          },
        }
      );
      if (!findResp.ok) return { ok: false, error: `find: ${findResp.status}` };
      const findData = await findResp.json();
      const accountId: string | undefined = findData.value?.[0]?.accountid;
      if (!accountId) return { ok: false, error: 'account not found' };

      const patchResp = await fetch(`${base}/api/data/v9.2/accounts(${accountId})`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify({ name: args.newName }),
      });
      return { ok: patchResp.ok, status: patchResp.status };
    },
    { currentName, newName }
  );

  if (!result.ok) {
    throw new Error(
      `Dataverse update failed "${currentName}" → "${newName}": ${JSON.stringify(result)}`
    );
  }
  console.log(`[updateAccount] "${currentName}" → "${newName}" via Dataverse API`);

  await navigateToCustomPage(page);
  await scrollGalleryToItem(page, SEL.galleryItem, getGalleryItem(page, newName));
}

/** Waits for the delete confirmation dialog then clicks the Delete button */
async function confirmDelete(page: Page): Promise<void> {
  await confirmCanvasDialog(page, {
    dialogSelector: SEL.deleteDialogText,
    confirmSelector: SEL.deleteConfirmButton,
  });
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
      .locator(
        `[role="presentation"][title="${CUSTOM_PAGE_NAME}"], a[title="${CUSTOM_PAGE_NAME}"], a[aria-label="${CUSTOM_PAGE_NAME}"]`
      )
      .first();

    await sidebarItem.waitFor({ state: 'visible', timeout: 30000 });
    await sidebarItem.click();
    await waitForCanvasReady(sharedPage, SEL.newRecordButton);
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

    // Form should display the saved account name
    await expect(sharedPage.locator(SEL.accountNameInput)).toHaveValue(testAccountName, {
      timeout: 10000,
    });
    console.log(`Form shows correct value: name="${testAccountName}"`);

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

    const updatedName = `${testAccountName} UPDATED`;
    await updateAccount(sharedPage, testAccountName, updatedName);
    console.log(`Updating to: "${updatedName}"`);

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
