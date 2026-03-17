/**
 * Power Platform Navigator
 * Orchestrates navigation to Power Platform maker portal pages
 * Uses URLBuilder for URL construction and PageWaiters for page load detection
 */

import { Page } from '@playwright/test';
import { PowerAppsPageLocators } from '../locators/power-apps.locators';
import { URLBuilder } from './url-builder';
import { PageWaiterFactory, PageType } from './page-waiters/page-waiter-factory';

/**
 * Options for configuring PowerPlatformNavigator
 */
export interface NavigatorOptions {
  /**
   * Base URL for Power Apps maker portal
   * @default ConfigHelper.getBaseUrl()
   */
  baseUrl?: string;

  /**
   * Environment ID to include in URLs
   * @default ConfigHelper.getEnvironmentId()
   */
  environmentId?: string;
}

/**
 * Options for navigation operations
 */
export interface NavigationOptions {
  /**
   * Maximum wait time in milliseconds
   * @default 60000
   */
  timeout?: number;

  /**
   * Whether to wait for page load after navigation
   * @default true
   */
  waitForLoad?: boolean;

  /**
   * Whether to wait for networkidle state
   * @default false (not recommended for modern apps that continuously poll)
   */
  waitForNetworkIdle?: boolean;
}

/**
 * Orchestrates navigation to Power Platform maker portal pages
 * Provides modular, reusable navigation logic with proper separation of concerns
 *
 * @example
 * ```typescript
 * const navigator = new PowerPlatformNavigator(page, locators);
 *
 * // Navigate to Apps page
 * await navigator.navigateToApps();
 *
 * // Navigate to Solutions page with custom timeout
 * await navigator.navigateToSolutions({ timeout: 30000 });
 *
 * // Navigate to Home page without waiting
 * await navigator.navigateToHome({ waitForLoad: false });
 * ```
 */
export class PowerPlatformNavigator {
  private urlBuilder: URLBuilder;
  private waiterFactory: PageWaiterFactory;

  /**
   * Creates a new PowerPlatformNavigator instance
   * @param page - Playwright page object
   * @param locators - PowerAppsPageLocators instance
   * @param options - Navigator configuration options
   */
  constructor(
    private page: Page,
    locators: PowerAppsPageLocators,
    options?: NavigatorOptions
  ) {
    this.urlBuilder = new URLBuilder(options?.baseUrl, options?.environmentId);
    this.waiterFactory = new PageWaiterFactory(page, locators);
  }

  /**
   * Navigate to Apps page
   * @param options - Navigation options
   * @throws {Error} If navigation fails
   *
   * @example
   * ```typescript
   * await navigator.navigateToApps();
   * // Apps page is now loaded and ready
   * ```
   */
  async navigateToApps(options?: NavigationOptions): Promise<void> {
    const url = this.urlBuilder.buildAppsPageUrl();
    await this.navigateAndWait(url, 'apps', options);
  }

  /**
   * Navigate to Solutions page
   * @param options - Navigation options
   * @throws {Error} If navigation fails
   *
   * @example
   * ```typescript
   * await navigator.navigateToSolutions({ timeout: 30000 });
   * // Solutions page is now loaded
   * ```
   */
  async navigateToSolutions(options?: NavigationOptions): Promise<void> {
    const url = this.urlBuilder.buildSolutionsPageUrl();
    await this.navigateAndWait(url, 'solutions', options);
  }

  /**
   * Navigate to Home page
   * @param options - Navigation options
   * @throws {Error} If navigation fails
   *
   * @example
   * ```typescript
   * await navigator.navigateToHome();
   * // Home page is now loaded
   * ```
   */
  async navigateToHome(options?: NavigationOptions): Promise<void> {
    const url = this.urlBuilder.buildHomePageUrl();
    await this.navigateAndWait(url, 'home', options);
  }

  /**
   * Navigate to Flows page
   * @param options - Navigation options
   * @throws {Error} If navigation fails
   */
  async navigateToFlows(options?: NavigationOptions): Promise<void> {
    const url = this.urlBuilder.buildFlowsPageUrl();
    await this.navigateAndWait(url, 'flows', options);
  }

  /**
   * Navigate to Tables page
   * @param options - Navigation options
   * @throws {Error} If navigation fails
   */
  async navigateToTables(options?: NavigationOptions): Promise<void> {
    const url = this.urlBuilder.buildTablesPageUrl();
    await this.navigateAndWait(url, 'tables', options);
  }

  /**
   * Navigate to Connections page
   * @param options - Navigation options
   * @throws {Error} If navigation fails
   */
  async navigateToConnections(options?: NavigationOptions): Promise<void> {
    const url = this.urlBuilder.buildConnectionsPageUrl();
    await this.navigateAndWait(url, 'connections', options);
  }

  /**
   * Navigate to a URL and wait for page load
   * Generic method used by all page-specific navigation methods
   *
   * @param url - URL to navigate to
   * @param pageType - Type of page for waiter selection
   * @param options - Navigation options
   */
  private async navigateAndWait(
    url: string,
    pageType: PageType,
    options?: NavigationOptions
  ): Promise<void> {
    const timeout = options?.timeout || 60000;
    const waitForLoad = options?.waitForLoad !== false;
    const waitForNetworkIdle = options?.waitForNetworkIdle === true;

    console.log(`[PowerPlatformNavigator] Navigating to ${pageType} page: ${url}`);

    // Navigate to URL
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });

    // Optional networkidle wait (not recommended for modern apps)
    if (waitForNetworkIdle) {
      await this.page.waitForLoadState('networkidle').catch(() => {
        console.log('[PowerPlatformNavigator] networkidle timeout, continuing...');
      });
    }

    // Page-specific wait strategy
    if (waitForLoad) {
      const waiter = this.waiterFactory.getWaiter(pageType);
      await waiter.waitForPageLoad(timeout);
    }

    console.log(`[PowerPlatformNavigator] Navigation completed - ${this.page.url()}`);
  }

  /**
   * Get the URLBuilder instance
   * Useful for getting URLs without navigating
   *
   * @returns URLBuilder instance
   *
   * @example
   * ```typescript
   * const urlBuilder = navigator.getURLBuilder();
   * const appsUrl = urlBuilder.buildAppsPageUrl();
   * console.log('Apps URL:', appsUrl);
   * ```
   */
  getURLBuilder(): URLBuilder {
    return this.urlBuilder;
  }

  /**
   * Get the PageWaiterFactory instance
   * Useful for accessing waiters directly
   *
   * @returns PageWaiterFactory instance
   */
  getWaiterFactory(): PageWaiterFactory {
    return this.waiterFactory;
  }

  /**
   * Update environment ID for subsequent navigations
   * @param environmentId - New environment ID
   *
   * @example
   * ```typescript
   * navigator.setEnvironment('env-123');
   * await navigator.navigateToApps(); // Will use env-123
   * ```
   */
  setEnvironment(environmentId: string): void {
    this.urlBuilder.setEnvironment(environmentId);
  }

  /**
   * Check if currently on a specific page type
   * @param pageType - Type of page to check
   * @returns true if on the specified page type, false otherwise
   */
  async isOnPage(pageType: PageType): Promise<boolean> {
    const waiter = this.waiterFactory.getWaiter(pageType);
    return await waiter.isPageLoaded();
  }
}
