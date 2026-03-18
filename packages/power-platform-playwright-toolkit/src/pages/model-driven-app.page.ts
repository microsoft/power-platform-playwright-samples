/**
 * Model Driven App Page Object Model
 * Provides methods for creating, editing, and testing Model Driven Apps
 */

import { Page, expect } from '@playwright/test';
import { ModelDrivenAppLocators } from '../locators/model-driven-app.locators';
import { GridComponent } from '../components/model-driven/grid.component';
import { FormComponent } from '../components/model-driven/form.component';
import { CommandingComponent } from '../components/model-driven/commanding.component';
import { GridRecordOptions } from '../components/model-driven/types';
import { addCertAuthRoute } from '../auth';
import * as fs from 'fs';

export class ModelDrivenAppPage {
  readonly page: Page;

  // Base URL for the Model-Driven App
  private _baseAppUrl?: string;

  // GridComponent (lazy-initialized)
  private _grid?: GridComponent;

  // FormComponent (lazy-initialized)
  private _form?: FormComponent;

  // CommandingComponent (lazy-initialized)
  private _commanding?: CommandingComponent;

  // Promise to track certificate auth setup
  private _certAuthSetup?: Promise<void>;

  constructor(page: Page, baseAppUrl?: string) {
    this.page = page;
    this._baseAppUrl = baseAppUrl;

    // Start certificate authentication setup (don't await - will be awaited on first navigation)
    this._certAuthSetup = this.setupCertificateAuth();
  }

  /**
   * Set up certificate authentication if configured in environment variables
   * This is automatically called in the constructor
   * @private
   */
  private async setupCertificateAuth(): Promise<void> {
    const credentialType = process.env.MS_AUTH_CREDENTIAL_TYPE;
    const certPath = process.env.MS_AUTH_LOCAL_FILE_PATH;

    if (credentialType === 'certificate' && certPath) {
      try {
        console.log('[ModelDrivenAppPage] Enabling certificate authentication...');
        const pfxBuffer = fs.readFileSync(certPath);
        const certPassword = process.env.MS_AUTH_CERTIFICATE_PASSWORD;
        const authEndpoint =
          process.env.AUTH_ENDPOINT?.replace('https://', '') || 'login.microsoftonline.com';

        await addCertAuthRoute(this.page, {
          pfx: pfxBuffer,
          passphrase: certPassword,
          authEndpoint: authEndpoint,
        });

        console.log('[ModelDrivenAppPage] ✅ Certificate authentication enabled');
      } catch (error: any) {
        console.error(
          '[ModelDrivenAppPage] ⚠️ Failed to enable certificate authentication:',
          error.message
        );
        console.error('[ModelDrivenAppPage] Tests may fail if certificate auth is required');
      }
    }
  }

  /**
   * Ensure certificate authentication is set up before navigation
   * @private
   */
  private async ensureCertAuth(): Promise<void> {
    if (this._certAuthSetup) {
      await this._certAuthSetup;
    }
  }

  /**
   * Set the base app URL for navigation
   * @param url - Base URL of the Model-Driven App (e.g., 'https://org.crm.dynamics.com/main.aspx?appid=abc-123')
   */
  setBaseAppUrl(url: string): void {
    this._baseAppUrl = url;
  }

  /**
   * Get the base app URL
   * Falls back to current page URL origin if not set
   */
  getBaseAppUrl(): string {
    if (this._baseAppUrl && this._baseAppUrl.trim()) {
      return this._baseAppUrl;
    }

    // Fallback to current page URL
    const currentUrl = this.page.url();

    // Check if current URL is valid (not about:blank, data:, etc.)
    if (!currentUrl || currentUrl.startsWith('about:') || currentUrl.startsWith('data:')) {
      throw new Error(
        'Base URL is not set. Please provide baseAppUrl in the ModelDrivenAppPage constructor, ' +
          'or ensure BASE_APP_URL environment variable is set. ' +
          'Example: new ModelDrivenAppPage(page, "https://org.crm.dynamics.com/main.aspx?appid=abc-123")'
      );
    }

    try {
      return new URL(currentUrl).origin;
    } catch {
      throw new Error(
        `Failed to extract base URL from current page URL "${currentUrl}". ` +
          'Please provide a valid baseAppUrl in the constructor.'
      );
    }
  }

  /**
   * Get GridComponent for advanced grid operations
   * Lazily initialized on first access
   *
   * @example
   * ```typescript
   * // Use grid component directly
   * await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
   * await modelDrivenApp.grid.selectRow(1);
   * const value = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
   * ```
   */
  get grid(): GridComponent {
    if (!this._grid) {
      this._grid = new GridComponent(this.page, ModelDrivenAppLocators.Runtime.Content.Grid);
    }
    return this._grid;
  }

  /**
   * Get FormComponent for advanced form operations
   * Lazily initialized on first access
   *
   * @example
   * ```typescript
   * // Use form component directly
   * const context = await modelDrivenApp.form.getContext();
   * console.log('Entity:', context.entityName);
   *
   * const orderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
   * await modelDrivenApp.form.setAttribute('nwind_ordernumber', 'TEST-12345');
   * await modelDrivenApp.form.save();
   * ```
   */
  get form(): FormComponent {
    if (!this._form) {
      this._form = new FormComponent(this.page);
    }
    return this._form;
  }

  /**
   * Get CommandingComponent for command bar operations
   * Lazily initialized on first access
   *
   * @example
   * ```typescript
   * // Use commanding component directly
   * await modelDrivenApp.commanding.clickButton('New');
   * await modelDrivenApp.commanding.refresh();
   * await modelDrivenApp.commanding.save();
   * ```
   */
  get commanding(): CommandingComponent {
    if (!this._commanding) {
      this._commanding = new CommandingComponent(this.page);
    }
    return this._commanding;
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
   * Navigate to grid/list view for a specific entity
   * Constructs URL to navigate directly to entity grid view
   *
   * @param entityName - Logical name of the entity (e.g., 'account', 'contact', 'nwind_order')
   * @param options - Navigation options
   * @param options.appId - Optional app ID to include in URL
   * @param options.viewId - Optional view ID to load specific view
   *
   * @example
   * // Navigate to accounts grid
   * await modelDrivenApp.navigateToGridView('account');
   *
   * // Navigate to custom entity grid
   * await modelDrivenApp.navigateToGridView('nwind_order');
   *
   * // Navigate to specific view
   * await modelDrivenApp.navigateToGridView('account', { viewId: 'view-guid' });
   */
  async navigateToGridView(
    entityName: string,
    options?: { appId?: string; viewId?: string }
  ): Promise<void> {
    // Ensure certificate authentication is set up before navigation
    await this.ensureCertAuth();

    const baseAppUrl = this.getBaseAppUrl();

    // Parse the base URL to extract origin (protocol + hostname only)
    let url: URL;
    try {
      url = new URL(baseAppUrl);
    } catch {
      throw new Error(
        `Invalid base URL: "${baseAppUrl}". Please check your BASE_APP_URL environment variable or constructor parameter.`
      );
    }
    const origin = url.origin; // e.g., https://ltimautomation.crm.dynamics.com

    // Try to get appId from: 1) options, 2) baseAppUrl, 3) current page URL
    let appId = options?.appId;
    if (!appId) {
      // Extract appId from baseAppUrl if present
      appId = url.searchParams.get('appid') || undefined;

      // Fallback to current page URL if still not found
      if (!appId) {
        const currentUrlParams = new URLSearchParams(new URL(this.page.url()).search);
        appId = currentUrlParams.get('appid') || '';
      }
    }

    // Build grid view URL using origin only
    let gridUrl = `${origin}/main.aspx?pagetype=entitylist&etn=${entityName}`;
    if (appId) {
      gridUrl += `&appid=${appId}`;
    }
    if (options?.viewId) {
      gridUrl += `&viewid=${options.viewId}`;
    }

    console.log(`[ModelDrivenAppPage] Navigating to grid view: ${entityName}`);
    console.log(`[ModelDrivenAppPage] Grid URL: ${gridUrl}`);
    await this.page.goto(gridUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for page to stabilize after navigation
    await this.page.waitForTimeout(3000);

    // Wait for grid to load (with extended timeout for slow-loading grids)
    await this.grid.waitForGridLoad();
    console.log(`[ModelDrivenAppPage] Grid view loaded for ${entityName}`);
  }

  /**
   * Navigate to form view for a specific entity
   * Can navigate to create new record or edit existing record
   *
   * @param entityName - Logical name of the entity (e.g., 'account', 'contact', 'nwind_order')
   * @param options - Navigation options
   * @param options.recordId - Optional record ID to edit existing record (if omitted, opens new record form)
   * @param options.appId - Optional app ID to include in URL
   * @param options.formId - Optional form ID to load specific form
   *
   * @example
   * // Navigate to new record form
   * await modelDrivenApp.navigateToFormView('account');
   *
   * // Navigate to existing record form
   * await modelDrivenApp.navigateToFormView('account', { recordId: 'record-guid' });
   *
   * // Navigate to specific form
   * await modelDrivenApp.navigateToFormView('contact', { formId: 'form-guid' });
   */
  async navigateToFormView(
    entityName: string,
    options?: { recordId?: string; appId?: string; formId?: string }
  ): Promise<void> {
    // Ensure certificate authentication is set up before navigation
    await this.ensureCertAuth();

    const baseAppUrl = this.getBaseAppUrl();

    // Parse the base URL to extract origin (protocol + hostname only)
    let url: URL;
    try {
      url = new URL(baseAppUrl);
    } catch {
      throw new Error(
        `Invalid base URL: "${baseAppUrl}". Please check your BASE_APP_URL environment variable or constructor parameter.`
      );
    }
    const origin = url.origin; // e.g., https://ltimautomation.crm.dynamics.com

    // Try to get appId from: 1) options, 2) baseAppUrl, 3) current page URL
    let appId = options?.appId;
    if (!appId) {
      // Extract appId from baseAppUrl if present
      appId = url.searchParams.get('appid') || undefined;

      // Fallback to current page URL if still not found
      if (!appId) {
        const currentUrlParams = new URLSearchParams(new URL(this.page.url()).search);
        appId = currentUrlParams.get('appid') || '';
      }
    }

    // Build form view URL using origin only
    let formUrl = `${origin}/main.aspx?pagetype=entityrecord&etn=${entityName}`;
    if (appId) {
      formUrl += `&appid=${appId}`;
    }
    if (options?.recordId) {
      formUrl += `&id=${options.recordId}`;
    }
    if (options?.formId) {
      formUrl += `&formid=${options.formId}`;
    }

    const action = options?.recordId ? 'edit' : 'create new';
    console.log(`[ModelDrivenAppPage] Navigating to form view (${action}): ${entityName}`);
    console.log(`[ModelDrivenAppPage] Form URL: ${formUrl}`);
    await this.page.goto(formUrl, { waitUntil: 'domcontentloaded' });

    // Wait for form to load
    await this.page.waitForTimeout(3000);
    await this.page
      .locator(ModelDrivenAppLocators.Runtime.Content.Form)
      .waitFor({ state: 'visible', timeout: 30000 })
      .catch(() => {
        console.log('[ModelDrivenAppPage] Form locator timeout, continuing...');
      });

    console.log(`[ModelDrivenAppPage] Form view loaded for ${entityName}`);
  }

  /**
   * Wait for home page to load
   */
  async waitForHomePageLoad(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Home.AppsGrid).waitFor({
      state: 'visible',
      timeout: 60000,
    });
  }

  /**
   * Wait for App Designer to load
   */
  async waitForDesignerLoad(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.PagesList).waitFor({
      state: 'visible',
      timeout: 90000,
    });
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Common.LoadingSpinner).waitFor({
      state: 'hidden',
      timeout: 60000,
    });
  }

  /**
   * Wait for app runtime to load
   */
  async waitForRuntimeLoad(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Runtime.SiteMap.NavigationPane).waitFor({
      state: 'visible',
      timeout: 60000,
    });
  }

  // ========================================
  // Grid Convenience Methods
  // Delegate to GridComponent for common operations
  // ========================================

  /**
   * Open a record from the grid view
   * Convenience method that delegates to GridComponent
   *
   * @param options - Record selection options
   *
   * @example
   * // Open first record
   * await modelDrivenApp.openRecordFromGrid({ rowNumber: 0 });
   *
   * // Open record by column value
   * await modelDrivenApp.openRecordFromGrid({
   *   columnValue: 'TEST-123',
   *   columnName: 'Order Number'
   * });
   */
  async openRecordFromGrid(options: GridRecordOptions): Promise<void> {
    return this.grid.openRecord(options);
  }

  /**
   * Select a row in the grid
   * Convenience method that delegates to GridComponent
   *
   * @param rowNumber - Row index (0-based)
   */
  async selectGridRow(rowNumber: number): Promise<void> {
    return this.grid.selectRow(rowNumber);
  }

  /**
   * Get cell value from grid
   * Convenience method that delegates to GridComponent
   *
   * @param row - Row index (0-based)
   * @param column - Column name
   * @returns Cell text content
   */
  async getGridCellValue(row: number, column: string): Promise<string> {
    return this.grid.getCellValue(row, column);
  }

  // ========================================
  // App Creation Methods
  // ========================================

  /**
   * Create a blank Model Driven app
   * @param appName - Name for the app
   */
  async createBlankModelDrivenApp(appName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Home.CreateButton).click();
    await this.page.locator(ModelDrivenAppLocators.Home.BlankAppOption).click();
    await this.waitForDesignerLoad();
    await this.setAppName(appName);
  }

  /**
   * Create Model Driven app from solution
   * @param solutionName - Name of the solution
   * @param appName - Name for the app
   */
  async createFromSolution(solutionName: string, appName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Home.CreateButton).click();
    await this.page.locator(ModelDrivenAppLocators.Home.FromSolutionOption).click();
    // Solution selection logic
    await this.waitForDesignerLoad();
    await this.setAppName(appName);
  }

  /**
   * Filter apps by Model Driven type
   */
  async filterByModelDrivenApps(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Home.AppTypeFilter).selectOption('ModelDriven');
    await this.waitForLoadingComplete();
  }

  // ========================================
  // App Management Methods
  // ========================================

  /**
   * Set app name
   * @param appName - Name for the app
   */
  async setAppName(appName: string): Promise<void> {
    const nameInput = this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.AppNameInput);
    await nameInput.click();
    await nameInput.fill(appName);
    await nameInput.press('Enter');
  }

  /**
   * Save the Model Driven app
   */
  async saveApp(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.SaveButton).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Publish the Model Driven app
   */
  async publishApp(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.PublishButton).click();
    await this.page
      .locator(ModelDrivenAppLocators.PublishDialog.Dialog)
      .waitFor({ state: 'visible' });
    await this.page.locator(ModelDrivenAppLocators.PublishDialog.PublishButton).click();
    await this.waitForPublishComplete();
  }

  /**
   * Wait for publish operation to complete
   */
  async waitForPublishComplete(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.PublishDialog.SuccessMessage).waitFor({
      state: 'visible',
      timeout: 90000,
    });
  }

  /**
   * Play/Open the app in runtime
   */
  async playApp(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.PlayButton).click();
    // Wait for new tab/window to open with the app
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.PlayButton).click(),
    ]);
    await newPage.waitForLoadState();
    return newPage as any;
  }

  /**
   * Validate the app
   */
  async validateApp(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.ValidateButton).click();
    await this.page.locator(ModelDrivenAppLocators.Validation.ValidationPanel).waitFor({
      state: 'visible',
    });
  }

  // ========================================
  // Page Management Methods
  // ========================================

  /**
   * Add a table-based page
   * @param tableName - Name of the table
   * @param forms - Array of form names to include
   * @param views - Array of view names to include
   */
  async addTableBasedPage(
    tableName: string,
    forms: string[] = [],
    views: string[] = []
  ): Promise<void> {
    // Open Pages panel
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.PagesTab).click();

    // Click Add page
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.AddPageButton).click();

    // Select table-based page
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.TableBasedPage).click();

    // Wait for dialog
    await this.page
      .locator(ModelDrivenAppLocators.AddPageDialog.Dialog)
      .waitFor({ state: 'visible' });

    // Select table
    await this.page
      .locator(ModelDrivenAppLocators.AddPageDialog.SelectTableDropdown)
      .selectOption(tableName);

    // Select forms
    for (const formName of forms) {
      await this.page.locator(ModelDrivenAppLocators.AddPageDialog.FormItem(formName)).click();
    }

    // Select views
    for (const viewName of views) {
      await this.page.locator(ModelDrivenAppLocators.AddPageDialog.ViewItem(viewName)).click();
    }

    // Add
    await this.page.locator(ModelDrivenAppLocators.AddPageDialog.AddButton).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Add a dashboard page
   */
  async addDashboardPage(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.PagesTab).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.AddPageButton).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.DashboardPage).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Add a custom page
   */
  async addCustomPage(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.PagesTab).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.AddPageButton).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.CustomPage).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Delete a page
   * @param pageName - Name of the page to delete
   */
  async deletePage(pageName: string): Promise<void> {
    const pageItem = this.page.locator(ModelDrivenAppLocators.Designer.Pages.PageItem(pageName));
    await pageItem.hover();
    await pageItem.locator(ModelDrivenAppLocators.Designer.Pages.PageMenu).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Pages.DeletePage).click();
  }

  // ========================================
  // Navigation Designer Methods
  // ========================================

  /**
   * Add navigation group
   * @param groupName - Name for the group
   */
  async addNavigationGroup(groupName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.NavigationTab).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Navigation.AddGroupButton).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Navigation.TitleInput).fill(groupName);
    await this.page.locator(ModelDrivenAppLocators.Designer.Navigation.TitleInput).press('Enter');
  }

  /**
   * Add navigation subarea
   * @param groupName - Parent group name
   * @param subAreaTitle - Title for the subarea
   * @param tableName - Optional table to link to
   */
  async addNavigationSubArea(
    groupName: string,
    subAreaTitle: string,
    tableName?: string
  ): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.NavigationTab).click();

    // Select group
    await this.page
      .locator(ModelDrivenAppLocators.Designer.Navigation.GroupItem(groupName))
      .click();

    // Add subarea
    await this.page.locator(ModelDrivenAppLocators.Designer.Navigation.AddSubAreaButton).click();

    // Set title
    await this.page
      .locator(ModelDrivenAppLocators.Designer.Navigation.TitleInput)
      .fill(subAreaTitle);

    // Link to table if provided
    if (tableName) {
      await this.page.locator(ModelDrivenAppLocators.Designer.Navigation.TablePicker).click();
      await this.page.locator(`option:has-text("${tableName}")`).click();
    }
  }

  // ========================================
  // Data Management Methods
  // ========================================

  /**
   * Add table to the app
   * @param tableName - Name of the table
   */
  async addTable(tableName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.DataTab).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Data.AddTableButton).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Data.SearchTable).fill(tableName);
    await this.page.locator(ModelDrivenAppLocators.Designer.Data.TableItem(tableName)).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Create a new table
   * @param displayName - Display name for the table
   * @param pluralName - Plural name for the table
   */
  async createNewTable(displayName: string, pluralName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.DataTab).click();
    await this.page.locator(ModelDrivenAppLocators.Designer.Data.AddTableButton).click();

    // Assume there's a "Create new table" option
    await this.page
      .locator(ModelDrivenAppLocators.CreateTableDialog.Dialog)
      .waitFor({ state: 'visible' });
    await this.page
      .locator(ModelDrivenAppLocators.CreateTableDialog.DisplayNameInput)
      .fill(displayName);
    await this.page
      .locator(ModelDrivenAppLocators.CreateTableDialog.PluralNameInput)
      .fill(pluralName);
    await this.page.locator(ModelDrivenAppLocators.CreateTableDialog.CreateButton).click();
    await this.waitForLoadingComplete();
  }

  // ========================================
  // Settings Methods
  // ========================================

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.SettingsButton).click();
    await this.page.locator(ModelDrivenAppLocators.Settings.Dialog).waitFor({ state: 'visible' });
  }

  /**
   * Set app description
   * @param description - Description for the app
   */
  async setAppDescription(description: string): Promise<void> {
    await this.openSettings();
    await this.page.locator(ModelDrivenAppLocators.Settings.DescriptionInput).fill(description);
    await this.page.locator(ModelDrivenAppLocators.Settings.SaveButton).click();
  }

  /**
   * Enable mobile for the app
   */
  async enableMobile(): Promise<void> {
    await this.openSettings();
    await this.page.locator(ModelDrivenAppLocators.Settings.FeaturesTab).click();
    await this.page.locator(ModelDrivenAppLocators.Settings.EnableMobileToggle).check();
    await this.page.locator(ModelDrivenAppLocators.Settings.SaveButton).click();
  }

  /**
   * Enable offline mode
   */
  async enableOfflineMode(): Promise<void> {
    await this.openSettings();
    await this.page.locator(ModelDrivenAppLocators.Settings.FeaturesTab).click();
    await this.page.locator(ModelDrivenAppLocators.Settings.EnableOfflineToggle).check();
    await this.page.locator(ModelDrivenAppLocators.Settings.SaveButton).click();
  }

  // ========================================
  // Runtime/Play Mode Methods
  // ========================================

  /**
   * Navigate to a navigation item in runtime
   * @param itemName - Name of the navigation item
   */
  async navigateToRuntimeItem(itemName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Runtime.SiteMap.SubArea(itemName)).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Expand navigation group in runtime
   * @param groupName - Name of the group
   */
  async expandNavigationGroup(groupName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Runtime.SiteMap.GroupHeader(groupName)).click();
  }

  /**
   * Create new record in runtime
   */
  async createNewRecord(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Runtime.Commands.NewButton).click();
    await this.page
      .locator(ModelDrivenAppLocators.Runtime.Content.Form)
      .waitFor({ state: 'visible' });
  }

  /**
   * Save record in runtime
   */
  async saveRecord(): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Runtime.Commands.SaveButton).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Fill form field in runtime
   * @param fieldName - Name of the field
   * @param value - Value to fill
   */
  async fillFormField(fieldName: string, value: string): Promise<void> {
    const fieldLocator = this.page.locator(
      ModelDrivenAppLocators.Runtime.Content.FormField(fieldName)
    );
    await fieldLocator.fill(value);
  }

  /**
   * Click command bar button in runtime
   * @param buttonLabel - Label of the button
   */
  async clickCommandButton(buttonLabel: string): Promise<void> {
    await this.page.locator(`button[aria-label="${buttonLabel}"]`).click();
  }

  /**
   * Switch form tab in runtime
   * @param tabName - Name of the tab
   */
  async switchFormTab(tabName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Runtime.Content.FormTab(tabName)).click();
  }

  // ========================================
  // Share Methods
  // ========================================

  /**
   * Share app with a user
   * @param userEmail - Email of the user
   * @param securityRole - Security role to assign
   */
  async shareApp(userEmail: string, securityRole: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.CommandBar.ShareButton).click();
    await this.page
      .locator(ModelDrivenAppLocators.ShareDialog.Dialog)
      .waitFor({ state: 'visible' });

    // Search for user
    await this.page.locator(ModelDrivenAppLocators.ShareDialog.SearchUsers).fill(userEmail);
    await this.page.keyboard.press('Enter');

    // Select security role
    await this.page
      .locator(ModelDrivenAppLocators.ShareDialog.SecurityRoleDropdown)
      .selectOption(securityRole);

    // Share
    await this.page.locator(ModelDrivenAppLocators.ShareDialog.ShareButton).click();
  }

  // ========================================
  // App Search and Selection Methods
  // ========================================

  /**
   * Search for an app by name
   * @param appName - Name of the app
   */
  async searchApp(appName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Home.SearchBox).fill(appName);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingComplete();
  }

  /**
   * Open an existing app for editing
   * @param appName - Name of the app
   */
  async openAppForEdit(appName: string): Promise<void> {
    await this.filterByModelDrivenApps();
    await this.searchApp(appName);
    const appCard = this.page.locator(ModelDrivenAppLocators.Home.AppCard(appName));
    await appCard.hover();
    await appCard.locator(ModelDrivenAppLocators.Details.EditButton).click();
    await this.waitForDesignerLoad();
  }

  /**
   * Open an existing app in play mode
   * @param appName - Name of the app
   */
  async openAppForPlay(appName: string): Promise<void> {
    await this.filterByModelDrivenApps();
    await this.searchApp(appName);
    await this.page.locator(ModelDrivenAppLocators.Home.AppCard(appName)).click();
    await this.waitForRuntimeLoad();
  }

  /**
   * Delete an app
   * @param appName - Name of the app to delete
   */
  async deleteApp(appName: string): Promise<void> {
    await this.searchApp(appName);
    const appCard = this.page.locator(ModelDrivenAppLocators.Home.AppCard(appName));
    await appCard.hover();
    await appCard.locator(ModelDrivenAppLocators.Details.MoreButton).click();
    await this.page.locator(ModelDrivenAppLocators.Details.DeleteButton).click();
    await this.page
      .locator(ModelDrivenAppLocators.DeleteDialog.Dialog)
      .waitFor({ state: 'visible' });
    await this.page.locator(ModelDrivenAppLocators.DeleteDialog.DeleteButton).click();
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
    await expect(this.page.locator(ModelDrivenAppLocators.Home.AppCard(appName))).toBeVisible();
  }

  /**
   * Verify app is published
   */
  async verifyAppPublished(): Promise<void> {
    await expect(
      this.page.locator(ModelDrivenAppLocators.PublishDialog.SuccessMessage)
    ).toBeVisible();
  }

  /**
   * Verify page exists in designer
   * @param pageName - Name of the page
   */
  async verifyPageExists(pageName: string): Promise<void> {
    await expect(
      this.page.locator(ModelDrivenAppLocators.Designer.Pages.PageItem(pageName))
    ).toBeVisible();
  }

  /**
   * Verify navigation item exists
   * @param itemName - Name of the navigation item
   */
  async verifyNavigationItemExists(itemName: string): Promise<void> {
    await expect(
      this.page.locator(ModelDrivenAppLocators.Designer.Navigation.SubAreaItem(itemName))
    ).toBeVisible();
  }

  /**
   * Verify table is added to app
   * @param tableName - Name of the table
   */
  async verifyTableAdded(tableName: string): Promise<void> {
    await this.page.locator(ModelDrivenAppLocators.Designer.LeftNav.DataTab).click();
    await expect(
      this.page.locator(ModelDrivenAppLocators.Designer.Data.TableItem(tableName))
    ).toBeVisible();
  }

  /**
   * Verify validation has no errors
   */
  async verifyNoValidationErrors(): Promise<void> {
    await this.validateApp();
    await expect(this.page.locator(ModelDrivenAppLocators.Validation.ErrorItem)).toHaveCount(0);
  }

  /**
   * Verify runtime loaded successfully
   */
  async verifyRuntimeLoaded(): Promise<void> {
    await expect(
      this.page.locator(ModelDrivenAppLocators.Runtime.SiteMap.NavigationPane)
    ).toBeVisible();
    await expect(
      this.page.locator(ModelDrivenAppLocators.Runtime.Content.MainContent)
    ).toBeVisible();
  }

  /**
   * Verify record saved in runtime
   */
  async verifyRecordSaved(): Promise<void> {
    await expect(
      this.page.locator(ModelDrivenAppLocators.Common.SuccessNotification)
    ).toBeVisible();
  }

  // ========================================
  // IAppLauncher Interface Implementation
  // ========================================

  readonly appType = 'ModelDriven';
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
   */
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
      return this.page.locator(`[aria-label="${options.name}"]`);
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
  }
}
