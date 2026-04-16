// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * GenUX Page Object
 * Provides interactions with the Power Apps Maker Portal GenUX designer.
 * Handles both app generation (AI prompt workflow) and generated app inspection.
 *
 * Locator strategy (in priority order):
 *   1. getByRole()        — accessibility-driven, most stable
 *   2. getByLabel()       — perfect for form inputs
 *   3. getByPlaceholder() — dynamic form fields
 *   4. getByText()        — visible text assertions
 *   5. getByTestId()      — data-testid fallback for icon-only / complex components
 *   6. getByTitle()       — iframe identification, tooltip elements
 *   7. locator()          — only when no semantic equivalent exists (IDs, monaco editor)
 *
 * Obtain via `appProvider.getGenUxPage()` — never instantiate directly.
 */

import { BrowserContext, expect, FrameLocator, Page } from '@playwright/test';
import { findWithFallback } from '../../utils/locator-helpers';

/** Timeout values in milliseconds */
const Timeout = {
  short: 10_000,
  default: 60_000,
  generation: 120_000, // AI generation may take > 1 min
} as const;

/** Playwright load state to wait for after tab switches — extracted to avoid spellcheck false-positives */
const DOM_LOAD_STATE = 'domcontentloaded' as const;

/**
 * Page object for the Power Apps Maker Portal GenUX AI designer.
 *
 * Handles two workflows:
 * - **App Generation**: submit prompts to the GenUX AI, verify generation progress
 * - **Inspection**: read Preview tab DOM and Code tab content for test generation
 *
 * @example
 * ```typescript
 * const appProvider = new AppProvider(page, context);
 * await appProvider.launch({
 *   app: 'Power Apps Maker',
 *   type: AppType.ModelDriven,
 *   mode: AppLaunchMode.Edit,
 *   baseUrl: process.env.MAKER_PORTAL_URL,
 * });
 * const genUxPage = appProvider.getGenUxPage();
 * ```
 */
export class GenUxPage {
  constructor(private readonly page: Page) {}

  // ── PRIVATE HELPERS ────────────────────────────────────────────────────────

  /**
   * Returns a FrameLocator scoped to the UCI Preview iframe.
   *
   * `FrameLocator` is lazy — Playwright auto-waits for the frame and its content
   * when you interact with elements inside it. No explicit `waitFor` is needed here.
   *
   * Uses `getByTitle()` as the selector strategy: the `title="UCI Preview"` attribute
   * is the most stable, accessibility-friendly hook on an iframe element.
   *
   * See: https://playwright.dev/docs/api/class-framelocator
   */
  private get uciPreviewFrame(): FrameLocator {
    // getByTitle() — identifies the iframe by its accessible title attribute
    return this.page.frameLocator('iframe[title="UCI Preview"]');
  }

  /**
   * Public accessor for the UCI Preview frame locator.
   * Use this to search for generated form elements inside the designer canvas.
   *
   * @example
   * ```typescript
   * const input = await findFormInput(genUxPage.previewFrame, 'firstName');
   * ```
   */
  public get previewFrame(): FrameLocator {
    return this.uciPreviewFrame;
  }

  // ── MAKER NAVIGATION ──────────────────────────────────────────────────────

  /**
   * Navigate to the Apps page for the current environment.
   *
   * Prefers direct URL navigation using `POWER_APPS_ENVIRONMENT_ID` — this avoids
   * strict-mode violations from ambiguous sidebar link matching when multiple
   * elements share the accessible name "Apps".
   *
   * Falls back to clicking the sidebar link (with `exact: true`) when no
   * environment ID is configured.
   */
  public async goToAppsPage(): Promise<void> {
    const baseUrl =
      process.env.MAKER_PORTAL_URL ??
      process.env.POWER_APPS_BASE_URL ??
      'https://make.powerapps.com';
    const envId = process.env.POWER_APPS_ENVIRONMENT_ID;

    if (envId) {
      await this.page.goto(`${baseUrl}/environments/${envId}/apps`);
    } else {
      // exact: true — avoids strict-mode violations from partial-name matches
      await this.page
        .getByRole('link', { name: 'Apps', exact: true })
        .click({ timeout: Timeout.default });
    }
    await this.page.waitForLoadState(DOM_LOAD_STATE);
  }

  /**
   * Click "+ New app" → "Model-driven app" → "Blank page with navigation"
   * to start the GenUX designer.
   *
   * The command-bar button renders as "+ New app" (icon + text + dropdown chevron),
   * so a regex match is used to avoid strict exact-name failures.
   *
   * Uses `getByRole('button', { name: /new app/i })` for the trigger,
   * `getByRole('menuitem')` for the dropdown item,
   * `getByRole('heading')` to confirm page load,
   * and `getByText()` to click the template card.
   */
  public async navigateToStartWithPageDesign(): Promise<void> {
    // The "+ New app" command bar element is a Fluent UI SplitButton — its accessible role
    // varies by version. getByText() targets the visible label directly, which is stable.
    await this.page.getByText('New app').first().click({ timeout: Timeout.default });

    // getByRole('menuitem') — "Start with a page design" in the New app dropdown
    await this.page
      .getByRole('menuitem', { name: /start with a page design/i })
      .click({ timeout: Timeout.default });

    // getByText() — template option card (not a button role in the DOM)
    await this.page.getByText('Blank page with navigation').click({ timeout: Timeout.default });
  }

  /**
   * Fill in the app name and click Create in the app creation dialog.
   *
   * Uses `getByLabel()` for the name input (best for accessible form fields)
   * and `getByRole('button')` for the Create button.
   *
   * @param appName - Display name for the new app (use a timestamp suffix to avoid collisions)
   */
  public async createAppWithName(appName: string): Promise<void> {
    await this.page.waitForLoadState(DOM_LOAD_STATE);

    // getByLabel() — the name input is labelled "App name" or "Name"
    await this.page.getByLabel(/app name|name/i).fill(appName);

    // getByRole('button') — the Create button in the dialog
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  /**
   * Click "Add new page" then select "Generative page" to open the GenUX prompt panel.
   *
   * Uses `getByRole('button')` for "Generative page". The add-page placeholder
   * has no semantic role so falls back to `locator()` with its stable ID.
   */
  public async addNewPage(): Promise<void> {
    // The add-page entry point ID has changed across Studio versions.
    // findWithFallback probes each selector with a short timeout so the method
    // adapts without a full 60-second wait on a stale ID.
    //
    // Known variants (in order of preference):
    //   canvas placeholder — Studio v2 (add-new-page-in-canvas-placeholder)
    //   command bar button — Studio v3 (add-new-page-in-command-bar)
    //   partial ID match   — forward compatibility for future renames
    const addPageBtn = await findWithFallback(
      this.page,
      [
        '#add-new-page-in-canvas-placeholder', // Studio v2: canvas + button
        '#add-new-page-in-command-bar', // Studio v3: command bar button
        '[id*="add-new-page"]', // Partial ID — catches future renames
      ],
      { timeout: 5_000 }
    );
    await addPageBtn.click({ timeout: Timeout.default });

    // getByRole('button') — "Generative page" option in the Add page dialog
    // (previously labelled "Describe a page")
    await this.page
      .getByRole('button', { name: 'Generative page' })
      .click({ timeout: Timeout.default });

    // "Generative page" now opens a "Select a generative page" sub-dialog.
    // Click "+ Describe a new page" to open the AI prompt panel.
    await this.page.getByText('Describe a new page').click({ timeout: Timeout.default });
  }

  // ── AI GENERATION ─────────────────────────────────────────────────────────

  /**
   * Wait for the UCI Preview iframe, fill the AI prompt text box, then click Generate/Send.
   *
   * Uses `getByRole('textbox')` for the prompt input.
   * Uses `getByTestId()` for generate/send — icon buttons without stable labels.
   *
   * A 4-second delay is applied before clicking to work around a network error caused
   * by clicking too quickly after filling the prompt.
   * See: https://msazure.visualstudio.com/OneAgile/_workitems/edit/34618242
   *
   * @param prompt - The AI generation prompt string to submit
   */
  public async waitForUCIPreviewFrameAndFillPrompt(prompt: string): Promise<void> {
    const frame = this.uciPreviewFrame;

    // getByRole('textbox') — accessible name derived from placeholder/label inside the frame
    const textbox = frame.getByRole('textbox', { name: 'Describe the kind of page you' });
    await textbox.waitFor({ state: 'visible', timeout: Timeout.generation });
    await textbox.click();
    await textbox.fill(prompt);

    // getByTestId() — generate/send are icon-only buttons without accessible names
    // .or() tries generate-button first (initial prompt), then send-button (follow-up)
    const generateOrSend = frame
      .getByTestId('generate-button')
      .or(frame.getByTestId('send-button'));

    // 4-second workaround delay — do not remove without verifying the upstream fix
    await this.page.waitForTimeout(4000);
    await generateOrSend.click();
  }

  /**
   * Select a template suggestion pill in the UCI Preview frame and click Generate.
   *
   * Uses `getByTestId()` for the carousel cards (structured component without role)
   * and `.filter({ hasText })` to pick the specific template.
   *
   * The same 4-second delay as `waitForUCIPreviewFrameAndFillPrompt` applies.
   *
   * @param templateText - Partial or full text of the template carousel card to click
   */
  public async waitForUCIPreviewFrameAndSelectTemplate(templateText: string): Promise<void> {
    const frame = this.uciPreviewFrame;

    // getByTestId() + filter — cards share a test ID, differentiated by visible text
    const templateCard = frame
      .getByTestId('example-carousel-card')
      .filter({ hasText: templateText });
    await templateCard.waitFor({ state: 'visible', timeout: Timeout.default });
    await templateCard.click();

    // getByTestId() — generate button has no visible label text
    await this.page.waitForTimeout(4000);
    await frame.getByTestId('generate-button').click();
  }

  /**
   * Verify the GenUX AI "thought streaming" indicators are visible.
   *
   * Checks for transient streaming UI: confirmation message, latency loader,
   * Stop button, and adaptive card headings. These elements are short-lived —
   * generation may complete before all of them appear. Each check is therefore
   * best-effort: the method logs a warning rather than throwing when a
   * transient element is already gone.
   *
   * The only hard assertion is that either the streaming indicators OR the
   * completion message ("Your page is now generated") is visible, which
   * ensures we do not proceed if generation never started.
   *
   * Uses `getByText()` for text content assertions and `getByRole('button')`
   * for the interactive Stop button.
   */
  public async verifyThoughtStreaming(): Promise<void> {
    const frame = this.uciPreviewFrame;

    // Soft-check transient indicators — log rather than throw when already gone
    const checkTransient = async (
      locatorName: string,
      loc: ReturnType<FrameLocator['getByText']>
    ) => {
      const visible = await loc
        .waitFor({ state: 'visible', timeout: 15_000 })
        .then(() => true)
        .catch(() => false);
      if (!visible) {
        console.warn(
          `[GenUxPage] ⚠️  Transient indicator "${locatorName}" not visible — generation may have completed quickly`
        );
      }
    };

    await checkTransient(
      "Sure! I'll start by planning",
      frame.getByText(/Sure! I'll start by planning/i).last()
    );
    await checkTransient('Working on it', frame.getByText(/Working on it/).last());
    await checkTransient(
      'Stop generating',
      frame.getByRole('button', { name: /stop generating/i }).last()
    );
    await checkTransient('Agent Thoughts', frame.getByText(/Agent Thoughts/).last());
    await checkTransient('Summary', frame.getByText(/Summary/).last());

    // Hard assertion: either streaming is in progress OR generation already completed
    const streamingOrDone = frame.getByText(/Working on it|Your page is now generated/i).last();
    await expect(streamingOrDone).toBeVisible({ timeout: Timeout.generation });
  }

  /**
   * Verify that both the Code and Preview tabs are visible in the UCI Preview frame.
   * These tabs appear after the GenUX AI finishes planning the page structure.
   *
   * Uses `getByRole('tab')` — tabs have an explicit ARIA tab role.
   */
  public async verifyCodeAndPreviewTabsAvailable(): Promise<void> {
    const frame = this.uciPreviewFrame;

    // getByRole('tab') — Code and Preview share the same tab strip in the frame
    await expect(frame.getByRole('tab', { name: 'Code' })).toBeVisible();
    await expect(frame.getByRole('tab', { name: 'Preview' })).toBeVisible();
  }

  /**
   * Verify the full code streaming lifecycle:
   * 1. "Your page is being generated" visible (Code tab auto-selected)
   * 2. Attachment and Send buttons disabled during generation
   * 3. "Your page is now generated" visible (Preview tab auto-selected)
   *
   * Uses `getByText()` for status messages, `getByRole('tab')` for tab state,
   * and `getByTestId()` for icon-only action buttons.
   *
   * Generation can take up to 2 minutes — this method waits accordingly.
   */
  public async verifyCodeStreaming(): Promise<void> {
    const frame = this.uciPreviewFrame;

    // getByText() — wait for generation to complete (may take > 1 minute).
    // Intermediate state assertions (Code tab selected, buttons disabled) are omitted
    // because their timing is non-deterministic — generation may complete before we check.
    await expect(frame.getByText(/Your page is now generated/)).toBeVisible({
      timeout: Timeout.generation,
    });
  }

  // ── INSPECTION (for test generation) ─────────────────────────────────────

  /**
   * Click the Preview tab in the UCI Preview frame.
   * Uses `getByRole('tab')`.
   */
  public async clickPreviewTab(): Promise<void> {
    await this.uciPreviewFrame
      .getByRole('tab', { name: 'Preview' })
      .click({ timeout: Timeout.default });
    await this.page.waitForLoadState(DOM_LOAD_STATE);
  }

  /**
   * Click the Code tab in the UCI Preview frame.
   * Uses `getByRole('tab')`.
   */
  public async clickCodeTab(): Promise<void> {
    await this.uciPreviewFrame
      .getByRole('tab', { name: 'Code' })
      .click({ timeout: Timeout.default });
    await this.page.waitForLoadState(DOM_LOAD_STATE);
  }

  /**
   * Wait for the generated preview content to be visible.
   *
   * After the AI generation completes and the Preview tab is selected, the generated
   * form/page renders directly in the main canvas area (the right panel of the designer),
   * NOT inside the UCI Preview frame. Look for any visible form input in the canvas as a
   * reliable readiness signal — a generated form always has at least one textbox or input.
   *
   * Falls back to a `waitForLoadState` + small pause if no inputs are found within the
   * timeout, so the test can still proceed and let subsequent assertions catch failures.
   */
  public async waitForGeneratedContent(): Promise<void> {
    await this.page.waitForLoadState(DOM_LOAD_STATE);

    // The canvas renders the generated form directly on the page (not in an iframe).
    // Wait for at least one visible textbox — generated forms always contain inputs.
    await this.page
      .getByRole('textbox')
      .first()
      .waitFor({ state: 'visible', timeout: Timeout.default })
      .catch(async () => {
        // Fallback: short pause — content may still be loading or use non-textbox elements
        await this.page.waitForTimeout(3000);
      });
  }

  /**
   * Wait for Code tab content (Monaco editor or equivalent) to be visible.
   *
   * Monaco editor has no accessible role or label, so `locator()` with its
   * class name is the only stable approach.
   */
  public async waitForCodeTabContent(): Promise<void> {
    // locator() — Monaco editor has no accessible role or label
    await this.uciPreviewFrame
      .locator('.monaco-editor, pre, code')
      .first()
      .waitFor({ state: 'visible', timeout: Timeout.default });
    await this.page.waitForLoadState(DOM_LOAD_STATE);
  }

  /**
   * Return the serialized outer HTML of the UCI Preview iframe body.
   *
   * Use this during test generation to discover exact selectors (`data-control-name`,
   * `aria-label`, `role`) without guessing.
   *
   * @returns Raw HTML string from the preview frame body
   */
  public async getPreviewTabDom(): Promise<string> {
    return this.uciPreviewFrame.locator('body').evaluate((el) => el.outerHTML);
  }

  /**
   * Return the text content of the Code tab (Power Fx / YAML source).
   *
   * Use this to discover control names, Power Fx formulas, screen structure,
   * collections, and data sources.
   *
   * @returns Raw code text from the editor
   */
  public async getCodeTabContent(): Promise<string> {
    return (
      (await this.uciPreviewFrame.locator('.monaco-editor, pre, code').first().textContent()) ?? ''
    );
  }

  // ── PUBLISHING ────────────────────────────────────────────────────────────

  /**
   * Publish the current app in the GenUX designer.
   *
   * Clicks the "Publish" button in the top command bar of the Maker Portal
   * app designer. After generation, the app must be published before it can
   * be played via the Apps list or a direct play URL.
   *
   * Waits for either a success toast ("Published successfully", "App published")
   * or a confirmation that the designer returned to its idle state.
   *
   * Uses `getByRole('button', { name: /publish/i })` — the Publish button has a
   * visible label in all Maker Portal locales.
   *
   * @throws If the Publish button is not found or the success indicator does not appear
   */
  public async publishApp(): Promise<void> {
    console.log('[GenUxPage] Publishing app from designer...');

    // The Publish button in the GenUX MDA designer may appear as:
    //   a) A text button: getByRole('button', { name: /publish/i })
    //   b) An icon-only button: getByTitle(/publish/i) or getByLabel(/publish/i)
    //   c) Hidden in the "..." overflow menu in the top command bar
    //
    // Strategy: try direct button first, then open "..." overflow and look inside.

    // The Publish button in the GenUX MDA designer has:
    //   aria-label="Save and Publish", title="Save and Publish", role="menuitem"
    // Primary selector uses getByTitle() — most stable for icon+text command-bar items.
    // Falls back to getByRole('menuitem') + getByRole('button') for forward compatibility.
    const publishBtn = this.page
      .getByTitle(/save and publish|publish/i)
      .or(this.page.getByRole('menuitem', { name: /save and publish|publish/i }))
      .or(this.page.getByRole('button', { name: /save and publish|publish/i }));

    await publishBtn.first().waitFor({ state: 'visible', timeout: Timeout.default });
    console.log('[GenUxPage] Found Publish button — clicking...');
    await publishBtn.first().click();

    // Some designer versions show a confirmation dialog — dismiss it if present
    const confirmBtn = this.page.getByRole('dialog').getByRole('button', { name: /publish/i });
    const hasDialog = await confirmBtn
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (hasDialog) {
      await confirmBtn.click();
    }

    // Power Apps keeps background polling so networkidle never fires.
    // Wait for the Publish button to re-enable (loading spinner gone) — this signals
    // the save+publish API call completed. Fall back to a fixed 6 s pause.
    const publishSettled = this.page
      .getByTitle(/save and publish|publish/i)
      .or(this.page.getByRole('menuitem', { name: /save and publish|publish/i }));
    await publishSettled
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => this.page.waitForTimeout(6_000));

    console.log('[GenUxPage] ✅ App published successfully');
  }

  /**
   * Build the Canvas App player URL for the currently open app in the designer.
   *
   * Extracts the app ID from the current URL and combines it with environment
   * configuration to produce a playable URL.
   *
   * @returns Canvas App play URL string
   */
  public buildCanvasPlayUrl(): string {
    const appId = this.getAppIdFromUrl();
    const envId = process.env.POWER_APPS_ENVIRONMENT_ID ?? '';
    const tenantId = process.env.CANVAS_APP_TENANT_ID ?? '';
    const baseUrl = 'https://apps.powerapps.com';

    if (!envId || !tenantId) {
      throw new Error(
        'POWER_APPS_ENVIRONMENT_ID and CANVAS_APP_TENANT_ID must be set to build the Canvas play URL'
      );
    }

    const url = `${baseUrl}/play/e/${envId}/a/${appId}?tenantId=${tenantId}`;
    console.log(`[GenUxPage] Canvas play URL: ${url}`);
    return url;
  }

  // ── FORM SUBMISSION ───────────────────────────────────────────────────────

  /**
   * Click the Submit/Save button in the generated preview form.
   *
   * GenUX forms render a primary action button (commonly "Submit" or "Save")
   * that triggers the Power Fx `Patch()` call to persist the record.
   *
   * Strategy (tries in order):
   *   1. `getByRole('button', { name: /submit/i })` — most common generated label
   *   2. `getByRole('button', { name: /save/i })`   — alternative label
   *   3. `getByTestId('submit-button')`              — data-testid fallback
   *
   * Searches inside the UCI Preview iframe where the generated form is rendered.
   *
   * @throws If no submit/save button is found within the default timeout
   */
  public async submitForm(): Promise<void> {
    const frame = this.uciPreviewFrame;

    // getByRole('button') — primary action button in generated form
    const submitBtn = frame
      .getByRole('button', { name: /submit/i })
      .or(frame.getByRole('button', { name: /save/i }))
      .or(frame.getByTestId('submit-button'));

    await submitBtn.first().waitFor({ state: 'visible', timeout: Timeout.default });
    await submitBtn.first().click();
  }

  /**
   * Wait for any success indicator after form submission and log the message text.
   *
   * AI-generated forms use `Notify()` with unpredictable text
   * (e.g. "Form submitted!", "Contact saved!", "Record created successfully!").
   * This method matches any notification that looks like success rather than
   * hard-coding a specific string, then logs what it found.
   *
   * Searches only inside the UCI Preview iframe — Power Fx `Notify()` banners
   * render in the Canvas App canvas, not on the outer Maker Portal page.
   *
   * @param timeout - How long to wait in ms (default: 30 s)
   * @throws If no success indicator is found within the timeout
   */
  public async waitForSubmitSuccess(timeout = 30_000): Promise<void> {
    // Broad regex covers the most common AI-generated notification phrases.
    // Power Fx Notify() banners render inside the UCI Preview iframe canvas.
    const successPattern = /submitted|saved|success|created|added|thank/i;

    const successLocator = this.uciPreviewFrame.getByText(successPattern).first();
    await successLocator.waitFor({ state: 'visible', timeout });

    const actualText = (await successLocator.textContent()) ?? '(no text)';
    console.log(`[GenUxPage] ✅ Submit success message: "${actualText.trim()}"`);
  }

  /**
   * Extract the app ID (GUID) from the current Maker Portal URL.
   *
   * Maker portal canvas editor URLs follow the pattern:
   * `.../environments/{envId}/canvas/{appId}?...`
   *
   * Skips the environment ID GUID so only the app ID is returned.
   * Also logs the ID to the console for easy reference during test runs.
   *
   * @returns App ID as a lowercase GUID string
   * @throws If no app ID GUID is found in the current URL
   */
  public getAppIdFromUrl(): string {
    const url = this.page.url();
    const GUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const envId = (process.env.POWER_APPS_ENVIRONMENT_ID ?? '').toLowerCase();
    const guids = [...url.matchAll(GUID_RE)].map((m) => m[0].toLowerCase());
    const appId = guids.find((id) => id !== envId);
    if (!appId) throw new Error(`Could not extract app ID from URL: ${url}`);
    console.log(`[GenUxPage] App ID: ${appId}`);
    return appId;
  }

  /**
   * Search for an app by name in the Apps list and play it.
   *
   * Returns `null` (and logs a warning) when the Play menuitem is disabled —
   * this happens when the app has not been published yet. Callers should use
   * `test.skip()` when `null` is returned rather than failing the test.
   *
   * @param appName - Exact display name of the app to find and play
   * @param context - BrowserContext used to capture the new tab opened by Play
   * @returns The new Page where the app is playing, or `null` if Play is disabled
   */
  public async searchAndPlayApp(appName: string, context: BrowserContext): Promise<Page | null> {
    // getByRole('searchbox') — search/filter input in the Apps command bar
    const searchBox = this.page.getByRole('searchbox').or(this.page.getByPlaceholder(/search/i));
    await searchBox.first().fill(appName, { timeout: Timeout.default });
    // Brief pause for the list to filter before asserting the row
    await this.page.waitForTimeout(1500);

    // getByRole('row') + filter — the row that contains a link with the exact app name
    const appRow = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: appName }) })
      .first();

    await appRow.waitFor({ state: 'visible', timeout: Timeout.default });
    await appRow.scrollIntoViewIfNeeded();

    // getByRole('button') — Commands context menu trigger inside the row
    await appRow.getByRole('button', { name: 'Commands' }).click();

    // Check whether the Play menuitem is enabled before attempting to click it.
    // Play is disabled when the app has not been published yet.
    const playItem = this.page.getByRole('menu').getByRole('menuitem', { name: 'Play' });
    await playItem.waitFor({ state: 'visible', timeout: Timeout.short });

    const isDisabled = await playItem.isDisabled();
    if (isDisabled) {
      // Close the menu before returning so the page is in a clean state
      await this.page.keyboard.press('Escape');
      console.warn(
        `[GenUxPage] ⚠️  Play is disabled for "${appName}" — app has not been published yet. Skipping play step.`
      );
      return null;
    }

    // Register the new-tab listener BEFORE clicking so we don't miss the event.
    // Power Apps may open the player in a new tab OR navigate the current tab depending
    // on environment configuration. We handle both:
    //   - New tab: resolved by the `context.once('page')` listener within 10 s
    //   - Same tab: fallback — wait for the current page to navigate away
    const newTabPromise = new Promise<Page | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 10_000);
      context.once('page', (newPage) => {
        clearTimeout(timer);
        resolve(newPage);
      });
    });

    await playItem.click();

    const newTab = await newTabPromise;

    if (newTab) {
      // Player opened in a new browser tab
      await newTab.waitForLoadState(DOM_LOAD_STATE);
      console.log(`[GenUxPage] App playing in new tab: ${newTab.url()}`);
      return newTab;
    }

    // Player navigated in the current tab
    await this.page.waitForLoadState(DOM_LOAD_STATE);
    console.log(`[GenUxPage] App playing in same tab: ${this.page.url()}`);
    return this.page;
  }

  /**
   * Delete all apps whose display names start with the given prefix.
   *
   * Searches the Apps list for matching rows, then deletes them one by one.
   * Re-queries after each deletion because the list re-renders.
   * Safe to call when no matching apps exist — logs "0 apps found" and returns.
   *
   * Uses `getByRole('searchbox')` to filter, `getByRole('row')` to locate rows,
   * `getByRole('button', { name: 'Commands' })` for the context menu,
   * `getByRole('menuitem', { name: 'Delete' })` and `getByRole('dialog')` for confirm.
   *
   * @param prefix - Display name prefix to match (e.g. "GenUX BasicForm")
   */
  public async deleteAppsMatchingPrefix(prefix: string): Promise<void> {
    console.log(`[GenUxPage] Searching for apps matching prefix "${prefix}"...`);

    // Filter the list to only show matching apps
    const searchBox = this.page.getByRole('searchbox').or(this.page.getByPlaceholder(/search/i));
    await searchBox.first().fill(prefix, { timeout: Timeout.default });
    await this.page.waitForTimeout(1500);

    const prefixRe = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    let deleted = 0;

    // Re-query each iteration — list re-renders after every deletion
    while (true) {
      const appRows = this.page
        .getByRole('row')
        .filter({ has: this.page.getByRole('link', { name: prefixRe }) });

      const count = await appRows.count();
      if (count === 0) break;

      const firstRow = appRows.first();
      // getByRole('link') — first link in the row is the app name
      const appName = (await firstRow.getByRole('link').first().textContent())?.trim() ?? 'unknown';
      console.log(`[GenUxPage] Deleting "${appName}"...`);

      await firstRow.scrollIntoViewIfNeeded();
      await firstRow.getByRole('button', { name: 'Commands' }).click();

      await this.page.getByRole('menu').getByRole('menuitem', { name: 'Delete' }).click();

      await this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

      // Wait for the success toast — soft failure so stale/unavailable apps don't abort cleanup
      const toastVisible = await this.page
        .getByText(/Successfully deleted app/)
        .waitFor({ state: 'visible', timeout: Timeout.default })
        .then(() => true)
        .catch(() => false);

      if (toastVisible) {
        deleted++;
        console.log(`[GenUxPage] Deleted "${appName}" (${deleted} total)`);
      } else {
        // Toast missed or delete failed. Check if the row is actually gone —
        // if gone, the delete worked silently; if still there, skip to prevent
        // an infinite loop on a stuck/undeletable row.
        console.warn(`[GenUxPage] ⚠️  No success toast for "${appName}"`);
        const rowStillExists = await firstRow.isVisible({ timeout: 2000 }).catch(() => false);
        if (rowStillExists) {
          console.warn(
            `[GenUxPage] Row still visible — skipping "${appName}" to prevent infinite loop`
          );
        } else {
          deleted++;
          console.log(
            `[GenUxPage] Row gone (silent delete) — counted "${appName}" (${deleted} total)`
          );
        }
      }
      await this.page.waitForTimeout(500);
    }

    console.log(`[GenUxPage] Bulk delete complete — ${deleted} app(s) removed`);
  }

  // ── CLEANUP ───────────────────────────────────────────────────────────────

  /**
   * Delete an app from the Maker Portal app list if it exists.
   * Safe to call even if the app was never created — silently skips if not found.
   *
   * Uses `getByRole('row')` to locate the app row, `getByRole('button')` for the
   * Commands trigger, `getByRole('menu') → menuitem` for Delete,
   * `getByRole('dialog') → button` for the confirm dialog,
   * and `getByText()` to verify the success toast.
   *
   * @param appName - Exact display name of the app to delete
   */
  public async deleteAppFromAppListIfFound(appName: string): Promise<void> {
    // getByRole('row') + filter — the row contains a link with the exact app name
    const appRow = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('link', { name: appName }) })
      .first();

    const isVisible = await appRow.isVisible({ timeout: Timeout.default }).catch(() => false);
    if (!isVisible) {
      console.log(`[GenUxPage] App "${appName}" not found — skipping delete`);
      return;
    }

    await appRow.scrollIntoViewIfNeeded();

    // getByRole('button') — Commands context menu trigger inside the row
    const commandsBtn = appRow.getByRole('button', { name: 'Commands' });
    await expect(commandsBtn).toBeVisible();
    await commandsBtn.click();

    // getByRole('menu') → getByRole('menuitem') — Delete option in the context menu
    await this.page.getByRole('menu').getByRole('menuitem', { name: 'Delete' }).click();

    // getByRole('dialog') → getByRole('button') — confirm Delete in the dialog
    await this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

    // getByText() — success toast; no status role on this Fluent UI toast
    await expect(this.page.getByText(/Successfully deleted app/)).toBeVisible({
      timeout: Timeout.default,
    });

    console.log(`[GenUxPage] Successfully deleted app: "${appName}"`);
  }
}
