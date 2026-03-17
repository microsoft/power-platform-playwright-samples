/**
 * Home Page Waiter
 * Handles waiting for Power Apps maker portal Home page to load
 * Includes optional element handling and navigation fallbacks
 */

import { Page } from '@playwright/test';
import { PowerAppsPageLocators } from '../../locators/power-apps.locators';
import { IPageWaiter } from './page-waiter.interface';
import { waitForSpinnerToDisappear } from '../../utils/app-helpers';

/**
 * Waits for Power Apps maker portal Home page to fully load
 * Implements flexible wait strategy with optional elements and fallbacks
 *
 * @example
 * ```typescript
 * const waiter = new HomePageWaiter(page, locators);
 * await waiter.waitForPageLoad();
 * // Home page is now ready
 * ```
 */
export class HomePageWaiter implements IPageWaiter {
  /**
   * Creates a new HomePageWaiter instance
   * @param page - Playwright page object
   * @param locators - PowerAppsPageLocators instance
   */
  constructor(
    private page: Page,
    private locators: PowerAppsPageLocators
  ) {}

  /**
   * Wait for Home page to fully load
   * Flexible wait strategy:
   * 1. Root element (required)
   * 2. Page header (required)
   * 3. Main navigation (optional - tries multiple selectors)
   * 4. Main content (optional - may not exist on error pages)
   * 5. Spinner disappearance
   *
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @throws {Error} If critical elements fail to load within timeout
   */
  async waitForPageLoad(timeout: number = 60000): Promise<void> {
    console.log('[HomePageWaiter] Waiting for Home page to load...');

    // Wait for root element
    await this.locators.root.waitFor({ state: 'attached', timeout });

    // Wait for page header
    await this.locators.pageHeader.waitFor({ state: 'visible', timeout });

    // Wait for main navigation (optional - selector might vary)
    await this.waitForNavigation();

    // Wait for main content (optional - may not exist on error pages)
    await this.waitForMainContent();

    // Wait for any loading spinners to disappear
    await waitForSpinnerToDisappear(this.page);

    console.log('[HomePageWaiter] Home page fully loaded');
  }

  /**
   * Check if Home page is currently loaded
   * @returns true if critical elements are visible, false otherwise
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      const rootAttached = await this.locators.root.isVisible({ timeout: 1000 });
      const headerVisible = await this.locators.pageHeader.isVisible({ timeout: 1000 });
      return rootAttached && headerVisible;
    } catch {
      return false;
    }
  }

  /**
   * Wait for main navigation with fallback selectors
   * Navigation might not be visible or have different structure
   */
  private async waitForNavigation(): Promise<void> {
    try {
      await this.locators.mainNavigation.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      // Try alternative navigation selector with capital M
      try {
        await this.page
          .locator('[role="navigation"][aria-label="Main"]')
          .waitFor({ state: 'visible', timeout: 10000 });
      } catch {
        // Navigation might not be visible or have different structure, continue anyway
        console.log('[HomePageWaiter] Navigation not found with standard selectors, continuing...');
      }
    }
  }

  /**
   * Wait for main content (optional)
   * Main content might not be visible on first load or error pages
   */
  private async waitForMainContent(): Promise<void> {
    try {
      await this.locators.homePageMainContent.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      // Main content might not be visible on first load or error pages
      console.log('[HomePageWaiter] Main content not visible, continuing...');
    }
  }
}
