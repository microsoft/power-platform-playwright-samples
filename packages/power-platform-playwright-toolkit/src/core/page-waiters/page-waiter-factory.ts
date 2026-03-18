/**
 * Page Waiter Factory
 * Creates appropriate page waiter instances based on page type
 * Uses factory pattern for singleton waiter instances per page type
 */

import { Page } from '@playwright/test';
import { PowerAppsPageLocators } from '../../locators/power-apps.locators';
import { IPageWaiter } from './page-waiter.interface';
import { AppsPageWaiter } from './apps-page-waiter';
import { SolutionsPageWaiter } from './solutions-page-waiter';
import { HomePageWaiter } from './home-page-waiter';

/**
 * Supported page types in Power Platform maker portal
 */
export type PageType = 'apps' | 'solutions' | 'home' | 'flows' | 'tables' | 'connections';

/**
 * Generic page waiter for pages without specific implementations
 * Uses simple wait strategy
 */
class GenericPageWaiter implements IPageWaiter {
  constructor(
    private page: Page,
    private locators: PowerAppsPageLocators
  ) {}

  async waitForPageLoad(_timeout: number = 60000): Promise<void> {
    console.log('[GenericPageWaiter] Waiting for page to load...');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(5000);
    console.log('[GenericPageWaiter] Page loaded');
  }

  async isPageLoaded(): Promise<boolean> {
    return this.page.url() !== 'about:blank';
  }
}

/**
 * Factory for creating page waiter instances
 * Uses singleton pattern to reuse waiter instances per page type
 *
 * @example
 * ```typescript
 * const factory = new PageWaiterFactory(page, locators);
 * const appsWaiter = factory.getWaiter('apps');
 * await appsWaiter.waitForPageLoad();
 *
 * const solutionsWaiter = factory.getWaiter('solutions');
 * await solutionsWaiter.waitForPageLoad();
 * ```
 */
export class PageWaiterFactory {
  private waiters = new Map<PageType, IPageWaiter>();

  /**
   * Creates a new PageWaiterFactory instance
   * @param page - Playwright page object
   * @param locators - PowerAppsPageLocators instance
   */
  constructor(
    private page: Page,
    private locators: PowerAppsPageLocators
  ) {}

  /**
   * Get a waiter for the specified page type
   * Returns cached instance if available, creates new one otherwise
   *
   * @param pageType - Type of page ('apps', 'solutions', 'home', etc.)
   * @returns IPageWaiter instance for the specified page type
   *
   * @example
   * ```typescript
   * const waiter = factory.getWaiter('apps');
   * await waiter.waitForPageLoad(30000);
   * ```
   */
  getWaiter(pageType: PageType): IPageWaiter {
    if (!this.waiters.has(pageType)) {
      this.waiters.set(pageType, this.createWaiter(pageType));
    }
    return this.waiters.get(pageType)!;
  }

  /**
   * Create a new waiter instance for the specified page type
   * @param pageType - Type of page
   * @returns New IPageWaiter instance
   */
  private createWaiter(pageType: PageType): IPageWaiter {
    switch (pageType) {
      case 'apps':
        return new AppsPageWaiter(this.page, this.locators);
      case 'solutions':
        return new SolutionsPageWaiter(this.page, this.locators);
      case 'home':
        return new HomePageWaiter(this.page, this.locators);
      case 'flows':
      case 'tables':
      case 'connections':
      default:
        // Use generic waiter for pages without specific implementations
        return new GenericPageWaiter(this.page, this.locators);
    }
  }

  /**
   * Clear all cached waiter instances
   * Useful when page context changes
   */
  clearCache(): void {
    this.waiters.clear();
  }

  /**
   * Check if a waiter exists for the specified page type
   * @param pageType - Type of page
   * @returns true if waiter instance is cached, false otherwise
   */
  hasWaiter(pageType: PageType): boolean {
    return this.waiters.has(pageType);
  }
}
