/**
 * Power Apps Page Object Model
 * Main entry point for interacting with Power Apps Maker Portal
 * Handles navigation between home, apps, and solutions pages
 * Extracted and enhanced from lib/old/pages/PowerAppsPage.ts
 */

import { Page, Locator, expect } from '@playwright/test';
import { PowerAppsPageLocators } from '../locators/power-apps.locators';
import { CanvasAppPage } from './canvas-app.page';
import { ModelDrivenAppPage } from './model-driven-app.page';
import { AppType, NavigationOptions, SearchOptions } from '../types';
import { waitForSpinnerToDisappear } from '../utils/app-helpers';
import { findWithFallbackRole } from '../utils/locator-helpers';
import { PowerPlatformNavigator } from '../core/power-platform-navigator';
import { AppsPageWaiter, SolutionsPageWaiter, HomePageWaiter } from '../core/page-waiters';

export class PowerAppsPage {
  readonly page: Page;
  readonly locators: PowerAppsPageLocators;
  readonly canvas: CanvasAppPage;
  readonly modelDriven: ModelDrivenAppPage;
  private navigator: PowerPlatformNavigator;

  constructor(page: Page) {
    this.page = page;
    this.locators = new PowerAppsPageLocators(page);
    this.canvas = new CanvasAppPage(page);
    this.modelDriven = new ModelDrivenAppPage(page);

    // Initialize navigator for modular navigation
    this.navigator = new PowerPlatformNavigator(page, this.locators);
  }

  // ========================================
  // Navigation Methods
  // ========================================

  /**
   * Navigate to Power Apps home page
   * Delegates to PowerPlatformNavigator for modular navigation
   * @param options - Navigation options
   */
  async navigateToHome(options: NavigationOptions = {}): Promise<void> {
    const { waitForLoad = true, timeout = 60000 } = options;
    await this.navigator.navigateToHome({ waitForLoad, timeout });
  }

  /**
   * Navigate to Apps page
   * Delegates to PowerPlatformNavigator for modular navigation
   * @param options - Navigation options
   */
  async navigateToApps(options: NavigationOptions = {}): Promise<void> {
    const { waitForLoad = true, timeout = 60000 } = options;
    await this.navigator.navigateToApps({ waitForLoad, timeout });
  }

  /**
   * Navigate to Solutions page
   * Delegates to PowerPlatformNavigator for modular navigation
   * @param options - Navigation options
   */
  async navigateToSolutions(options: NavigationOptions = {}): Promise<void> {
    const { waitForLoad = true, timeout = 60000 } = options;
    await this.navigator.navigateToSolutions({ waitForLoad, timeout });
  }

  /**
   * Navigate to Apps page via menu
   * First navigates to home page, then clicks the Apps menu item
   * Use this when you want to simulate user navigation through the UI
   * @param options - Navigation options
   */
  async navigateToAppsViaMenu(options: NavigationOptions = {}): Promise<void> {
    const { url = '', waitForLoad = true, timeout = 60000 } = options;

    // First navigate to home to ensure menu is available
    await this.navigateToHome({ url, waitForLoad: true, timeout });

    // Check if sidebar is collapsed and expand it if needed
    const navToggle = this.page
      .locator(
        '[title="Left navigation panel"], button[aria-label*="navigation"]:has([role="presentation"])'
      )
      .first();
    const isCollapsed = await navToggle.getAttribute('aria-expanded').catch(() => null);

    if (isCollapsed === 'false') {
      console.log('[PowerAppsPage] Navigation sidebar is collapsed, expanding...');
      await navToggle.click();
      await this.page.waitForTimeout(500); // Wait for sidebar animation
    }

    // Click the Apps menu item - try multiple selectors for different UI versions
    let appsLink;
    try {
      appsLink = await findWithFallbackRole(
        this.page,
        [
          { role: 'menuitem', name: 'Apps' },
          { role: 'link', name: 'Apps' },
        ],
        { timeout: 3000 }
      );
    } catch {
      // Try data-test-id selector as fallback
      console.log('[PowerAppsPage] Trying data-test-id selector for Apps menu');
      appsLink = this.page.locator('[data-test-id="freTour-appsNavItem"]');
      await appsLink.waitFor({ state: 'visible', timeout: 5000 });
    }
    await appsLink.click();

    if (waitForLoad) {
      await this.waitForAppsPageLoad(timeout);
    }
  }

  /**
   * Navigate to Solutions page via menu
   * First navigates to home page, then clicks the Solutions menu item
   * Use this when you want to simulate user navigation through the UI
   * @param options - Navigation options
   */
  async navigateToSolutionsViaMenu(options: NavigationOptions = {}): Promise<void> {
    const { url = '', waitForLoad = true, timeout = 60000 } = options;

    // First navigate to home to ensure menu is available
    await this.navigateToHome({ url, waitForLoad: true, timeout });

    // Click the Solutions menu item
    const solutionsLink = this.page.getByRole('link', { name: 'Solutions', exact: true });
    await solutionsLink.click();

    if (waitForLoad) {
      await this.waitForSolutionsPageLoad(timeout);
    }
  }

  // ========================================
  // Legacy/Backward-Compatible Methods
  // These methods provide simpler APIs for common workflows
  // ========================================

  /**
   * Navigate to Power Apps home page (legacy method)
   * Simpler version without options for backward compatibility
   * @param url - Base URL to navigate to
   */
  public async navigateToPowerAppsHomePage(url?: string): Promise<void> {
    const currentUrl = this.page.url();
    const targetUrl =
      url ||
      (currentUrl !== 'about:blank' ? currentUrl.replace(/\/(apps|solutions).*$/gi, '/home') : '');

    console.log(
      `[PowerAppsPage] navigateToPowerAppsHomePage - currentUrl: ${currentUrl}, targetUrl: ${targetUrl}`
    );

    if (!targetUrl) {
      throw new Error(
        'Cannot navigate to home page: no URL provided and current page is blank. Please provide baseUrl in launch config.'
      );
    }

    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[PowerAppsPage] Navigated to home page: ${this.page.url()}`);
  }

  /**
   * Navigate to Apps page (legacy method)
   * Simpler version without options for backward compatibility
   * @param url - Base URL to navigate to
   */
  public async navigateToAppsPage(url?: string): Promise<void> {
    const currentUrl = this.page.url();
    const targetUrl =
      url ||
      (currentUrl !== 'about:blank' ? currentUrl.replace(/(home|solutions).*$/gi, 'apps') : '');

    console.log(
      `[PowerAppsPage] navigateToAppsPage - currentUrl: ${currentUrl}, targetUrl: ${targetUrl}`
    );

    if (!targetUrl) {
      throw new Error(
        'Cannot navigate to apps page: no URL provided and current page is blank. Please provide baseUrl in launch config.'
      );
    }

    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[PowerAppsPage] Navigated to apps page: ${this.page.url()}`);
  }

  /**
   * Open/Launch an app by clicking it in the apps list (legacy method)
   * @param appName - Name of the app to launch
   * @throws Error if app is not found
   */
  public async launchApplication(appName: string): Promise<void> {
    // Search for the app
    const searchBox = this.page.locator('input[role="searchbox"]');
    await searchBox.click();
    await searchBox.fill(appName);

    // Wait for spinner to disappear
    await waitForSpinnerToDisappear(this.page);
    await this.page.waitForTimeout(5000);

    // Check if app exists in the results
    const appRow = this.page.locator(`//*[text()='${appName}']//ancestor::div[@role='row']`);
    const appExists = await appRow.count();

    if (appExists === 0) {
      throw new Error(`App not found: "${appName}". Please check the app name and try again.`);
    }

    // Click context menu (three dots)
    const contextMenuButton = appRow.locator('[data-automation-key="contextualMenu"]');
    await contextMenuButton.click();

    // Click Edit button
    await this.page.locator(`//*[text()="Edit"]//ancestor::button`).first().click();
  }

  /**
   * Wait for Canvas app to launch in studio (legacy method)
   * Waits for PowerApps logo to disappear and clicks skip button
   */
  public async waitForCanvasAppLaunch(): Promise<void> {
    // Wait for app spinner to hide
    await waitForSpinnerToDisappear(this.page);

    // Wait for PowerApps logo to disappear in the studio iframe
    const studioFrame = this.page.frameLocator('iframe[data-test-id="iframe-powerapps-studio"]');
    await studioFrame
      .locator('[id="spl-powerapps"] [class="spl-powerapps-logo"]')
      .first()
      .waitFor({ state: 'hidden', timeout: 180000 });

    // Click skip button
    await studioFrame.locator('[data-test-id="dialog-skip-button-id"]').click();
  }

  // ========================================
  // Wait Methods
  // ========================================

  /**
   * Wait for home page to fully load
   * Delegates to HomePageWaiter for modular wait strategy
   * @param timeout - Timeout in milliseconds
   */
  async waitForHomePageLoad(timeout: number = 60000): Promise<void> {
    const waiter = new HomePageWaiter(this.page, this.locators);
    await waiter.waitForPageLoad(timeout);
  }

  /**
   * Wait for Apps page to fully load
   * Delegates to AppsPageWaiter for modular wait strategy
   * @param timeout - Timeout in milliseconds
   */
  async waitForAppsPageLoad(timeout: number = 60000): Promise<void> {
    const waiter = new AppsPageWaiter(this.page, this.locators);
    await waiter.waitForPageLoad(timeout);
  }

  /**
   * Wait for Solutions page to fully load
   * Delegates to SolutionsPageWaiter for modular wait strategy
   * @param timeout - Timeout in milliseconds
   */
  async waitForSolutionsPageLoad(timeout: number = 60000): Promise<void> {
    const waiter = new SolutionsPageWaiter(this.page, this.locators);
    await waiter.waitForPageLoad(timeout);
  }

  // ========================================
  // App Finding Methods
  // ========================================

  /**
   * Find an app by name in the apps list
   * Includes search and wait logic
   * @param appName - Name of the app
   * @param options - Search options
   * @returns Locator for the app
   */
  async findApp(appName: string, options: SearchOptions = {}): Promise<Locator> {
    const { timeout = 30000 } = options;

    // Ensure we're on apps page
    if (!(await this.isAppsPage())) {
      await this.navigateToApps();
    }

    // Search for the app if search box is available
    const searchBox = this.locators.solutionsSearchBox;
    if ((await searchBox.count()) > 0) {
      await searchBox.fill(appName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(1000);
    }

    // Get the app locator
    const appLocator = this.locators.getAppByName(appName);

    // Wait for app to be visible
    await appLocator.waitFor({ state: 'visible', timeout });

    return appLocator;
  }

  /**
   * Find a solution by name
   * @param solutionName - Name of the solution
   * @param options - Search options
   * @returns Locator for the solution
   */
  async findSolution(solutionName: string, options: SearchOptions = {}): Promise<Locator> {
    const { timeout = 30000 } = options;

    // Ensure we're on solutions page
    if (!(await this.isSolutionsPage())) {
      await this.navigateToSolutions();
    }

    // Search for the solution
    const searchBox = this.locators.solutionsSearchBox;
    if ((await searchBox.count()) > 0) {
      await searchBox.fill(solutionName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(1000);
    }

    // Get the solution locator
    const solutionLocator = this.locators.getSolutionByName(solutionName);

    // Wait for solution to be visible
    await solutionLocator.waitFor({ state: 'visible', timeout });

    return solutionLocator;
  }

  /**
   * Open the default solution
   */
  async openDefaultSolution(): Promise<void> {
    await this.navigateToSolutions();
    const defaultSolution = await this.findSolution('Common Data Services Default Solution');
    await defaultSolution.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ========================================
  // App Creation Methods
  // ========================================

  /**
   * Create a new app of specified type
   * @param appType - Type of app (Canvas or ModelDriven)
   * @param appName - Name for the new app
   */
  async createApp(appType: AppType, appName: string): Promise<void> {
    // Ensure we're on apps page
    if (!(await this.isAppsPage())) {
      await this.navigateToApps();
    }

    // Click New App button
    await this.locators.newAppButton.click();

    // Select app type
    if (appType === AppType.Canvas) {
      await this.locators.canvasAppButton.click();
      await this.canvas.waitForStudioLoad();
      await this.canvas.setAppName(appName);
    } else if (appType === AppType.ModelDriven) {
      await this.locators.modelAppButton.click();
      await this.modelDriven.waitForDesignerLoad();
      await this.modelDriven.setAppName(appName);
    }
  }

  /**
   * Delete an app by name
   * @param appType - Type of app
   * @param appName - Name of the app to delete
   */
  async deleteApp(appType: AppType, appName: string): Promise<void> {
    // Find the app
    const appLocator = await this.findApp(appName);

    // Hover to show context menu
    await appLocator.hover();

    // Click more options
    await appLocator.locator('[data-icon-name="More"]').click();

    // Click delete
    await this.locators.deleteAppButton.click();

    // Confirm deletion
    await this.locators.dialogAcceptButton.click();

    // Wait for deletion to complete
    await waitForSpinnerToDisappear(this.page);
  }

  /**
   * Open an app for editing or playing
   * @param appName - Name of the app
   * @param appType - Type of app
   * @param mode - 'edit' or 'play'
   */
  async openApp(appName: string, appType: AppType, mode: 'edit' | 'play' = 'edit'): Promise<void> {
    // First, ensure the app is found and visible
    await this.findApp(appName);

    if (mode === 'edit') {
      // For Edit mode:
      // 1. Click row to select the app
      const appRow = this.locators.getAppRowByName(appName);
      await appRow.click();
      await this.page.waitForTimeout(1000);

      // 2. Click Edit button in menubar
      const editButton = this.page
        .locator('[role="menubar"] [role="menuitem"]:has-text("Edit")')
        .first();
      await editButton.click();

      // Wait for app to load
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(5000);

      // Optionally wait for designer-specific elements (for true designer tests)
      // For CRUD operations, the app iframe will be available without these checks
      if (appType === AppType.Canvas) {
        await this.canvas.waitForStudioLoad();
      }
    } else {
      // For Play mode:
      // 1. Click row to select the app
      const appRow = this.locators.getAppRowByName(appName);
      await appRow.click();
      await this.page.waitForTimeout(1000);

      // 2. Click Play button in menubar
      const playButton = this.page.locator('[role="menubar"] [role="menuitem"]:has-text("Play")');

      if (appType === AppType.ModelDriven) {
        // Model driven apps open in new window/tab
        const [newPage] = await Promise.all([
          this.page.context().waitForEvent('page'),
          playButton.click(),
        ]);
        await newPage.waitForLoadState();
      } else {
        // Canvas apps also open in new tab when clicking Play button
        const [newPage] = await Promise.all([
          this.page.context().waitForEvent('page'),
          playButton.click(),
        ]);
        await newPage.waitForLoadState();
      }
    }
  }

  /**
   * Open Model Driven app in new window
   * @param appName - Name of the app
   * @returns New page object
   */
  async openModelDrivenAppInNewWindow(appName: string): Promise<Page> {
    const appLocator = await this.findApp(appName);

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      appLocator.click(),
    ]);

    await newPage.waitForLoadState();
    return newPage;
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Dismiss teaching bubble if present
   */
  async dismissTeachingBubble(): Promise<void> {
    const teachingBubble = this.locators.teachingBubble;

    if ((await teachingBubble.count()) > 0) {
      const closeButton = this.locators.teachingBubbleCloseButton;
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
      } else {
        // Try primary button
        const primaryButton = this.locators.teachingBubblePrimaryButton;
        if ((await primaryButton.count()) > 0) {
          await primaryButton.click();
        }
      }
    }
  }

  /**
   * Check if current page is an environment error page
   * @returns True if error page is detected
   */
  async isEnvironmentErrorPage(): Promise<boolean> {
    const errorContainer = this.locators.errorPageContainer;
    return (await errorContainer.count()) > 0;
  }

  /**
   * Check if currently on home page
   */
  async isHomePage(): Promise<boolean> {
    return this.page.url().includes('/home') || this.page.url().endsWith('/');
  }

  /**
   * Check if currently on apps page
   */
  async isAppsPage(): Promise<boolean> {
    return this.page.url().includes('/apps');
  }

  /**
   * Check if currently on solutions page
   */
  async isSolutionsPage(): Promise<boolean> {
    return this.page.url().includes('/solutions');
  }

  /**
   * Take screenshot
   * @param fileName - Name for the screenshot file
   */
  async takeScreenshot(fileName: string): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${fileName}.png`,
      fullPage: true,
    });
  }

  /**
   * Sign out from Power Apps
   */
  async signOut(): Promise<void> {
    // Click user menu
    await this.locators.meInitialsButton.click();

    // Click sign out
    const signOutButton = this.locators.signOutButton;
    if ((await signOutButton.count()) > 0) {
      await signOutButton.click();
    } else {
      await this.locators.signOutLink.click();
    }

    // Wait for sign out to complete
    await this.page.waitForURL(/.*login.*/);
  }

  // ========================================
  // Search Methods
  // ========================================

  /**
   * Search for apps in the apps list
   * @param query - Search query
   */
  async searchApps(query: string): Promise<void> {
    await this.navigateToApps();

    const searchBox = this.locators.solutionsSearchBox;
    await searchBox.fill(query);
    await this.page.keyboard.press('Enter');

    await waitForSpinnerToDisappear(this.page);
  }

  /**
   * Search for solutions
   * @param query - Search query
   */
  async searchSolutions(query: string): Promise<void> {
    await this.navigateToSolutions();

    const searchBox = this.locators.solutionsSearchBox;
    await searchBox.fill(query);
    await this.page.keyboard.press('Enter');

    await waitForSpinnerToDisappear(this.page);
  }

  // ========================================
  // Verification Methods
  // ========================================

  /**
   * Verify home page loaded successfully
   */
  async verifyHomePageLoaded(): Promise<void> {
    await expect(this.locators.root).toBeVisible();
    await expect(this.locators.pageHeader).toBeVisible();
    await expect(this.locators.mainNavigation).toBeVisible();
  }

  /**
   * Verify apps page loaded successfully
   */
  async verifyAppsPageLoaded(): Promise<void> {
    await expect(this.locators.appsPageMainContainer).toBeVisible();
    await expect(this.locators.sidebar).toBeVisible();
    await expect(this.locators.commandBar).toBeVisible();
  }

  /**
   * Verify solutions page loaded successfully
   */
  async verifySolutionsPageLoaded(): Promise<void> {
    await expect(this.locators.solutionsSidebar).toBeVisible();
    await expect(this.locators.solutionsCommandBar).toBeVisible();
    await expect(this.locators.solutionsListContainer).toBeVisible();
  }

  /**
   * Verify app exists in the list
   * @param appName - Name of the app
   */
  async verifyAppExists(appName: string): Promise<void> {
    const appLocator = await this.findApp(appName);
    await expect(appLocator).toBeVisible();
  }

  /**
   * Verify solution exists in the list
   * @param solutionName - Name of the solution
   */
  async verifySolutionExists(solutionName: string): Promise<void> {
    const solutionLocator = await this.findSolution(solutionName);
    await expect(solutionLocator).toBeVisible();
  }
}
