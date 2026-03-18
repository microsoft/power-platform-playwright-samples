/**
 * App Provider
 * High-level provider for launching and managing Power Platform apps
 * Implements Provider Pattern for simplified app testing
 *
 * Production-grade implementation with proper page tracking and context management
 */

import { Page, Locator, BrowserContext } from '@playwright/test';
import { AppLauncherFactory } from './app-launcher.factory';
import { IAppLauncher, AppMetadata } from './app-launcher.interface';
import { AppType, AppLaunchMode, AppPlayerOptions, ControlOptions } from '../types';
import { PowerAppsPage } from '../pages/power-apps.page';
import { ModelDrivenAppPage } from '../pages/model-driven-app.page';
import { CanvasAppPage } from '../pages/canvas-app.page';
import { GenUxPage } from '../components/gen-ux';
import { PowerPlatformNavigator } from './power-platform-navigator';
import { PowerAppsPageLocators } from '../locators/power-apps.locators';
import { AppRuntimeWaiter } from './page-waiters/app-runtime-waiter';

/**
 * Configuration for launching an app
 */
export interface LaunchAppConfig {
  /** App identifier - either name or ID */
  app: string | { id: string } | { name: string };
  /** Type of app to launch */
  type: AppType;
  /** Launch mode (play, edit, preview) */
  mode?: AppLaunchMode;
  /** Base URL for maker portal navigation */
  baseUrl?: string;
  /** Additional launch options */
  options?: AppPlayerOptions;
  /** Skip maker portal navigation and open app directly */
  skipMakerPortal?: boolean;
  /** Direct URL to the app (requires skipMakerPortal: true) */
  directUrl?: string;
  /** Browser context for handling new tabs (required for Play mode) */
  context?: BrowserContext;
}

/**
 * App Provider - High-level API for app testing
 * Provides simplified interface for customers to launch and test their apps
 *
 * Handles complex scenarios:
 * - Apps opening in new tabs (Play mode)
 * - Direct URL navigation with OAuth redirects
 * - Proper page tracking and context management
 * - Cleanup of resources
 *
 * @example
 * ```typescript
 * const provider = new AppProvider(page, context);
 *
 * // Launch by name (handles new tab automatically)
 * await provider.launch({
 *   app: 'My Sales App',
 *   type: AppType.Canvas,
 *   mode: AppLaunchMode.Play,
 *   baseUrl: 'https://make.powerapps.com',
 *   context: context  // Required for Play mode
 * });
 *
 * // Launch by direct URL (fastest, no maker portal)
 * await provider.launch({
 *   app: 'My Sales App',
 *   type: AppType.ModelDriven,
 *   mode: AppLaunchMode.Play,
 *   skipMakerPortal: true,
 *   directUrl: 'https://org.crm.dynamics.com/main.aspx?appid=abc-123'
 * });
 *
 * // Get the actual app page (might be different from original page)
 * const appPage = provider.getAppPage();
 *
 * // Interact with app
 * await provider.click({ name: 'Submit' });
 *
 * // Cleanup
 * await provider.close();
 * ```
 */
export class AppProvider {
  private makerPortalPage: Page;
  private appPage: Page | null = null;
  private browserContext: BrowserContext | null = null;
  private currentLauncher: IAppLauncher | null = null;
  private currentAppType: AppType | null = null;
  private launchedApps: Map<string, AppMetadata> = new Map();
  private launchMode: 'same-page' | 'new-tab' | 'direct-url' = 'same-page';
  private navigator: PowerPlatformNavigator;

  // Page object instances
  private modelDrivenAppPage: ModelDrivenAppPage | null = null;
  private canvasAppPage: CanvasAppPage | null = null;
  private powerAppsPage: PowerAppsPage | null = null;
  private genUxPage: GenUxPage | null = null;

  constructor(page: Page, context?: BrowserContext) {
    this.makerPortalPage = page;
    this.appPage = null; // Will be set during launch
    this.browserContext = context || null;

    // Initialize navigator for modular navigation
    const locators = new PowerAppsPageLocators(page);
    this.navigator = new PowerPlatformNavigator(page, locators);
  }

  /**
   * Get the page where the app is actually running
   * @returns The app page (might be a new tab or the original page)
   */
  getAppPage(): Page {
    return this.appPage || this.makerPortalPage;
  }

  /**
   * Get ModelDrivenAppPage instance
   * This is the primary way to interact with Model-Driven Apps after launching
   *
   * @returns ModelDrivenAppPage instance for the launched app
   * @throws Error if no Model-Driven app has been launched
   *
   * @example
   * ```typescript
   * const appProvider = new AppProvider(page, context);
   *
   * await appProvider.launch({
   *   app: 'Northwind Orders',
   *   type: AppType.ModelDriven,
   *   mode: AppLaunchMode.Play,
   *   skipMakerPortal: true,
   *   directUrl: 'https://org.crm.dynamics.com/main.aspx?appid=abc-123'
   * });
   *
   * const modelDrivenApp = appProvider.getModelDrivenAppPage();
   * await modelDrivenApp.navigateToGridView('nwind_order');
   * ```
   */
  getModelDrivenAppPage(): ModelDrivenAppPage {
    if (this.currentAppType !== AppType.ModelDriven) {
      throw new Error(
        `Cannot get ModelDrivenAppPage: current app type is ${this.currentAppType}. ` +
          `Launch a Model-Driven app first using AppProvider.launch({ type: AppType.ModelDriven, ... })`
      );
    }

    if (!this.modelDrivenAppPage) {
      // Initialize ModelDrivenAppPage on first access
      const appPage = this.getAppPage();
      this.modelDrivenAppPage = new ModelDrivenAppPage(appPage);
    }

    return this.modelDrivenAppPage;
  }

  /**
   * Get CanvasAppPage instance
   * This is the primary way to interact with Canvas Apps after launching
   *
   * @returns CanvasAppPage instance for the launched app
   * @throws Error if no Canvas app has been launched
   *
   * @example
   * ```typescript
   * const appProvider = new AppProvider(page, context);
   *
   * await appProvider.launch({
   *   app: 'Sales Canvas App',
   *   type: AppType.Canvas,
   *   mode: AppLaunchMode.Play,
   *   skipMakerPortal: true,
   *   directUrl: 'https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id'
   * });
   *
   * const canvasApp = appProvider.getCanvasAppPage();
   * const gallery = await canvasApp.getControl({ name: 'Gallery1' });
   * ```
   */
  getCanvasAppPage(): CanvasAppPage {
    if (this.currentAppType !== AppType.Canvas) {
      throw new Error(
        `Cannot get CanvasAppPage: current app type is ${this.currentAppType}. ` +
          `Launch a Canvas app first using AppProvider.launch({ type: AppType.Canvas, ... })`
      );
    }

    if (!this.canvasAppPage) {
      // Initialize CanvasAppPage on first access
      const appPage = this.getAppPage();
      this.canvasAppPage = new CanvasAppPage(appPage);
    }

    return this.canvasAppPage;
  }

  /**
   * Get PowerAppsPage instance
   * This provides access to the Power Apps maker portal (for app management)
   *
   * @returns PowerAppsPage instance for maker portal operations
   *
   * @example
   * ```typescript
   * const appProvider = new AppProvider(page);
   * const powerAppsPage = appProvider.getPowerAppsPage();
   *
   * await powerAppsPage.navigateToApps();
   * await powerAppsPage.searchApps('My App');
   * ```
   */
  getPowerAppsPage(): PowerAppsPage {
    if (!this.powerAppsPage) {
      // Initialize PowerAppsPage on first access
      this.powerAppsPage = new PowerAppsPage(this.makerPortalPage);
    }

    return this.powerAppsPage;
  }

  /**
   * Get GenUxPage instance for Maker Portal GenUX designer interactions.
   * Use this to drive app generation (AI prompt workflow) and inspect
   * generated app DOM / Power Fx code for test generation.
   *
   * @returns GenUxPage instance scoped to the current Maker Portal page
   *
   * @example
   * ```typescript
   * const appProvider = new AppProvider(page, context);
   * await appProvider.launch({
   *   app: 'Power Apps Maker',
   *   type: AppType.ModelDriven,
   *   mode: AppLaunchMode.Edit,
   *   baseUrl: process.env.MAKER_PORTAL_URL,
   * });
   * const genUxPage = appProvider.getGenUxPage();
   * await performGenUxBasicSetup(genUxPage, appName, { aiPrompt: '...' });
   * ```
   */
  getGenUxPage(): GenUxPage {
    if (!this.genUxPage) {
      this.genUxPage = new GenUxPage(this.makerPortalPage);
    }
    return this.genUxPage;
  }

  /**
   * Launch an app
   * Supports launching by name, ID, or direct URL
   * Automatically handles new tabs for Play mode
   *
   * @param config - Launch configuration
   */
  async launch(config: LaunchAppConfig): Promise<void> {
    const {
      app,
      type,
      mode = AppLaunchMode.Play,
      baseUrl,
      options = {},
      skipMakerPortal,
      directUrl,
      context,
    } = config;

    // Store context if provided
    if (context) {
      this.browserContext = context;
    }

    console.log(`[AppProvider] Launching app - mode: ${mode}, skipMakerPortal: ${skipMakerPortal}`);

    this.currentAppType = type;

    // Route to appropriate launch method
    if (skipMakerPortal && directUrl) {
      await this.launchByDirectUrl(directUrl, type, mode, options);
    } else if (typeof app === 'string' || 'name' in app) {
      const appName = typeof app === 'string' ? app : app.name;
      if (!baseUrl) {
        throw new Error('baseUrl is required when launching by name');
      }
      await this.launchByName(appName, type, baseUrl, mode, options);
    } else if ('id' in app) {
      if (!baseUrl) {
        throw new Error('baseUrl is required when launching by ID');
      }
      await this.launchById(app.id, type, baseUrl, mode, options);
    } else {
      throw new Error('Invalid app identifier. Use string, { id: "..." }, or { name: "..." }');
    }

    // Create launcher for the actual app page
    const actualAppPage = this.getAppPage();
    this.currentLauncher = AppLauncherFactory.createLauncher(actualAppPage, type);

    // Store metadata
    this.storeAppMetadata(app, type);
    console.log(`[AppProvider] Launch completed - app page URL: ${actualAppPage.url()}`);
  }

  /**
   * Launch app by name through maker portal
   * Handles new tab for Play mode automatically
   */
  private async launchByName(
    appName: string,
    type: AppType,
    baseUrl: string,
    mode: AppLaunchMode,
    _options: AppPlayerOptions
  ): Promise<void> {
    console.log(`[AppProvider] launchByName - ${appName}, mode: ${mode}`);

    // Navigate to maker portal using navigator (modular approach)
    await this.navigator.navigateToApps();

    // Create PowerAppsPage for app search and interaction
    const powerAppsPage = new PowerAppsPage(this.makerPortalPage);

    // Search for app
    await powerAppsPage.searchApps(appName);
    await this.makerPortalPage.waitForTimeout(2000);

    // For Play mode, capture new tab
    if (mode === AppLaunchMode.Play) {
      await this.launchInPlayMode(appName, type, powerAppsPage);
    } else {
      // Edit mode - opens in same page
      await this.launchInEditMode(appName, type, powerAppsPage);
    }
  }

  /**
   * Launch app in Play mode (handles new tab)
   */
  private async launchInPlayMode(
    appName: string,
    type: AppType,
    powerAppsPage: PowerAppsPage
  ): Promise<void> {
    console.log(`[AppProvider] Launching in Play mode (will open new tab)`);

    if (!this.browserContext) {
      console.warn(
        '[AppProvider] WARNING: No BrowserContext provided. Play mode may not capture new tab correctly.'
      );
      console.warn(
        '[AppProvider] Pass context in launch config: launch({ ..., context: context })'
      );
    }

    // Select the app row
    const appRow = this.makerPortalPage.locator(`[role="row"]:has-text("${appName}")`).first();
    await appRow.waitFor({ state: 'visible', timeout: 30000 });
    await appRow.click();
    await this.makerPortalPage.waitForTimeout(2000);

    // Click Play button and capture new tab
    if (this.browserContext) {
      const playButton = this.makerPortalPage.locator(
        '[role="menubar"] [role="menuitem"]:has-text("Play")'
      );

      const [newPage] = await Promise.all([
        this.browserContext.waitForEvent('page'),
        playButton.click(),
      ]);

      console.log(`[AppProvider] New tab opened: ${newPage.url()}`);
      this.appPage = newPage;
      this.launchMode = 'new-tab';

      // Wait for app to load (with OAuth redirect handling)
      await this.waitForAppLoad(newPage, type);
    } else {
      // Fallback: try to use powerAppsPage.openApp
      await powerAppsPage.openApp(appName, type, 'play');
      this.appPage = this.makerPortalPage;
      this.launchMode = 'same-page';
    }
  }

  /**
   * Launch app in Edit mode (same page)
   */
  private async launchInEditMode(
    appName: string,
    type: AppType,
    powerAppsPage: PowerAppsPage
  ): Promise<void> {
    console.log(`[AppProvider] Launching in Edit mode (same page)`);

    await powerAppsPage.openApp(appName, type, 'edit');
    this.appPage = this.makerPortalPage;
    this.launchMode = 'same-page';

    // Wait for editor to load
    if (type === AppType.Canvas) {
      await powerAppsPage.waitForCanvasAppLaunch();
    } else {
      await this.makerPortalPage.waitForTimeout(5000);
    }
  }

  /**
   * Launch app by ID
   */
  private async launchById(
    appId: string,
    type: AppType,
    baseUrl: string,
    mode: AppLaunchMode,
    options: AppPlayerOptions
  ): Promise<void> {
    console.log(`[AppProvider] launchById - ${appId}`);

    // Create temporary launcher for ID-based launch
    const tempLauncher = AppLauncherFactory.createLauncher(this.makerPortalPage, type);
    await tempLauncher.launchById(appId, baseUrl, mode, options);

    this.appPage = this.makerPortalPage;
    this.launchMode = 'same-page';
  }

  /**
   * Launch app by direct URL (skip maker portal)
   * Handles OAuth redirects properly
   */
  private async launchByDirectUrl(
    directUrl: string,
    type: AppType,
    _mode: AppLaunchMode,
    _options: AppPlayerOptions
  ): Promise<void> {
    console.log(`[AppProvider] launchByDirectUrl - ${directUrl}`);

    // Navigate to direct URL
    await this.makerPortalPage.goto(directUrl, { waitUntil: 'domcontentloaded' });

    this.appPage = this.makerPortalPage;
    this.launchMode = 'direct-url';

    // Wait for OAuth redirects and app load
    await this.waitForAppLoad(this.makerPortalPage, type);

    console.log(
      `[AppProvider] Direct URL load complete - final URL: ${this.makerPortalPage.url()}`
    );
  }

  /**
   * Wait for app to fully load (handles OAuth redirects)
   * Uses AppRuntimeWaiter for modular wait strategy
   */
  private async waitForAppLoad(page: Page, type: AppType): Promise<void> {
    const waiter = new AppRuntimeWaiter(page, type);
    await waiter.waitForAppLoad();
  }

  /**
   * Get a control in the current app
   * @param options - Control options
   * @returns Locator for the control
   */
  getControl(options: ControlOptions): Locator {
    this.ensureLauncherExists();
    return this.currentLauncher!.getControl(options);
  }

  /**
   * Click a control in the current app
   * @param options - Control options
   */
  async click(options: ControlOptions): Promise<void> {
    this.ensureLauncherExists();
    await this.currentLauncher!.clickControl(options);
  }

  /**
   * Fill a text input control in the current app
   * @param options - Control options
   * @param value - Value to fill
   */
  async fill(options: ControlOptions, value: string): Promise<void> {
    this.ensureLauncherExists();
    await this.currentLauncher!.fillControl(options, value);
  }

  /**
   * Fill a form in the current app
   * @param formData - Key-value pairs of field names and values
   */
  async fillForm(formData: Record<string, string>): Promise<void> {
    this.ensureLauncherExists();
    await this.currentLauncher!.fillForm(formData);
  }

  /**
   * Assert control is visible
   * @param options - Control options
   */
  async assertVisible(options: ControlOptions): Promise<void> {
    this.ensureLauncherExists();
    await this.currentLauncher!.assertControlVisible(options);
  }

  /**
   * Assert control text matches
   * @param options - Control options
   * @param expectedText - Expected text
   */
  async assertText(options: ControlOptions, expectedText: string): Promise<void> {
    this.ensureLauncherExists();
    await this.currentLauncher!.assertControlText(options, expectedText);
  }

  /**
   * Close the current app
   * Handles cleanup based on launch mode
   */
  async close(): Promise<void> {
    console.log(`[AppProvider] Closing app - launch mode: ${this.launchMode}`);

    if (this.launchMode === 'new-tab' && this.appPage && this.appPage !== this.makerPortalPage) {
      // Close the new tab
      console.log('[AppProvider] Closing app tab');
      await this.appPage.close();
    } else if (this.currentLauncher) {
      // Use launcher's close method for same-page launches
      await this.currentLauncher.closeApp().catch((err) => {
        console.log(`[AppProvider] Launcher close failed: ${err.message}`);
      });
    }

    this.currentLauncher = null;
    this.currentAppType = null;
    this.appPage = null;
    this.launchMode = 'same-page';
  }

  /**
   * Check if an app is currently launched and ready
   * @returns true if app is ready
   */
  isReady(): boolean {
    return this.currentLauncher?.isAppReady() ?? false;
  }

  /**
   * Get the current app type
   * @returns Current app type or null
   */
  getCurrentAppType(): AppType | null {
    return this.currentAppType;
  }

  /**
   * Get the current app ID
   * @returns Current app ID or null
   */
  getCurrentAppId(): string | null {
    return this.currentLauncher?.getAppId() ?? null;
  }

  /**
   * Get the current app URL
   * @returns Current app URL or null
   */
  getCurrentAppUrl(): string | null {
    const appPage = this.getAppPage();
    return appPage.url();
  }

  /**
   * Get metadata for all launched apps
   * @returns Array of app metadata
   */
  getLaunchedApps(): AppMetadata[] {
    return Array.from(this.launchedApps.values());
  }

  /**
   * Reset the provider state
   * Clears current launcher and app metadata
   */
  reset(): void {
    if (this.currentLauncher) {
      this.currentLauncher.reset();
    }
    this.currentLauncher = null;
    this.currentAppType = null;
    this.appPage = null;
    this.launchMode = 'same-page';
    this.launchedApps.clear();
  }

  /**
   * Ensure launcher exists before operations
   * @throws Error if no launcher is available
   */
  private ensureLauncherExists(): void {
    if (!this.currentLauncher) {
      throw new Error('No app is currently launched. Call launch() first.');
    }
  }

  /**
   * Store metadata for a launched app
   * @param app - App identifier
   * @param type - App type
   */
  private storeAppMetadata(app: string | { id: string } | { name: string }, type: AppType): void {
    const appId = this.currentLauncher?.getAppId() || 'unknown';
    const appName = typeof app === 'string' ? app : 'name' in app ? app.name : `app-${appId}`;
    const appPage = this.getAppPage();

    const metadata: AppMetadata = {
      id: appId,
      name: appName,
      type: type,
      url: appPage.url(),
      isReady: true,
      launchedAt: new Date(),
    };

    this.launchedApps.set(appId, metadata);
  }
}
