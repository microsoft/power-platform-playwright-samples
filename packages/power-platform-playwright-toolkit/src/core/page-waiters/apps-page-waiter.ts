/**
 * Apps Page Waiter
 * Handles waiting for Power Apps maker portal Apps page to load
 * Includes VPN error detection, data load retries, and spinner handling
 */

import { Page } from '@playwright/test';
import { PowerAppsPageLocators } from '../../locators/power-apps.locators';
import { IPageWaiter, PageWaiterOptions } from './page-waiter.interface';
import { waitForSpinnerToDisappear } from '../../utils/app-helpers';

/**
 * Waits for Power Apps maker portal Apps page to fully load
 * Implements comprehensive wait strategy with error detection and retries
 *
 * @example
 * ```typescript
 * const waiter = new AppsPageWaiter(page, locators);
 * await waiter.waitForPageLoad(60000);
 * // Apps page is now ready
 * ```
 */
export class AppsPageWaiter implements IPageWaiter {
  /**
   * Creates a new AppsPageWaiter instance
   * @param page - Playwright page object
   * @param locators - PowerAppsPageLocators instance
   */
  constructor(
    private page: Page,
    private locators: PowerAppsPageLocators
  ) {}

  /**
   * Wait for Apps page to fully load
   * Implements multi-stage wait strategy:
   * 1. Critical elements (sidebar, command bar)
   * 2. VPN error detection
   * 3. Data load error detection and retry
   * 4. Optional elements (page container, grid)
   * 5. Spinner disappearance
   *
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @throws {Error} If VPN connectivity is required or page fails to load
   */
  async waitForPageLoad(timeout: number = 60000): Promise<void> {
    console.log('[AppsPageWaiter] Waiting for Apps page to load...');

    // Stage 1: Wait for critical elements that should always be visible
    await this.locators.sidebar.waitFor({ state: 'visible', timeout });
    await this.locators.commandBar.waitFor({ state: 'visible', timeout });

    // Stage 2: Check for critical VPN error first
    await this.checkVPNError();

    // Stage 3: Check for data load error and retry if needed
    await this.retryDataLoadErrors(timeout);

    // Stage 4: Wait for optional elements (don't fail if not visible)
    await this.waitForOptionalElements();

    // Stage 5: Wait for loading to complete
    await waitForSpinnerToDisappear(this.page);

    console.log('[AppsPageWaiter] Apps page fully loaded');
  }

  /**
   * Check if Apps page is currently loaded
   * @returns true if critical elements are visible, false otherwise
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      const sidebarVisible = await this.locators.sidebar.isVisible({ timeout: 1000 });
      const commandBarVisible = await this.locators.commandBar.isVisible({ timeout: 1000 });
      return sidebarVisible && commandBarVisible;
    } catch {
      return false;
    }
  }

  /**
   * Check for VPN connectivity error
   * @throws {Error} If Azure VPN connectivity is required
   */
  private async checkVPNError(): Promise<void> {
    const vpnWarning = this.page.locator('text="Azure VPN connectivity is required"');
    const hasVpnWarning = await vpnWarning.isVisible().catch(() => false);

    if (hasVpnWarning) {
      throw new Error(
        'Azure VPN connectivity is required to access this environment. ' +
          'Please connect to Azure VPN and try again.'
      );
    }
  }

  /**
   * Retry data load errors up to maxRetries times
   * Handles "We couldn't load your data" error with retry logic
   */
  private async retryDataLoadErrors(timeout: number): Promise<void> {
    const errorMessage = this.page.locator('text="We couldn\'t load your data"');
    const tryAgainButton = this.page.locator('button:has-text("Try again")');

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const hasError = await errorMessage.isVisible().catch(() => false);

      if (!hasError) {
        // Data loaded successfully or error not visible
        break;
      }

      console.log(
        `[AppsPageWaiter] Data load error detected, attempt ${retryCount + 1}/${maxRetries}`
      );

      // Click "Try again" button if available
      const hasTryAgainButton = await tryAgainButton.isVisible().catch(() => false);
      if (hasTryAgainButton) {
        console.log('[AppsPageWaiter] Clicking "Try again" button');
        await tryAgainButton.click();
        await this.page.waitForTimeout(3000);
        await waitForSpinnerToDisappear(this.page);
      } else {
        // If no button, reload the page
        console.log('[AppsPageWaiter] Reloading page');
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(3000);
        await waitForSpinnerToDisappear(this.page);
      }

      retryCount++;

      // If this was the last retry, log warning but continue (don't fail)
      if (retryCount === maxRetries) {
        const stillHasError = await errorMessage.isVisible().catch(() => false);
        if (stillHasError) {
          console.warn(
            '[AppsPageWaiter] Apps page data failed to load after retries. ' +
              'This is likely due to authentication token issues. Continuing anyway...'
          );
          // Don't throw error, just continue - the app search might still work
          return;
        }
      }
    }
  }

  /**
   * Wait for optional elements (don't fail if not visible)
   */
  private async waitForOptionalElements(): Promise<void> {
    // Try to wait for page container
    try {
      await this.locators.appsPageMainContainer.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      console.log(
        '[AppsPageWaiter] Page container not visible, possibly due to authentication issues'
      );
    }

    // Try to wait for app list grid
    try {
      await this.locators.appListGrid.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      console.log('[AppsPageWaiter] App list grid not visible, but continuing anyway');
    }
  }
}
