/**
 * PowerApps Launcher
 * IAppLauncher adapter for the Power Apps Maker Portal (make.powerapps.com).
 *
 * This launcher does not support control-level interactions (getControl, click, fill).
 * Use `appProvider.getPowerAppsPage()` for maker portal navigation, or
 * `appProvider.getGenUxPage()` for the GenUX AI designer workflow.
 */

import { Locator, Page } from '@playwright/test';
import { IAppLauncher } from './app-launcher.interface';
import { AppLaunchMode, AppPlayerOptions, AppType, AssertionOptions, ControlOptions } from '../types';
import { PowerAppsPage } from '../pages/power-apps.page';

const NOT_SUPPORTED =
  'PowerApps maker portal does not support control-level interactions. ' +
  'Use appProvider.getPowerAppsPage() or appProvider.getGenUxPage() instead.';

/**
 * Minimal IAppLauncher implementation for the Power Apps Maker Portal.
 *
 * Handles load-state waiting via `PowerAppsPage.waitForHomePageLoad()`.
 * All control-level methods throw a descriptive error directing callers to
 * `getPowerAppsPage()` or `getGenUxPage()`.
 */
export class PowerAppsLauncher implements IAppLauncher {
  readonly appType = AppType.PowerApps;

  private readonly powerAppsPage: PowerAppsPage;
  private _isReady = false;

  constructor(private readonly page: Page) {
    this.powerAppsPage = new PowerAppsPage(page);
  }

  async launchByName(
    _appName: string,
    _findAppCallback: (appName: string) => Promise<Locator>,
    _mode: AppLaunchMode,
    _options?: AppPlayerOptions
  ): Promise<void> {
    throw new Error(
      'launchByName is not supported for PowerApps maker portal. ' +
      'Use AppProvider.launch({ type: AppType.PowerApps, skipMakerPortal: true, directUrl: MAKER_PORTAL_URL })'
    );
  }

  async launchById(
    _appId: string,
    _baseUrl: string,
    _mode: AppLaunchMode,
    _options?: AppPlayerOptions
  ): Promise<void> {
    throw new Error(
      'launchById is not supported for PowerApps maker portal. ' +
      'Use AppProvider.launch({ type: AppType.PowerApps, skipMakerPortal: true, directUrl: MAKER_PORTAL_URL })'
    );
  }

  /** Waits for the Maker Portal home/apps page to be ready */
  async waitForAppLoad(_options?: AppPlayerOptions): Promise<void> {
    await this.powerAppsPage.waitForHomePageLoad();
    this._isReady = true;
  }

  isAppReady(): boolean {
    return this._isReady;
  }

  getAppId(): string | null {
    return null;
  }

  getAppUrl(): string | null {
    return this.page.url();
  }

  getControl(_options: ControlOptions): Locator {
    throw new Error(NOT_SUPPORTED);
  }

  async clickControl(_options: ControlOptions): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }

  async fillControl(_options: ControlOptions, _value: string): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }

  async fillForm(_formData: Record<string, string>): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }

  async assertControlVisible(
    _options: ControlOptions,
    _assertOptions?: AssertionOptions
  ): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }

  async assertControlText(
    _options: ControlOptions,
    _expectedText: string,
    _assertOptions?: AssertionOptions
  ): Promise<void> {
    throw new Error(NOT_SUPPORTED);
  }

  async closeApp(): Promise<void> {
    // No-op — the maker portal page is managed by the test context
  }

  reset(): void {
    this._isReady = false;
  }
}
