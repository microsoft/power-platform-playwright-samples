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
  fillCanvasInput,
  clickCanvasButton,
  scrollGalleryToItem,
  retryAction,
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
  // Whole Number field — must use locator.fill() to fire the change event Canvas needs
  testInput: 'input[aria-label="test"]',
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

/** Creates a new account record via the custom page form */
async function createAccount(page: Page, accountName: string): Promise<void> {
  // If the form is in edit mode (Cancel visible), exit it first
  const cancelVisible = await page
    .locator(SEL.btnCancel)
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  if (cancelVisible) {
    await page.locator(SEL.btnCancel).click();
    await page.locator(SEL.btnCancel).waitFor({ state: 'hidden', timeout: 10000 });
  }

  // If "New record" is still not visible (can happen after edit+save transitions),
  // re-navigate to the custom page via the sidebar to restore clean state
  const newRecordVisible = await page
    .locator(SEL.newRecordButton)
    .isVisible({ timeout: 5000 })
    .catch(() => false);
  if (!newRecordVisible) {
    console.log('New record button not visible — re-navigating to custom page via sidebar');
    const sidebarItem = page
      .locator(
        `[role="presentation"][title="${CUSTOM_PAGE_NAME}"], a[title="${CUSTOM_PAGE_NAME}"], a[aria-label="${CUSTOM_PAGE_NAME}"]`
      )
      .first();
    await sidebarItem.waitFor({ state: 'visible', timeout: 15000 });
    await sidebarItem.click();
    await waitForCanvasReady(page, SEL.newRecordButton);
  }

  await retryAction(() => page.locator(SEL.newRecordButton).click(), { label: 'click New record' });
  // Wait for the save button — this confirms the form is in edit/new-record mode
  await page.locator(SEL.btnSave).waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);

  const input = page.locator(SEL.accountNameInput);
  await input.waitFor({ state: 'visible', timeout: 15000 });

  // Check for shadow root and Canvas-related globals
  const envDiag = await page.evaluate((sel: string) => {
    const inp = document.querySelector(sel) as HTMLInputElement | null;
    let shadowInfo: string = 'no input';
    if (inp) {
      let el: Element | null = inp;
      const shadowHosts: string[] = [];
      while (el) {
        const sr = (el as any).shadowRoot;
        if (sr) shadowHosts.push(el.tagName + '.' + el.className.slice(0, 30));
        el = el.parentElement;
      }
      shadowInfo = shadowHosts.length ? shadowHosts.join(' > ') : 'none';
    }
    // Search for Canvas/PowerApps globals
    const canvasGlobals = Object.keys(window)
      .filter((k) => {
        const lk = k.toLowerCase();
        return (
          lk.includes('canvas') ||
          lk.includes('magic') ||
          lk.includes('powerapps') ||
          lk.includes('appruntime') ||
          lk.includes('pa_') ||
          lk.includes('pcf')
        );
      })
      .slice(0, 20);
    return { shadowInfo, canvasGlobals };
  }, SEL.accountNameInput);
  console.log('[createAccount] env diag:', JSON.stringify(envDiag));

  // Try pressSequentially with delay — fires real key events to the specific element
  await input.click();
  await page.waitForTimeout(300);
  await input.pressSequentially(accountName, { delay: 50 });
  await page.waitForTimeout(300);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // Verify DOM value and try React fiber state check
  const postFillDiag = await page.evaluate((sel: string) => {
    const inp = document.querySelector(sel) as HTMLInputElement | null;
    const domValue = inp?.value ?? '(not found)';
    // Try reading via React fiber (internal state)
    let fiberValue: string | null = null;
    try {
      const fiber =
        (inp as any)?._reactFiber ||
        (inp as any)?.__reactFiber ||
        Object.keys(inp as any).filter((k) => k.startsWith('__reactFiber'))[0];
      const fiberNode = fiber ? (inp as any)[fiber] : null;
      if (fiberNode?.memoizedProps?.value !== undefined) {
        fiberValue = String(fiberNode.memoizedProps.value);
      } else if (fiberNode?.pendingProps?.value !== undefined) {
        fiberValue = String(fiberNode.pendingProps.value);
      }
    } catch {
      /* */
    }
    return { domValue, fiberValue };
  }, SEL.accountNameInput);
  console.log('[createAccount] post-fill diag:', JSON.stringify(postFillDiag));

  // Click Save
  await clickCanvasButton(page.locator(SEL.btnSave), { timeout: 10000 });

  let saveSucceeded = false;
  try {
    await page.locator(SEL.btnSave).waitFor({ state: 'hidden', timeout: 30000 });
    saveSucceeded = true;
  } catch {
    const alertText = await page.evaluate(() => {
      const alerts = Array.from(document.querySelectorAll('[role="alert"], [aria-live]'));
      return alerts.map((el) => el.textContent?.trim()?.slice(0, 200)).filter(Boolean);
    });
    console.log(`[createAccount] save timed out. alertText=${JSON.stringify(alertText)}`);
  }
  console.log(`[createAccount] saveSucceeded=${saveSucceeded}`);
  await page.waitForTimeout(500);

  // Full URL navigation forces the canvas page to reinitialize and reload gallery data.
  // A sidebar re-click when already on the custom page is a no-op in the MDA shell.
  console.log('Refreshing gallery: navigating to app root and back to custom page...');
  // 'commit' fires as soon as the navigation response starts — D365 SPAs can stall
  // the 'load' event indefinitely while background scripts keep loading.
  // The menuitem waitFor below is the real readiness gate.
  await page.goto(MODEL_DRIVEN_APP_URL!, { waitUntil: 'commit', timeout: 30000 });
  await page.locator('[role="menuitem"]').first().waitFor({ state: 'visible', timeout: 30000 });
  const refreshSidebar = page
    .locator(
      `[role="presentation"][title="${CUSTOM_PAGE_NAME}"], a[title="${CUSTOM_PAGE_NAME}"], a[aria-label="${CUSTOM_PAGE_NAME}"]`
    )
    .first();
  await refreshSidebar.waitFor({ state: 'visible', timeout: 30000 });
  await refreshSidebar.click();
  await waitForCanvasReady(page, SEL.newRecordButton);
  await scrollGalleryToItem(page, SEL.galleryItem, getGalleryItem(page, accountName));
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

    await selectGalleryItem(sharedPage, testAccountName);

    await sharedPage.locator(SEL.btnEdit).waitFor({ state: 'visible', timeout: 10000 });
    await sharedPage.locator(SEL.btnEdit).click();

    const updatedName = `${testAccountName} UPDATED`;
    const input = sharedPage.locator(SEL.accountNameInput);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await fillCanvasInput(sharedPage, input, updatedName);
    console.log(`Updating to: "${updatedName}"`);

    await sharedPage.locator(SEL.btnSave).waitFor({ state: 'visible', timeout: 10000 });
    await sharedPage.locator(SEL.btnSave).click();
    // Wait for the form to exit edit mode — save button hides when canvas app returns to view mode
    await sharedPage.locator(SEL.btnSave).waitFor({ state: 'hidden', timeout: 15000 });

    await scrollGalleryToItem(sharedPage, SEL.galleryItem, getGalleryItem(sharedPage, updatedName));
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
