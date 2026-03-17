/**
 * Solutions Page Waiter
 * Handles waiting for Power Apps maker portal Solutions page to load
 */

import { Page } from '@playwright/test';
import { PowerAppsPageLocators } from '../../locators/power-apps.locators';
import { IPageWaiter } from './page-waiter.interface';
import { waitForSpinnerToDisappear } from '../../utils/app-helpers';

/**
 * Waits for Power Apps maker portal Solutions page to fully load
 * Implements simple 3-element wait strategy
 *
 * @example
 * ```typescript
 * const waiter = new SolutionsPageWaiter(page, locators);
 * await waiter.waitForPageLoad();
 * // Solutions page is now ready
 * ```
 */
export class SolutionsPageWaiter implements IPageWaiter {
  /**
   * Creates a new SolutionsPageWaiter instance
   * @param page - Playwright page object
   * @param locators - PowerAppsPageLocators instance
   */
  constructor(
    private page: Page,
    private locators: PowerAppsPageLocators
  ) {}

  /**
   * Wait for Solutions page to fully load
   * Simple wait strategy:
   * 1. Solutions sidebar
   * 2. Command bar
   * 3. Solutions list container
   * 4. Spinner disappearance
   *
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @throws {Error} If page fails to load within timeout
   */
  async waitForPageLoad(timeout: number = 60000): Promise<void> {
    console.log('[SolutionsPageWaiter] Waiting for Solutions page to load...');

    // Wait for solutions sidebar
    await this.locators.solutionsSidebar.waitFor({ state: 'visible', timeout });

    // Wait for command bar
    await this.locators.solutionsCommandBar.waitFor({ state: 'visible', timeout });

    // Wait for solutions list
    await this.locators.solutionsListContainer.waitFor({ state: 'visible', timeout });

    // Wait for loading to complete
    await waitForSpinnerToDisappear(this.page);

    console.log('[SolutionsPageWaiter] Solutions page fully loaded');
  }

  /**
   * Check if Solutions page is currently loaded
   * @returns true if critical elements are visible, false otherwise
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      const sidebarVisible = await this.locators.solutionsSidebar.isVisible({ timeout: 1000 });
      const commandBarVisible = await this.locators.solutionsCommandBar.isVisible({
        timeout: 1000,
      });
      const listVisible = await this.locators.solutionsListContainer.isVisible({ timeout: 1000 });
      return sidebarVisible && commandBarVisible && listVisible;
    } catch {
      return false;
    }
  }
}
