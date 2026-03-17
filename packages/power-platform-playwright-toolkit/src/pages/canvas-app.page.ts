/**
 * Canvas App Page Object Model
 * Provides methods for creating, editing, and testing Canvas Apps
 */

import { Page, FrameLocator, expect } from '@playwright/test';
import { CanvasAppLocators } from '../locators/canvas-app.locators';

export class CanvasAppPage {
  readonly page: Page;
  private studioFrame: FrameLocator | null = null;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get the Canvas Studio iframe
   * Canvas Studio runs in an iframe, so we need to access it
   */
  private async getStudioFrame(): Promise<FrameLocator> {
    if (!this.studioFrame) {
      this.studioFrame = this.page.frameLocator(CanvasAppLocators.Studio.StudioFrame);
    }
    return this.studioFrame;
  }

  // ========================================
  // Navigation Methods
  // ========================================

  /**
   * Navigate to Power Apps home page
   */
  async navigateToHome(): Promise<void> {
    await this.page.goto('');
    await this.waitForHomePageLoad();
  }

  /**
   * Wait for home page to load
   */
  async waitForHomePageLoad(): Promise<void> {
    await this.page.locator(CanvasAppLocators.Home.AppsGrid).waitFor({
      state: 'visible',
      timeout: 60000,
    });
  }

  /**
   * Wait for Canvas Studio to load
   */
  async waitForStudioLoad(): Promise<void> {
    const frame = await this.getStudioFrame();

    // Check for and dismiss the "Welcome to Power Apps Studio" dialog if it appears
    try {
      const welcomeDialog = frame.locator('dialog:has-text("Welcome to Power Apps Studio")');
      const isWelcomeVisible = await welcomeDialog.isVisible({ timeout: 5000 }).catch(() => false);

      if (isWelcomeVisible) {
        console.log('[CanvasAppPage] Welcome dialog detected, dismissing...');
        // Try to find and click close button (X), Skip button, or click outside dialog
        const closeButton = frame
          .locator(
            '[aria-label="Close"], button:has-text("Skip"), button:has-text("Got it"), button:has-text("Close")'
          )
          .first();
        const hasCloseButton = await closeButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasCloseButton) {
          await closeButton.click();
          console.log('[CanvasAppPage] Welcome dialog dismissed');
        } else {
          // Click outside the dialog to dismiss it
          await frame.locator('application').click({ position: { x: 10, y: 10 } });
          console.log('[CanvasAppPage] Welcome dialog dismissed by clicking outside');
        }

        await welcomeDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      }
    } catch {
      // Welcome dialog not present or already dismissed, continue
      console.log('[CanvasAppPage] No welcome dialog detected or already dismissed');
    }

    await frame.locator(CanvasAppLocators.Studio.Canvas.CanvasArea).waitFor({
      state: 'visible',
      timeout: 90000,
    });
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    await this.page.locator(CanvasAppLocators.Common.LoadingSpinner).waitFor({
      state: 'hidden',
      timeout: 60000,
    });
  }

  // ========================================
  // App Creation Methods
  // ========================================

  /**
   * Create a blank Canvas app
   * @param appName - Optional name for the app
   */
  async createBlankCanvasApp(appName?: string): Promise<void> {
    await this.page.locator(CanvasAppLocators.Home.CreateButton).click();
    await this.page.locator(CanvasAppLocators.Home.BlankAppOption).click();
    await this.waitForStudioLoad();

    if (appName) {
      await this.setAppName(appName);
    }
  }

  /**
   * Create Canvas app from template
   * @param _templateName - Name of the template
   */
  async createFromTemplate(_templateName: string): Promise<void> {
    await this.page.locator(CanvasAppLocators.Home.CreateButton).click();
    await this.page.locator(CanvasAppLocators.Home.TemplateAppOption).click();
    // Template selection logic would go here
    await this.waitForStudioLoad();
  }

  /**
   * Create Canvas app from data
   * @param _dataSourceName - Name of the data source
   */
  async createFromData(_dataSourceName: string): Promise<void> {
    await this.page.locator(CanvasAppLocators.Home.CreateButton).click();
    await this.page.locator(CanvasAppLocators.Home.DataAppOption).click();
    // Data source selection logic would go here
    await this.waitForStudioLoad();
  }

  // ========================================
  // App Management Methods
  // ========================================

  /**
   * Set app name
   * @param appName - Name for the app
   */
  async setAppName(appName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    const nameInput = frame.locator(CanvasAppLocators.Studio.CommandBar.AppName);
    await nameInput.click();
    await nameInput.fill(appName);
    await nameInput.press('Enter');
  }

  /**
   * Save the Canvas app
   */
  async saveApp(): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.CommandBar.SaveButton).click();
    await this.page.locator(CanvasAppLocators.SaveDialog.Dialog).waitFor({ state: 'visible' });
    await this.page.locator(CanvasAppLocators.SaveDialog.SaveButton).click();
    await this.waitForSaveComplete();
  }

  /**
   * Save app with specific name
   * @param appName - Name to save the app as
   */
  async saveAppWithName(appName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.CommandBar.SaveButton).click();
    await this.page.locator(CanvasAppLocators.SaveDialog.Dialog).waitFor({ state: 'visible' });
    await this.page.locator(CanvasAppLocators.SaveDialog.AppNameInput).fill(appName);
    await this.page.locator(CanvasAppLocators.SaveDialog.SaveButton).click();
    await this.waitForSaveComplete();
  }

  /**
   * Wait for save operation to complete
   */
  async waitForSaveComplete(): Promise<void> {
    await this.page.locator(CanvasAppLocators.SaveDialog.SuccessMessage).waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  /**
   * Publish the Canvas app
   * @param comments - Optional version comments
   */
  async publishApp(comments?: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.CommandBar.PublishButton).click();
    await this.page.locator(CanvasAppLocators.PublishDialog.Dialog).waitFor({ state: 'visible' });

    if (comments) {
      await this.page.locator(CanvasAppLocators.PublishDialog.VersionComments).fill(comments);
    }

    await this.page.locator(CanvasAppLocators.PublishDialog.PublishButton).click();
    await this.waitForPublishComplete();
  }

  /**
   * Wait for publish operation to complete
   */
  async waitForPublishComplete(): Promise<void> {
    await this.page.locator(CanvasAppLocators.PublishDialog.SuccessMessage).waitFor({
      state: 'visible',
      timeout: 60000,
    });
  }

  /**
   * Play/Preview the app
   */
  async playApp(): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.CommandBar.PlayButton).click();
    await this.page.locator(CanvasAppLocators.PlayMode.PlayWindow).waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  /**
   * Stop playing the app
   */
  async stopPlayingApp(): Promise<void> {
    await this.page.locator(CanvasAppLocators.PlayMode.StopButton).click();
  }

  // ========================================
  // Control Management Methods
  // ========================================

  /**
   * Add a control to the canvas
   * @param controlType - Type of control (e.g., 'Button', 'Label', 'TextInput')
   */
  async addControl(controlType: keyof typeof CanvasAppLocators.Studio.Insert): Promise<void> {
    const frame = await this.getStudioFrame();

    // Open Insert panel
    await frame.locator(CanvasAppLocators.Studio.LeftNav.InsertTab).click();

    // Click the control
    const controlSelector = CanvasAppLocators.Studio.Insert[controlType];
    if (controlSelector) {
      await frame.locator(controlSelector).click();
    } else {
      throw new Error(`Unknown control type: ${controlType}`);
    }
  }

  /**
   * Add a button control
   */
  async addButton(): Promise<void> {
    await this.addControl('ButtonControl');
  }

  /**
   * Add a text label control
   */
  async addTextLabel(): Promise<void> {
    await this.addControl('TextLabelControl');
  }

  /**
   * Add a text input control
   */
  async addTextInput(): Promise<void> {
    await this.addControl('TextInputControl');
  }

  /**
   * Add a gallery control
   */
  async addGallery(): Promise<void> {
    await this.addControl('GalleryControl');
  }

  /**
   * Select a control by name
   * @param controlName - Name of the control
   */
  async selectControl(controlName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.Canvas.Control(controlName)).click();
  }

  /**
   * Delete selected control
   */
  async deleteSelectedControl(): Promise<void> {
    await this.page.keyboard.press('Delete');
  }

  // ========================================
  // Property Management Methods
  // ========================================

  /**
   * Set control property
   * @param propertyName - Name of the property
   * @param value - Value to set
   */
  async setControlProperty(propertyName: string, value: string): Promise<void> {
    const frame = await this.getStudioFrame();
    const propertyInput = frame.locator(
      CanvasAppLocators.Studio.Properties.PropertyItem(propertyName)
    );
    await propertyInput.fill(value);
    await propertyInput.press('Enter');
  }

  /**
   * Set control text property
   * @param text - Text value
   */
  async setControlText(text: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.Properties.Text).fill(text);
    await frame.locator(CanvasAppLocators.Studio.Properties.Text).press('Enter');
  }

  /**
   * Set formula for a property
   * @param propertyName - Name of the property
   * @param formula - Formula to set
   */
  async setFormula(propertyName: string, formula: string): Promise<void> {
    const frame = await this.getStudioFrame();

    // Select property from dropdown
    await frame.locator(CanvasAppLocators.Studio.FormulaBar.PropertyDropdown).click();
    await frame.locator(`option:has-text("${propertyName}")`).click();

    // Enter formula
    await frame.locator(CanvasAppLocators.Studio.FormulaBar.FormulaInput).fill(formula);
    await frame.locator(CanvasAppLocators.Studio.FormulaBar.FormulaInput).press('Enter');
  }

  // ========================================
  // Data Source Methods
  // ========================================

  /**
   * Add data source to the app
   * @param dataSourceName - Name of the data source
   */
  async addDataSource(dataSourceName: string): Promise<void> {
    const frame = await this.getStudioFrame();

    // Open Data panel
    await frame.locator(CanvasAppLocators.Studio.LeftNav.DataTab).click();

    // Click Add data
    await frame.locator(CanvasAppLocators.Studio.Data.AddDataButton).click();

    // Search for data source
    await frame.locator(CanvasAppLocators.Studio.Data.SearchDataSource).fill(dataSourceName);

    // Select data source
    await frame.locator(CanvasAppLocators.Studio.Data.DataSourceItem(dataSourceName)).click();

    // Connect
    await frame.locator(CanvasAppLocators.Studio.Data.ConnectButton).click();
  }

  // ========================================
  // Screen Management Methods
  // ========================================

  /**
   * Add a new screen
   */
  async addScreen(): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.Screens.AddScreenButton).click();
  }

  /**
   * Select a screen by name
   * @param screenName - Name of the screen
   */
  async selectScreen(screenName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.Screens.ScreenItem(screenName)).click();
  }

  /**
   * Delete a screen
   * @param screenName - Name of the screen to delete
   */
  async deleteScreen(screenName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await this.selectScreen(screenName);
    await frame.locator(CanvasAppLocators.Studio.Screens.ScreenMenu).click();
    await frame.locator(CanvasAppLocators.Studio.Screens.DeleteScreen).click();
  }

  // ========================================
  // App Search and Selection Methods
  // ========================================

  /**
   * Search for an app by name
   * @param appName - Name of the app to search for
   */
  async searchApp(appName: string): Promise<void> {
    await this.page.locator(CanvasAppLocators.Home.SearchBox).fill(appName);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingComplete();
  }

  /**
   * Open an existing app
   * @param appName - Name of the app to open
   */
  async openApp(appName: string): Promise<void> {
    await this.searchApp(appName);
    await this.page.locator(CanvasAppLocators.Home.AppCard(appName)).click();
    await this.waitForStudioLoad();
  }

  /**
   * Delete an app
   * @param appName - Name of the app to delete
   */
  async deleteApp(appName: string): Promise<void> {
    await this.searchApp(appName);
    const appCard = this.page.locator(CanvasAppLocators.Home.AppCard(appName));
    await appCard.hover();
    await appCard.locator(CanvasAppLocators.Details.MoreButton).click();
    await this.page.locator(CanvasAppLocators.Details.DeleteButton).click();
    await this.page.locator(CanvasAppLocators.DeleteDialog.Dialog).waitFor({ state: 'visible' });
    await this.page.locator(CanvasAppLocators.DeleteDialog.DeleteButton).click();
  }

  // ========================================
  // Share Methods
  // ========================================

  /**
   * Share app with a user
   * @param userEmail - Email of the user to share with
   * @param permission - Permission level ('CanEdit' or 'CanView')
   */
  async shareApp(userEmail: string, permission: 'CanEdit' | 'CanView' = 'CanView'): Promise<void> {
    const frame = await this.getStudioFrame();
    await frame.locator(CanvasAppLocators.Studio.CommandBar.ShareButton).click();
    await this.page.locator(CanvasAppLocators.ShareDialog.Dialog).waitFor({ state: 'visible' });

    // Search for user
    await this.page.locator(CanvasAppLocators.ShareDialog.SearchUsers).fill(userEmail);
    await this.page.keyboard.press('Enter');

    // Set permission
    await this.page
      .locator(CanvasAppLocators.ShareDialog.PermissionDropdown)
      .selectOption(permission);

    // Share
    await this.page.locator(CanvasAppLocators.ShareDialog.ShareButton).click();
  }

  // ========================================
  // Verification Methods
  // ========================================

  /**
   * Verify app exists in the list
   * @param appName - Name of the app
   */
  async verifyAppExists(appName: string): Promise<void> {
    await this.searchApp(appName);
    await expect(this.page.locator(CanvasAppLocators.Home.AppCard(appName))).toBeVisible();
  }

  /**
   * Verify app is saved
   */
  async verifyAppSaved(): Promise<void> {
    await expect(this.page.locator(CanvasAppLocators.SaveDialog.SuccessMessage)).toBeVisible();
  }

  /**
   * Verify app is published
   */
  async verifyAppPublished(): Promise<void> {
    await expect(this.page.locator(CanvasAppLocators.PublishDialog.SuccessMessage)).toBeVisible();
  }

  /**
   * Verify control exists on canvas
   * @param controlName - Name of the control
   */
  async verifyControlExists(controlName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    await expect(frame.locator(CanvasAppLocators.Studio.Canvas.Control(controlName))).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorDisplayed(): Promise<void> {
    await expect(this.page.locator(CanvasAppLocators.Common.ErrorBanner)).toBeVisible();
  }

  // ========================================
  // IAppLauncher Interface Implementation
  // ========================================

  readonly appType = 'Canvas';
  private appId: string | null = null;
  private appUrl: string | null = null;
  private ready: boolean = false;

  /**
   * Launch app by ID (IAppLauncher interface)
   */
  async launchById(appId: string, baseUrl: string, _mode: any, _options?: any): Promise<void> {
    this.appId = appId;
    const url = `${baseUrl}/play/${appId}`;
    this.appUrl = url;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    this.ready = true;
  }

  /**
   * Launch app by name (IAppLauncher interface)
   * Note: Navigation is handled by AppProvider, this just marks the launcher as ready
   */
  async launchByName(
    _appName: string,
    _findAppCallback: (appName: string) => Promise<any>,
    _mode: any,
    _options?: any
  ): Promise<void> {
    // Navigation is handled by AppProvider
    // Just mark as ready
    this.ready = true;
  }

  /**
   * Wait for app to load (IAppLauncher interface)
   */
  async waitForAppLoad(_options?: any): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    this.ready = true;
  }

  /**
   * Check if app is ready (IAppLauncher interface)
   */
  isAppReady(): boolean {
    return this.ready;
  }

  /**
   * Get app ID (IAppLauncher interface)
   */
  getAppId(): string | null {
    return this.appId;
  }

  /**
   * Get app URL (IAppLauncher interface)
   */
  getAppUrl(): string | null {
    return this.appUrl;
  }

  /**
   * Get control (IAppLauncher interface)
   */
  getControl(options: any): any {
    if (options.name) {
      return this.page.locator(`[data-control-name="${options.name}"]`);
    }
    return this.page.locator('body');
  }

  /**
   * Click control (IAppLauncher interface)
   */
  async clickControl(options: any): Promise<void> {
    const control = this.getControl(options);
    await control.click();
  }

  /**
   * Fill control (IAppLauncher interface)
   */
  async fillControl(options: any, value: string): Promise<void> {
    const control = this.getControl(options);
    await control.fill(value);
  }

  /**
   * Fill form (IAppLauncher interface)
   */
  async fillForm(formData: Record<string, string>): Promise<void> {
    for (const [name, value] of Object.entries(formData)) {
      await this.fillControl({ name }, value);
    }
  }

  /**
   * Assert control visible (IAppLauncher interface)
   */
  async assertControlVisible(options: any, _assertOptions?: any): Promise<void> {
    const control = this.getControl(options);
    await expect(control).toBeVisible();
  }

  /**
   * Assert control text (IAppLauncher interface)
   */
  async assertControlText(options: any, expectedText: string, _assertOptions?: any): Promise<void> {
    const control = this.getControl(options);
    await expect(control).toHaveText(expectedText);
  }

  /**
   * Close app (IAppLauncher interface)
   */
  async closeApp(): Promise<void> {
    this.ready = false;
    this.appId = null;
    this.appUrl = null;
  }

  /**
   * Reset launcher state (IAppLauncher interface)
   */
  reset(): void {
    this.ready = false;
    this.appId = null;
    this.appUrl = null;
    this.studioFrame = null;
  }
}
