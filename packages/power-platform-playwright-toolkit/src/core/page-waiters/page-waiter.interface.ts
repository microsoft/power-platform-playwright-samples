/**
 * Page Waiter Interface
 * Defines contract for all page-specific wait strategies
 */

/**
 * Interface for page wait strategies
 * Each Power Platform page (Apps, Solutions, Home, etc.) implements this interface
 * to provide page-specific wait logic
 *
 * @example
 * ```typescript
 * class AppsPageWaiter implements IPageWaiter {
 *   async waitForPageLoad(timeout?: number): Promise<void> {
 *     // Wait for apps page specific elements
 *   }
 *
 *   async isPageLoaded(): Promise<boolean> {
 *     // Check if apps page is loaded
 *     return true;
 *   }
 * }
 * ```
 */
export interface IPageWaiter {
  /**
   * Wait for page to fully load
   * Implements page-specific wait strategy (elements, error detection, spinner, etc.)
   *
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @throws {Error} If page load fails or timeout is reached
   *
   * @example
   * ```typescript
   * const waiter = new AppsPageWaiter(page, locators);
   * await waiter.waitForPageLoad(30000);
   * ```
   */
  waitForPageLoad(timeout?: number): Promise<void>;

  /**
   * Check if page is currently loaded
   * Returns immediately without waiting
   *
   * @returns Promise resolving to true if page is loaded, false otherwise
   *
   * @example
   * ```typescript
   * const isLoaded = await waiter.isPageLoaded();
   * if (!isLoaded) {
   *   console.log('Page not ready yet');
   * }
   * ```
   */
  isPageLoaded(): Promise<boolean>;
}

/**
 * Options for configuring page waiter behavior
 */
export interface PageWaiterOptions {
  /**
   * Maximum wait time in milliseconds
   * @default 60000
   */
  timeout?: number;

  /**
   * Whether to retry on error
   * @default true
   */
  retryOnError?: boolean;

  /**
   * Maximum number of retries
   * @default 3
   */
  maxRetries?: number;

  /**
   * Whether to throw on timeout
   * If false, will log warning and continue
   * @default true
   */
  throwOnTimeout?: boolean;
}
