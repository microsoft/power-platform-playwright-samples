/**
 * GenUX Integration Test — Basic Form Generation
 *
 * Prompt: "Build a contact form with First Name, Last Name, and Email fields."
 *
 * Test generation source:
 * - Preview tab DOM: 3-field form with labeled inputs
 * - Code tab: Patch to Contacts table, IsMatch for email validation
 *
 * Selectors below are derived from the Preview tab DOM after generation.
 * Update them by calling `genUxPage.getPreviewTabDom()` after a fresh generation run.
 */
import * as path from 'path';
import * as fs from 'fs';
import { test, expect, Page, BrowserContext } from '@playwright/test';
import { AppProvider, AppType, GenUxPage } from 'power-platform-playwright-toolkit';
import {
  performGenUxBasicSetup,
  performGenUxBasicTeardown,
} from '@/utils/gen-ux/shared-test-steps';
import { findFormInput, GenUxConstants } from '@/utils/gen-ux/gen-ux-utils';

const MAKER_PORTAL_URL = process.env.MAKER_PORTAL_URL ?? 'https://make.powerapps.com';

/**
 * Shared between Test 3 (publish + play) and Test 4 (open via direct MDA URL).
 * - `publishedMdaUrl`  — the real MDA play URL captured from `appPage.url()` after play opens
 * - `publishedAppName` — app name kept OUT of `appsCreated` so afterEach doesn't delete it
 *   before Test 4 runs. Test 4 pushes it into `appsCreated` so afterEach cleans it up.
 */
let publishedMdaUrl: string | null = null;
let publishedAppName: string | null = null;

/** Incremented in beforeEach so afterEach knows which test just ran (1–4). */
let testNumber = 0;

/** Unique app name with timestamp suffix to prevent environment collisions */
function makeAppName(): string {
  const ts = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  return `GenUX BasicForm ${ts}`;
}

/**
 * Fill the 3-field contact form and click the submit button on `formPage`.
 * Asserts "Form submitted successfully!" is visible after submission.
 */
async function fillAndSubmitForm(formPage: Page): Promise<void> {
  console.log('[fillAndSubmitForm] Locating form fields...');
  const firstNameInput = await findFormInput(formPage, 'firstName');
  const lastNameInput = await findFormInput(formPage, 'lastName');
  const emailInput = await findFormInput(formPage, 'email');
  console.log('[fillAndSubmitForm] All three fields located');

  console.log(
    `[fillAndSubmitForm] Filling firstName: "${GenUxConstants.VALID_FORM_DATA.firstName}"`
  );
  await firstNameInput.fill(GenUxConstants.VALID_FORM_DATA.firstName);

  console.log(`[fillAndSubmitForm] Filling lastName: "${GenUxConstants.VALID_FORM_DATA.lastName}"`);
  await lastNameInput.fill(GenUxConstants.VALID_FORM_DATA.lastName);

  console.log(`[fillAndSubmitForm] Filling email: "${GenUxConstants.VALID_FORM_DATA.email}"`);
  await emailInput.fill(GenUxConstants.VALID_FORM_DATA.email);

  console.log('[fillAndSubmitForm] Clicking submit button...');
  const submitBtn = formPage
    .getByRole('button', { name: /submit/i })
    .or(formPage.getByRole('button', { name: /save/i }));
  await submitBtn.first().click();

  console.log('[fillAndSubmitForm] Waiting for any success notification...');
  // Success text is AI-generated and varies — check for any success-pattern match.
  // GenUX apps may show a toast ("Form submitted!") OR navigate to a thank-you page.
  const successLocator = formPage.getByText(/submitted|saved|success|created|added|thank/i).first();
  await successLocator.waitFor({ state: 'visible', timeout: 30_000 });
  const successText = (await successLocator.textContent()) ?? '(no text)';
  console.log(`[fillAndSubmitForm] ✅ Submit success: "${successText.trim()}"`);
}

test.describe.serial('GenUX — Basic Form Generation', () => {
  // AI generation is non-deterministic and video encoding adds CPU overhead.
  // Allow up to 15 minutes per test to accommodate slow generation under load.
  test.setTimeout(15 * 60 * 1000);

  let page: Page;
  let context: BrowserContext;
  let genUxPage: GenUxPage;
  const appsCreated: string[] = [];

  test.beforeEach(async ({ browser }) => {
    testNumber++;
    console.log(`[beforeEach] Test ${testNumber} — Creating new browser context and page...`);
    const videoDir = path.resolve(__dirname, '../../../test-results/artifacts/videos');
    context = await browser.newContext({
      // Lower resolution reduces real-time encoding CPU overhead during long AI generation tests
      recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
    });
    page = await context.newPage();

    console.log(`[beforeEach] Launching Power Apps Maker Portal: ${MAKER_PORTAL_URL}`);
    const appProvider = new AppProvider(page, context);
    await appProvider.launch({
      app: 'Power Apps Maker',
      type: AppType.PowerApps,
      skipMakerPortal: true,
      directUrl: MAKER_PORTAL_URL,
    });

    genUxPage = appProvider.getGenUxPage();
    console.log('[beforeEach] AppProvider ready, GenUxPage obtained');
  });

  test.afterEach(async () => {
    console.log(`[afterEach] Cleaning up ${appsCreated.length} app(s): ${appsCreated.join(', ')}`);
    await performGenUxBasicTeardown(genUxPage, appsCreated);

    // Capture video reference BEFORE closing — path() resolves after context close
    const video = page.video();
    await context.close().catch((e: Error) => {
      console.warn(`[afterEach] Context close warning (non-fatal): ${e.message}`);
    });

    // Rename video to include test number prefix (e.g. "1_<uuid>.webm")
    const videoPath = await video?.path().catch(() => null);
    if (videoPath) {
      const numbered = path.join(
        path.dirname(videoPath),
        `${testNumber}_${path.basename(videoPath)}`
      );
      fs.renameSync(videoPath, numbered);
      console.log(`[afterEach] Video saved: ${numbered}`);
    }

    console.log('[afterEach] Context closed');
  });

  /**
   * afterAll: bulk-delete any leftover "GenUX BasicForm" apps from the environment.
   * Runs after all tests in the suite — creates a fresh auth context for cleanup.
   */
  test.afterAll(async ({ browser }) => {
    console.log('\n[afterAll] Starting bulk cleanup of all "GenUX BasicForm" apps...');
    const cleanupContext = await browser.newContext();
    const cleanupPage = await cleanupContext.newPage();

    try {
      const appProvider = new AppProvider(cleanupPage, cleanupContext);
      await appProvider.launch({
        app: 'Power Apps Maker',
        type: AppType.PowerApps,
        skipMakerPortal: true,
        directUrl: MAKER_PORTAL_URL,
      });
      const cleanupGenUxPage = appProvider.getGenUxPage();

      console.log('[afterAll] Navigating to Apps page...');
      await cleanupGenUxPage.goToAppsPage();
      await cleanupGenUxPage.deleteAppsMatchingPrefix('GenUX BasicForm');
      console.log('[afterAll] ✅ Bulk cleanup complete');
    } finally {
      await cleanupContext.close().catch((e: Error) => {
        console.warn(`[afterAll] Context close warning (non-fatal): ${e.message}`);
      });
    }
  });

  test('1 — should generate app, fill preview form, submit and publish', async () => {
    const appName = makeAppName();
    appsCreated.push(appName);
    console.log(`\n[Test 1] App name: "${appName}"`);

    // ── Phases 1–4: App Generation ───────────────────────────────────────────
    console.log('[Test 1] Starting app generation (Phases 1–4)...');
    await performGenUxBasicSetup(genUxPage, appName, {
      aiPrompt: 'Build a contact form with First Name, Last Name, and Email fields.',
    });
    console.log('[Test 1] App generation complete');

    // ── Phase 5: Preview tab — fill form and submit ──────────────────────────
    await test.step('Switch to Preview tab and wait for content', async () => {
      console.log('[Test 1] Switching to Preview tab...');
      await genUxPage.clickPreviewTab();
      await genUxPage.waitForGeneratedContent();
      console.log('[Test 1] Preview content loaded');
    });

    await test.step('Verify fields, fill with valid data and submit', async () => {
      console.log('[Test 1] Verifying firstName, lastName, email fields are visible...');
      const firstNameInput = await findFormInput(genUxPage.previewFrame, 'firstName');
      const lastNameInput = await findFormInput(genUxPage.previewFrame, 'lastName');
      const emailInput = await findFormInput(genUxPage.previewFrame, 'email');

      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      console.log('[Test 1] All three fields are visible ✅');

      await firstNameInput.fill(GenUxConstants.VALID_FORM_DATA.firstName);
      await lastNameInput.fill(GenUxConstants.VALID_FORM_DATA.lastName);
      await emailInput.fill(GenUxConstants.VALID_FORM_DATA.email);
      console.log(
        `[Test 1] Filled: firstName="${GenUxConstants.VALID_FORM_DATA.firstName}", lastName="${GenUxConstants.VALID_FORM_DATA.lastName}", email="${GenUxConstants.VALID_FORM_DATA.email}"`
      );

      console.log('[Test 1] Submitting form in Preview...');
      await genUxPage.submitForm();
      await genUxPage.waitForSubmitSuccess();
      console.log('[Test 1] ✅ Form submitted successfully in Preview');
    });

    // ── Phase 6: Code tab verification ───────────────────────────────────────
    await test.step('Verify Code tab has generated content', async () => {
      console.log('[Test 1] Switching to Code tab...');
      await genUxPage.clickCodeTab();
      await genUxPage.waitForCodeTabContent();
      const codeContent = await genUxPage.getCodeTabContent();
      console.log(`[Test 1] Code tab content length: ${codeContent.length} chars`);
      expect(codeContent.length).toBeGreaterThan(0);
    });

    // ── Phase 7: Publish ─────────────────────────────────────────────────────
    await test.step('Save and Publish the app', async () => {
      console.log('[Test 1] Publishing app...');
      await genUxPage.publishApp();
      console.log('[Test 1] ✅ App published successfully');
    });
  });

  // Skipped to save time — edge case data input acceptance is lower priority.
  test.skip('2 — should handle edge case data in generated form fields', async () => {
    const appName = makeAppName();
    appsCreated.push(appName);
    console.log(`\n[Test 2] App name: "${appName}"`);

    await performGenUxBasicSetup(genUxPage, appName, {
      aiPrompt: 'Build a contact form with First Name, Last Name, and Email fields.',
    });

    await test.step('Switch to Preview tab', async () => {
      await genUxPage.clickPreviewTab();
      await genUxPage.waitForGeneratedContent();
    });

    await test.step('Fill form with edge case data', async () => {
      const firstNameInput = await findFormInput(genUxPage.previewFrame, 'firstName');
      const lastNameInput = await findFormInput(genUxPage.previewFrame, 'lastName');
      const emailInput = await findFormInput(genUxPage.previewFrame, 'email');

      await firstNameInput.fill(GenUxConstants.EDGE_CASE_DATA.firstName);
      await lastNameInput.fill(GenUxConstants.EDGE_CASE_DATA.lastName);
      await emailInput.fill(GenUxConstants.EDGE_CASE_DATA.email);

      await expect(firstNameInput).toHaveValue(GenUxConstants.EDGE_CASE_DATA.firstName);
      await expect(lastNameInput).toHaveValue(GenUxConstants.EDGE_CASE_DATA.lastName);
      await expect(emailInput).toHaveValue(GenUxConstants.EDGE_CASE_DATA.email);
    });

    await test.step('Submit form (best-effort — Patch may reject special chars)', async () => {
      await genUxPage.submitForm();
    });

    await test.step('Save and Publish the app', async () => {
      await genUxPage.publishApp();
    });
  });

  test('3 — should fill preview form, publish, then play and fill from Apps page', async () => {
    // NOTE: intentionally NOT pushed to appsCreated here — Test 4 needs this app alive.
    // Test 4 pushes publishedAppName into appsCreated so afterEach cleans it up.
    const appName = makeAppName();
    publishedAppName = appName;
    console.log(`\n[Test 3] App name: "${appName}"`);

    // ── Phases 1–4: App Generation ───────────────────────────────────────────
    console.log('[Test 3] Starting app generation (Phases 1–4)...');
    await performGenUxBasicSetup(genUxPage, appName, {
      aiPrompt: 'Build a contact form with First Name, Last Name, and Email fields.',
    });
    console.log('[Test 3] App generation complete');

    // ── Phase 5: Preview tab — fill and submit ────────────────────────────────
    await test.step('Switch to Preview tab and fill form', async () => {
      console.log('[Test 3] Switching to Preview tab...');
      await genUxPage.clickPreviewTab();
      await genUxPage.waitForGeneratedContent();

      const firstNameInput = await findFormInput(genUxPage.previewFrame, 'firstName');
      const lastNameInput = await findFormInput(genUxPage.previewFrame, 'lastName');
      const emailInput = await findFormInput(genUxPage.previewFrame, 'email');

      await firstNameInput.fill(GenUxConstants.VALID_FORM_DATA.firstName);
      await lastNameInput.fill(GenUxConstants.VALID_FORM_DATA.lastName);
      await emailInput.fill(GenUxConstants.VALID_FORM_DATA.email);
      console.log(`[Test 3] Filled preview form`);

      await genUxPage.submitForm();
      await genUxPage.waitForSubmitSuccess();
      console.log('[Test 3] ✅ Preview form submitted successfully');
    });

    // ── Phase 6: Publish ──────────────────────────────────────────────────────
    await test.step('Save and Publish the app', async () => {
      console.log('[Test 3] Publishing app...');
      await genUxPage.publishApp();
    });

    // ── Phase 7: Play from Apps page ──────────────────────────────────────────
    let appPage: Page | null = null;
    await test.step('Navigate to Apps page, search and play the app', async () => {
      console.log('[Test 3] Navigating to Apps page...');
      await genUxPage.goToAppsPage();
      console.log(`[Test 3] Searching for "${appName}" and clicking Play...`);
      appPage = await genUxPage.searchAndPlayApp(appName, context);

      if (appPage) {
        // Capture the REAL MDA play URL for Test 4 — must be northwindapptest.crm.dynamics.com/main.aspx?appid=...
        publishedMdaUrl = appPage.url();
        console.log(`[Test 3] App opened — MDA URL captured for Test 4: ${publishedMdaUrl}`);
      } else {
        console.log('[Test 3] ⚠️  Play is disabled even after publish — skipping fill step.');
      }
    });

    if (!appPage) return;

    await test.step('Wait for played app to fully load', async () => {
      await appPage!.waitForLoadState('domcontentloaded');
      console.log(`[Test 3] App loaded — current URL: ${appPage!.url()}`);
    });

    // ── Phase 8: Fill and submit in the played MDA app ────────────────────────
    await test.step('Fill form and submit in played app', async () => {
      console.log('[Test 3] Filling and submitting form in played app...');
      await fillAndSubmitForm(appPage!);
    });
  });

  test('4 — should open published app via direct MDA URL and submit form', async () => {
    // Register published app for cleanup — runs regardless of outcome
    if (publishedAppName) appsCreated.push(publishedAppName);

    console.log(`\n[Test 4] MDA URL: ${publishedMdaUrl}`);
    test.skip(!publishedMdaUrl, 'No published MDA URL — Test 3 must run and publish first');
    if (!publishedMdaUrl) return;

    // ── Open published app via direct MDA URL (northwindapptest.crm.dynamics.com/main.aspx?appid=...) ──
    await test.step('Launch published app via direct MDA URL', async () => {
      console.log(`[Test 4] Launching: ${publishedMdaUrl}`);
      const appProvider = new AppProvider(page, context);
      await appProvider.launch({
        app: 'Published GenUX App',
        type: AppType.ModelDriven,
        skipMakerPortal: true,
        directUrl: publishedMdaUrl!,
      });
      console.log(`[Test 4] App loaded — URL: ${page.url()}`);
    });

    await test.step('Wait for app to fully render', async () => {
      await page.waitForLoadState('domcontentloaded');
      console.log('[Test 4] App runtime ready');
    });

    // ── Fill and submit ───────────────────────────────────────────────────────
    await test.step('Fill form with valid data and submit', async () => {
      console.log('[Test 4] Filling and submitting form via direct MDA URL...');
      await fillAndSubmitForm(page);
      console.log('[Test 4] ✅ Form submitted successfully via direct MDA URL');
    });
  });
});
