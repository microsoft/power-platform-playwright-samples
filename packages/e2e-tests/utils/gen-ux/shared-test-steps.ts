/**
 * GenUX shared test steps
 * Standard Phases 1–4 (generation) and teardown used by all gen-ux tests
 */

import { test } from '@playwright/test';
import { GenUxPage } from 'power-platform-playwright-toolkit';

export interface GenUxGenerationOptions {
  /** Exact AI prompt to submit to the GenUX text box */
  aiPrompt?: string;
  /** Template pill text to click in the FRE suggestion list */
  templateSelection?: string;
}

/**
 * Performs the standard GenUX setup workflow (Phases 1–4).
 *
 * Steps executed:
 * 1. Navigate to Apps page
 * 2. Start new app with "Blank page with navigation" template
 * 3. Create the app with the given name
 * 4. Add a new GenUX page (opens AI prompt panel)
 * 5. Submit the AI prompt or select a template
 * 6. Verify thought streaming ("Working on it...")
 * 7. Verify Code + Preview tabs appear, code streaming completes
 *
 * @param genUxPage - GenUxPage instance from `appProvider.getGenUxPage()`
 * @param appName   - Unique display name (use timestamp suffix to avoid collisions)
 * @param options   - Provide `aiPrompt` OR `templateSelection` (one is required)
 * @throws If neither `aiPrompt` nor `templateSelection` is provided
 */
export async function performGenUxBasicSetup(
  genUxPage: GenUxPage,
  appName: string,
  options: GenUxGenerationOptions
): Promise<void> {
  if (!options.aiPrompt && !options.templateSelection) {
    throw new Error('GenUxGenerationOptions: provide either aiPrompt or templateSelection');
  }

  await test.step('Navigate to Apps page', async () => {
    await genUxPage.goToAppsPage();
  });

  await test.step('Start new app with page design template', async () => {
    await genUxPage.navigateToStartWithPageDesign();
  });

  await test.step(`Create app "${appName}"`, async () => {
    await genUxPage.createAppWithName(appName);
  });

  await test.step('Add new GenUX page', async () => {
    await genUxPage.addNewPage();
  });

  if (options.aiPrompt) {
    await test.step('Submit AI prompt', async () => {
      await genUxPage.waitForUCIPreviewFrameAndFillPrompt(options.aiPrompt!);
    });
  } else {
    await test.step(`Select template: "${options.templateSelection}"`, async () => {
      await genUxPage.waitForUCIPreviewFrameAndSelectTemplate(options.templateSelection!);
    });
  }

  await test.step('Verify AI thought streaming (planning phase)', async () => {
    await genUxPage.verifyThoughtStreaming();
  });

  await test.step('Verify Code and Preview tabs, await code generation', async () => {
    await genUxPage.verifyCodeAndPreviewTabsAvailable();
    await genUxPage.verifyCodeStreaming();
  });
}

/**
 * Teardown: navigate to Apps page and delete every app created by the test.
 * Always call from `test.afterEach` to prevent leftover apps in the shared environment.
 *
 * @param genUxPage    - GenUxPage instance from `appProvider.getGenUxPage()`
 * @param appsToDelete - Array of app display names to delete
 */
export async function performGenUxBasicTeardown(
  genUxPage: GenUxPage,
  appsToDelete: string[]
): Promise<void> {
  await test.step('Clean up created apps', async () => {
    await genUxPage.goToAppsPage();
    for (const appName of appsToDelete) {
      await genUxPage.deleteAppFromAppListIfFound(appName);
    }
  });
}
