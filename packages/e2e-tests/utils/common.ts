import { TimeOut } from 'power-platform-playwright-toolkit';
import { Frame, FrameLocator, Locator, Page } from '@playwright/test';

export type Locatable = Page | Locator | FrameLocator | Frame;

/**
 * Clicks the selector
 */
export const clickSelector = async (locatable: Locatable, selector: string) => {
  await locatable.locator(selector).waitFor({ timeout: TimeOut.OneMinuteTimeOut });
  await locatable.locator(selector).click();
};

/**
 * Fill Text Input
 */
export async function fillTextInput(locatable: Locatable, selector: string, textToFill: string) {
  await locatable.locator(selector).fill(textToFill);
}

/**
 * Wait For Selector To Enable (attached to DOM)
 */
export function waitForSelectorToEnable(locatable: Locatable, selector: string): Promise<void> {
  return locatable
    .locator(selector)
    .first()
    .waitFor({ state: 'attached', timeout: TimeOut.DefaultMaxWaitTime });
}

/**
 * Wait For Selector To Disable (hidden/detached)
 */
export function waitForSelectorToDisable(locatable: Locatable, selector: string): Promise<void> {
  return locatable
    .locator(selector)
    .waitFor({ state: 'hidden', timeout: TimeOut.DefaultMaxWaitTime });
}

/**
 * Clear and Fill Text Input
 */
export async function clearAndFillTextInput(
  locatable: Locatable,
  selector: string,
  textToFill: string
) {
  const input = locatable.locator(selector);
  await input.clear();
  await input.fill(textToFill);
}

/**
 * Delay execution
 */
export function delay(milliseconds: number): Promise<void> {
  if (milliseconds < 0) {
    return Promise.reject();
  }
  return new Promise((resolve) => setTimeout(() => resolve(), milliseconds));
}

/**
 * Navigate to a page in new tab
 */
export const navigateToNewTab = async (page: Page, selector: string) => {
  const [newTab] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator(selector).first().click(),
  ]);
  await page.waitForLoadState();
  return newTab;
};

/**
 * Helper function to get environment configuration values
 */
export function getEnvironmentConfig() {
  return {
    repeatEach: parseInt(process.env.REPEAT_EACH || '1', 5),
    retries: process.env.CI ? 1 : parseInt(process.env.RETRIES || '0', 1),
    testDirectory: process.env.TEST_DIRECTORY || './tests',
    testTimeout: parseInt(process.env.TEST_TIMEOUT || String(TimeOut.TestTimeout), 10),
    workers: process.env.CI ? 1 : parseInt(process.env.WORKERS || '1', 10),
    outputDirectory: process.env.OUTPUT_DIRECTORY || './test-results',
    slowMo: parseInt(process.env.SLOW_MO || '0', 40),
    headless: process.env.CI ? true : process.env.HEADLESS === 'true',
  };
}
