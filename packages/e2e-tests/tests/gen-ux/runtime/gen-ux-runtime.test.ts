// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Gen UX Runtime Test — Published Contact Form
 *
 * Tests a published Gen UX app by navigating to its play URL and interacting
 * with the AI-generated contact form. This is a **runtime** test — it requires:
 *
 *   1. The gen-ux authoring test (`studio-authoring` project) to have published the app.
 *   2. `GEN_UX_APP_URL` set in `.env` to the published app's play URL.
 *
 * The `gen-ux-runtime` project declares `studio-authoring` as a dependency so that
 * when the full suite runs, the authoring test publishes the app before these tests open it.
 *
 * How to get the URL:
 *   - Run `npx playwright test --project=studio-authoring` (or the full suite).
 *   - Open the published app from the Power Apps Maker Portal → Apps → Play.
 *   - Copy the URL from the browser and set it in .env as GEN_UX_APP_URL.
 *
 * @requires GEN_UX_APP_URL in .env
 * @requires Authentication: npm run auth:headful
 */

import { test, expect } from '@playwright/test';
import { findFormInput, GenUxConstants } from '../../../utils/gen-ux/gen-ux-utils';

const GEN_UX_APP_URL = process.env.GEN_UX_APP_URL;

test.describe('Gen UX — Published Form (Runtime)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !GEN_UX_APP_URL,
      'GEN_UX_APP_URL is not set — publish the gen-ux app first, then set the URL in .env'
    );

    await page.goto(GEN_UX_APP_URL!, { waitUntil: 'domcontentloaded', timeout: 60000 });
  });

  test('should display all required form fields', async ({ page }) => {
    const firstNameInput = await findFormInput(page, 'firstName');
    const lastNameInput = await findFormInput(page, 'lastName');
    const emailInput = await findFormInput(page, 'email');

    await expect(firstNameInput).toBeVisible({ timeout: 30000 });
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    console.log('All three form fields are visible');
  });

  test('should fill and submit the contact form successfully', async ({ page }) => {
    const firstNameInput = await findFormInput(page, 'firstName');
    const lastNameInput = await findFormInput(page, 'lastName');
    const emailInput = await findFormInput(page, 'email');

    await firstNameInput.fill(GenUxConstants.VALID_FORM_DATA.firstName);
    await lastNameInput.fill(GenUxConstants.VALID_FORM_DATA.lastName);
    await emailInput.fill(GenUxConstants.VALID_FORM_DATA.email);

    console.log(
      `Filled: firstName="${GenUxConstants.VALID_FORM_DATA.firstName}", lastName="${GenUxConstants.VALID_FORM_DATA.lastName}", email="${GenUxConstants.VALID_FORM_DATA.email}"`
    );

    const submitBtn = page
      .getByRole('button', { name: /submit/i })
      .or(page.getByRole('button', { name: /save/i }));
    await submitBtn.first().click();

    // Success text is AI-generated and varies — check for any success-pattern match.
    // GenUX apps may show a toast ("Form submitted!") OR navigate to a thank-you page.
    const successLocator = page.getByText(/submitted|saved|success|created|added|thank/i).first();
    await successLocator.waitFor({ state: 'visible', timeout: 30000 });
    const successText = (await successLocator.textContent()) ?? '(no text)';
    console.log(`Submit success: "${successText.trim()}"`);
    expect(successText.trim()).toBeTruthy();
  });
});
