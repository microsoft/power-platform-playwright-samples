/**
 * App Runtime Waiter
 * Handles waiting for Power Platform apps to load after launch
 * Includes OAuth redirect handling for Model-Driven apps
 */

import { Page } from '@playwright/test';
import { AppType } from '../../types';
import { TimeOut } from '../../utils';

/**
 * Waits for Power Platform apps to fully load in runtime mode
 * Handles OAuth redirects and domain transitions for Model-Driven apps
 *
 * @example
 * ```typescript
 * const waiter = new AppRuntimeWaiter(page, AppType.ModelDriven);
 * await waiter.waitForAppLoad();
 * // App is now ready for interactions
 * ```
 */
export class AppRuntimeWaiter {
  /**
   * Creates a new AppRuntimeWaiter instance
   * @param page - Playwright page object
   * @param appType - Type of app (Canvas or ModelDriven)
   */
  constructor(
    private page: Page,
    private appType: AppType
  ) {}

  /**
   * Wait for app to fully load in runtime mode
   * Handles OAuth redirects for Model-Driven apps
   * Waits for app initialization and ready indicators
   *
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @throws {Error} If app fails to load within timeout
   *
   * @example
   * ```typescript
   * // For Model-Driven app
   * const waiter = new AppRuntimeWaiter(page, AppType.ModelDriven);
   * await waiter.waitForAppLoad();
   *
   * // For Canvas app
   * const waiter = new AppRuntimeWaiter(page, AppType.Canvas);
   * await waiter.waitForAppLoad(30000);
   * ```
   */
  async waitForAppLoad(timeout: number = 60000): Promise<void> {
    console.log(`[AppRuntimeWaiter] Waiting for ${this.appType} app to load...`);

    // Wait for initial page load
    await this.page.waitForLoadState('domcontentloaded');

    if (this.appType === AppType.ModelDriven) {
      await this.waitForModelDrivenApp(timeout);
    } else if (this.appType === AppType.PowerApps) {
      await this.waitForPowerAppsPortal();
    } else {
      await this.waitForCanvasApp();
    }

    console.log(`[AppRuntimeWaiter] App loaded at: ${this.page.url()}`);
  }

  /**
   * Wait for Model-Driven app to load
   * Handles OAuth redirect and domain transition (login.microsoftonline.com -> dynamics.com)
   */
  private async waitForModelDrivenApp(timeout: number): Promise<void> {
    console.log('[AppRuntimeWaiter] Waiting for Model-Driven app...');

    // Wait for OAuth redirect to complete
    // App will transition from login domain to dynamics.com or powerapps.com
    await this.page
      .waitForFunction(
        () => {
          return (
            window.location.hostname.includes('dynamics.com') ||
            window.location.hostname.includes('powerapps.com')
          );
        },
        { timeout }
      )
      .catch(() => {
        console.log('[AppRuntimeWaiter] OAuth redirect timeout, continuing...');
        console.log(`[AppRuntimeWaiter] Current URL: ${this.page.url()}`);
      });

    console.log('[AppRuntimeWaiter] OAuth redirect completed');

    // Additional wait for app initialization
    // Model-Driven apps need time to load metadata, controls, and data
    await this.page.waitForTimeout(TimeOut.DefaultWaitTime);

    // Try to wait for specific elements indicating app is ready
    const readySelectors = [
      '[role="menuitem"]', // Command bar
      '[role="grid"]', // Data grid
      'button', // Any button
    ];

    for (const selector of readySelectors) {
      const found = await this.page
        .locator(selector)
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (found) {
        console.log(`[AppRuntimeWaiter] App ready - found element: ${selector}`);
        break;
      }
    }

    console.log('[AppRuntimeWaiter] Model-Driven app fully loaded');
  }

  /**
   * Wait for the Power Apps Maker Portal (make.powerapps.com) to load.
   * Confirms the browser is on the make.powerapps.com domain and the
   * root shell element is present.
   */
  private async waitForPowerAppsPortal(): Promise<void> {
    console.log('[AppRuntimeWaiter] Waiting for Power Apps Maker Portal...');

    await this.page
      .waitForFunction(
        () =>
          window.location.hostname.includes('make') &&
          window.location.hostname.includes('powerapps.com'),
        { timeout: 60000 }
      )
      .catch(() => {
        console.log('[AppRuntimeWaiter] Portal domain check timed out, continuing...');
      });

    // Wait for the portal root shell to be present
    await this.page
      .locator('[id="root"]')
      .waitFor({ state: 'attached', timeout: 30000 })
      .catch(() => {
        console.log('[AppRuntimeWaiter] Portal root element not found, continuing...');
      });

    console.log('[AppRuntimeWaiter] Power Apps Maker Portal loaded');
  }

  /**
   * Wait for Canvas app to load
   * Canvas apps have simpler load pattern than Model-Driven apps
   */
  private async waitForCanvasApp(): Promise<void> {
    console.log('[AppRuntimeWaiter] Waiting for Canvas app...');

    // Canvas apps need time to load but don't have OAuth redirects
    await this.page.waitForTimeout(10000);

    console.log('[AppRuntimeWaiter] Canvas app fully loaded');
  }

  /**
   * Check if app is currently loaded and ready
   * @returns true if app appears to be loaded, false otherwise
   */
  async isAppLoaded(): Promise<boolean> {
    const url = this.page.url();

    if (this.appType === AppType.ModelDriven) {
      // Model-Driven app should be on dynamics.com or powerapps.com domain
      return url.includes('dynamics.com') || url.includes('powerapps.com');
    } else {
      // Canvas app should be on apps.powerapps.com or preview domain
      return url.includes('apps.powerapps') || url.includes('apps.preview.powerapps');
    }
  }
}
