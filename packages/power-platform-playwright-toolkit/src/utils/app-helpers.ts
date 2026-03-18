/**
 * App Testing Helper Utilities
 * Common utility functions for Canvas and Model Driven app testing
 */

import { Page, Locator } from '@playwright/test';

/**
 * Generate a unique app name with timestamp
 * @param prefix - Prefix for the app name
 * @returns Unique app name
 */
export function generateUniqueAppName(prefix: string = 'TestApp'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate random alphanumeric string
 * @param length - Length of the string
 * @returns Random alphanumeric string
 */
export function generateRandomAlphaNumeric(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate random number within a range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number between min and max
 *
 * @example
 * ```typescript
 * // Generate number between 1 and 100
 * const num = generateRandomNumber(1, 100);
 *
 * // Generate 5-digit number (10000-99999)
 * const orderNum = generateRandomNumber(10000, 99999);
 * ```
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate unique order number (5-digit random number)
 * Useful for test data generation in Model-Driven Apps and Canvas Apps
 *
 * @param digits - Number of digits (default: 5)
 * @returns Random number as string with specified digits
 *
 * @example
 * ```typescript
 * // Generate 5-digit order number
 * const orderNumber = generateUniqueOrderNumber(); // "12345"
 *
 * // Generate 6-digit order number
 * const orderNumber = generateUniqueOrderNumber(6); // "123456"
 * ```
 */
export function generateUniqueOrderNumber(digits: number = 5): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return generateRandomNumber(min, max).toString();
}

/**
 * Generate unique test ID with timestamp and random component
 * Useful for generating unique identifiers in tests
 *
 * @param prefix - Prefix for the ID (default: 'TEST')
 * @returns Unique test ID
 *
 * @example
 * ```typescript
 * const testId = generateUniqueTestId(); // "TEST-1234567890-123"
 * const testId = generateUniqueTestId('ORDER'); // "ORDER-1234567890-123"
 * ```
 */
export function generateUniqueTestId(prefix: string = 'TEST'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Options for building Canvas App URL
 */
export interface CanvasAppUrlOptions {
  /** Direct Canvas App URL (if provided, other options are ignored) */
  directUrl?: string;
  /** Power Apps environment ID */
  environmentId?: string;
  /** Canvas App ID */
  appId?: string;
  /** Tenant ID */
  tenantId?: string;
}

/**
 * Build Canvas App Play URL from direct URL or component IDs
 * Supports two modes:
 * 1. Direct URL: Use directUrl if provided
 * 2. Build from IDs: Use environmentId + appId + tenantId
 *
 * @param options - Canvas App URL options or environment variable prefix
 * @returns Canvas App play URL
 * @throws {Error} If neither direct URL nor required component IDs are provided
 *
 * @example
 * ```typescript
 * // Option 1: Using direct URL
 * const url = buildCanvasAppUrl({
 *   directUrl: 'https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id'
 * });
 *
 * // Option 2: Building from component IDs
 * const url = buildCanvasAppUrl({
 *   environmentId: 'd413c445-44c5-ed7c-be0f-761eaeee1919',
 *   appId: '8f6e67b9-93af-4cf4-b1f0-b6b25c20e2dc',
 *   tenantId: '91bee3d9-0c15-4f17-8624-c92bb8b36ead'
 * });
 *
 * // Option 3: From environment variables
 * const url = buildCanvasAppUrlFromEnv();
 * // Reads from: CANVAS_APP_URL, POWER_APPS_ENVIRONMENT_ID, CANVAS_APP_ID, CANVAS_APP_TENANT_ID
 * ```
 */
export function buildCanvasAppUrl(options: CanvasAppUrlOptions): string {
  // Option 1: Use direct URL if provided
  if (options.directUrl) {
    return options.directUrl;
  }

  // Option 2: Build URL from component IDs
  const { environmentId, appId, tenantId } = options;

  if (!environmentId || !appId || !tenantId) {
    throw new Error(
      'Canvas App configuration is missing. Please provide one of the following:\n' +
        '1. directUrl (direct Canvas App URL), OR\n' +
        '2. environmentId + appId + tenantId (component IDs to build URL)\n\n' +
        'Example:\n' +
        'buildCanvasAppUrl({\n' +
        '  environmentId: "d413c445-44c5-ed7c-be0f-761eaeee1919",\n' +
        '  appId: "8f6e67b9-93af-4cf4-b1f0-b6b25c20e2dc",\n' +
        '  tenantId: "91bee3d9-0c15-4f17-8624-c92bb8b36ead"\n' +
        '})'
    );
  }

  // Build the play URL
  return `https://apps.powerapps.com/play/e/${environmentId}/a/${appId}?tenantId=${tenantId}`;
}

/**
 * Build Canvas App Play URL from environment variables
 * Reads from process.env:
 * - CANVAS_APP_URL (direct URL), OR
 * - POWER_APPS_ENVIRONMENT_ID + CANVAS_APP_ID + CANVAS_APP_TENANT_ID
 *
 * @returns Canvas App play URL
 * @throws {Error} If required environment variables are not set
 *
 * @example
 * ```typescript
 * // Set environment variables in .env file:
 * // CANVAS_APP_URL=https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id
 * // OR
 * // POWER_APPS_ENVIRONMENT_ID=d413c445-44c5-ed7c-be0f-761eaeee1919
 * // CANVAS_APP_ID=8f6e67b9-93af-4cf4-b1f0-b6b25c20e2dc
 * // CANVAS_APP_TENANT_ID=91bee3d9-0c15-4f17-8624-c92bb8b36ead
 *
 * const url = buildCanvasAppUrlFromEnv();
 * ```
 */
export function buildCanvasAppUrlFromEnv(): string {
  return buildCanvasAppUrl({
    directUrl: process.env.CANVAS_APP_URL,
    environmentId: process.env.POWER_APPS_ENVIRONMENT_ID,
    appId: process.env.CANVAS_APP_ID,
    tenantId: process.env.CANVAS_APP_TENANT_ID,
  });
}

/**
 * Wait for element to be visible with custom timeout
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param timeout - Timeout in milliseconds (default: 30000)
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 30000
): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

/**
 * Wait for element to be hidden
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param timeout - Timeout in milliseconds (default: 30000)
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout: number = 30000
): Promise<void> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * Wait for spinner/loading indicator to disappear
 * @param page - Playwright page object
 * @param spinnerSelector - Spinner selector (default: common spinner)
 * @param timeout - Timeout in milliseconds (default: 60000)
 */
export async function waitForSpinnerToDisappear(
  page: Page,
  spinnerSelector: string = '[role="progressbar"][aria-label="Loading"]',
  timeout: number = 60000
): Promise<void> {
  try {
    await page.locator(spinnerSelector).waitFor({ state: 'hidden', timeout });
  } catch {
    // Spinner might not appear at all, which is fine
    console.log('Spinner did not appear or already disappeared');
  }
}

/**
 * Click element with retry logic
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param retries - Number of retries (default: 3)
 */
export async function clickWithRetry(
  page: Page,
  selector: string,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await page.locator(selector).click({ timeout: 10000 });
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Fill input field with retry logic
 * @param page - Playwright page object
 * @param selector - Input selector
 * @param value - Value to fill
 * @param retries - Number of retries (default: 3)
 */
export async function fillWithRetry(
  page: Page,
  selector: string,
  value: string,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const input = page.locator(selector);
      await input.clear();
      await input.fill(value);
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Check if element exists without throwing error
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns True if element exists, false otherwise
 */
export async function elementExists(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get element count
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns Number of elements matching the selector
 */
export async function getElementCount(page: Page, selector: string): Promise<number> {
  return await page.locator(selector).count();
}

/**
 * Scroll element into view
 * @param page - Playwright page object
 * @param selector - Element selector
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for network to be idle
 * @param page - Playwright page object
 * @param timeout - Timeout in milliseconds (default: 30000)
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 30000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take screenshot with timestamp
 * @param page - Playwright page object
 * @param screenshotName - Name for the screenshot
 * @param path - Path to save screenshot (default: ./screenshots/)
 */
export async function takeScreenshot(
  page: Page,
  screenshotName: string,
  path: string = './screenshots/'
): Promise<void> {
  const timestamp = Date.now();
  await page.screenshot({
    path: `${path}${screenshotName}_${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Handle dialog/popup
 * @param page - Playwright page object
 * @param accept - True to accept, false to dismiss
 * @param promptText - Optional text for prompt dialogs
 */
export async function handleDialog(
  page: Page,
  accept: boolean = true,
  promptText?: string
): Promise<void> {
  page.once('dialog', async (dialog) => {
    if (promptText) {
      await dialog.accept(promptText);
    } else if (accept) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/**
 * Wait for file download
 * @param page - Playwright page object
 * @returns Downloaded file path
 */
export async function waitForDownload(page: Page): Promise<string> {
  const [download] = await Promise.all([page.waitForEvent('download')]);
  return (await download.path()) || '';
}

/**
 * Upload file to input
 * @param page - Playwright page object
 * @param selector - File input selector
 * @param filePath - Path to file to upload
 */
export async function uploadFile(page: Page, selector: string, filePath: string): Promise<void> {
  await page.locator(selector).setInputFiles(filePath);
}

/**
 * Clear and type with delay (for better stability)
 * @param page - Playwright page object
 * @param selector - Input selector
 * @param text - Text to type
 * @param delay - Delay between keystrokes in ms (default: 50)
 */
export async function typeWithDelay(
  page: Page,
  selector: string,
  text: string,
  delay: number = 50
): Promise<void> {
  const input = page.locator(selector);
  await input.clear();
  await input.type(text, { delay });
}

/**
 * Select option from dropdown
 * @param page - Playwright page object
 * @param selector - Dropdown selector
 * @param option - Option to select (value, label, or index)
 */
export async function selectDropdownOption(
  page: Page,
  selector: string,
  option: string | number
): Promise<void> {
  if (typeof option === 'number') {
    await page.locator(selector).selectOption({ index: option });
  } else {
    await page.locator(selector).selectOption(option);
  }
}

/**
 * Hover over element
 * @param page - Playwright page object
 * @param selector - Element selector
 */
export async function hoverElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).hover();
}

/**
 * Double click element
 * @param page - Playwright page object
 * @param selector - Element selector
 */
export async function doubleClickElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).dblclick();
}

/**
 * Right click element
 * @param page - Playwright page object
 * @param selector - Element selector
 */
export async function rightClickElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).click({ button: 'right' });
}

/**
 * Get element text content
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns Text content of the element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  return (await page.locator(selector).textContent()) || '';
}

/**
 * Get element attribute value
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param attribute - Attribute name
 * @returns Attribute value
 */
export async function getAttributeValue(
  page: Page,
  selector: string,
  attribute: string
): Promise<string> {
  return (await page.locator(selector).getAttribute(attribute)) || '';
}

/**
 * Check if element is enabled
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns True if enabled, false otherwise
 */
export async function isElementEnabled(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).isEnabled();
}

/**
 * Check if element is disabled
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns True if disabled, false otherwise
 */
export async function isElementDisabled(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).isDisabled();
}

/**
 * Check if element is checked (checkbox/radio)
 * @param page - Playwright page object
 * @param selector - Element selector
 * @returns True if checked, false otherwise
 */
export async function isElementChecked(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).isChecked();
}

/**
 * Wait for specific number of elements
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param count - Expected count
 * @param timeout - Timeout in milliseconds (default: 30000)
 */
export async function waitForElementCount(
  page: Page,
  selector: string,
  count: number,
  timeout: number = 30000
): Promise<void> {
  await page.waitForFunction(
    (args) => {
      const elements = document.querySelectorAll(args.selector);
      return elements.length === args.count;
    },
    { selector, count },
    { timeout }
  );
}

/**
 * Press keyboard key
 * @param page - Playwright page object
 * @param key - Key to press (e.g., 'Enter', 'Escape', 'Tab')
 */
export async function pressKey(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
}

/**
 * Press keyboard shortcut
 * @param page - Playwright page object
 * @param modifiers - Modifier keys (e.g., ['Control', 'Shift'])
 * @param key - Key to press
 */
export async function pressShortcut(page: Page, modifiers: string[], key: string): Promise<void> {
  const shortcut = [...modifiers, key].join('+');
  await page.keyboard.press(shortcut);
}
