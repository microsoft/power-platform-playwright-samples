// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model Driven App Page Object Model
 *
 * @remarks
 * This class covers two distinct scenarios:
 *
 * **Studio / App Designer** — methods for creating and authoring MDA apps in the Maker Portal
 * designer (pages, navigation, tables, settings). These target the App Designer UI.
 *
 * **Runtime / Play mode** — methods for interacting with a published MDA at runtime
 * (navigation pane, grid, form, command bar). These target the UCI shell.
 *
 * Methods in each group are separated by region banners in the source. Prefer
 * component-level APIs (`this.grid`, `this.form`, `this.commanding`) over the
 * convenience wrappers for advanced runtime scenarios.
 */

import { Page, expect } from '@playwright/test';
import { ModelDrivenAppLocators } from '../locators/model-driven-app.locators';
import { findLocator } from '../utils/locator-helpers';
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

  // ─── Studio / App Designer ────────────────────────────────────────────────
  // Methods below target the Maker Portal App Designer (authoring scenarios).
  // They require the designer canvas and left-nav to be loaded.
  // ──────────────────────────────────────────────────────────────────────────

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

    // Wait for the entity list URL to be confirmed before waiting for grid elements.
    // A fixed sleep is not reliable in CI — MDA shell initialisation varies.
    await this.page.waitForURL(/pagetype=entitylist/, { timeout: 30000 });

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

    // Wait for URL to confirm MDA has navigated to the form, then wait for the
    // form element to appear. Using waitForURL avoids arbitrary fixed delays.
    await this.page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });
    await ModelDrivenAppLocators.Runtime.Content.Form(this.page)
      .waitFor({ state: 'visible', timeout: 30000 })
      .catch(() => {
        console.log('[ModelDrivenAppPage] Form locator timeout, continuing...');
      });

    // Wait for Xrm entity context to be ready. UCI initializes asynchronously after
    // DOM load — the form element may be visible before Xrm.Page.data.entity is
    // functional. Without this check, callers that immediately call setEntityAttribute
    // or getEntityAttribute can hit the 30s waitForEntityContext timeout.
    await this.page
      .waitForFunction(
        () => {
          const entity = (window as any).Xrm?.Page?.data?.entity;
          if (!entity) return false;
          try {
            const name = entity.getEntityName?.();
            return typeof name === 'string' && name.length > 0;
          } catch {
            return false;
          }
        },
        undefined,
        { timeout: 30000 }
      )
      .catch(() => {
        console.log('[ModelDrivenAppPage] Xrm entity context not ready within 30s, continuing...');
      });

    console.log(`[ModelDrivenAppPage] Form view loaded for ${entityName}`);
  }

  /**
   * Wait for home page to load
   */
  async waitForHomePageLoad(): Promise<void> {
    await ModelDrivenAppLocators.Home.AppsGrid(this.page).waitFor({
      state: 'visible',
      timeout: 60000,
    });
  }

  /**
   * Wait for App Designer to load
   */
  async waitForDesignerLoad(): Promise<void> {
    await ModelDrivenAppLocators.Designer.Pages.PagesList(this.page).waitFor({
      state: 'visible',
      timeout: 90000,
    });
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    await ModelDrivenAppLocators.Common.LoadingSpinner(this.page).waitFor({
      state: 'hidden',
      timeout: 60000,
    });
  }

  /**
   * Wait for app runtime to load
   *
   * Uses built-in ARIA role first, then CSS fallbacks, because the navigation-pane
   * selector varies across MDA shell versions (data-automation-id is internal).
   */
  async waitForRuntimeLoad(): Promise<void> {
    await findLocator(
      this.page,
      [
        // Prefer ARIA navigation landmark — stable across MDA versions
        { by: 'role', role: 'navigation', name: /site map|navigation/i },
        // CSS fallbacks in decreasing reliability order
        { by: 'css', selector: '[data-automation-id="navigation-pane"]' },
        { by: 'css', selector: '[data-id="sitemap-area"]' },
        { by: 'css', selector: 'nav[aria-label]' },
      ],
      { timeout: 60_000 }
    );
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
    await ModelDrivenAppLocators.Home.CreateButton(this.page).click();
    await ModelDrivenAppLocators.Home.BlankAppOption(this.page).click();
    await this.waitForDesignerLoad();
    await this.setAppName(appName);
  }

  /**
   * Create Model Driven app from solution
   * @param solutionName - Name of the solution
   * @param appName - Name for the app
   */
  async createFromSolution(solutionName: string, appName: string): Promise<void> {
    await ModelDrivenAppLocators.Home.CreateButton(this.page).click();
    await ModelDrivenAppLocators.Home.FromSolutionOption(this.page).click();
    // Solution selection logic
    await this.waitForDesignerLoad();
    await this.setAppName(appName);
  }

  /**
   * Filter apps by Model Driven type
   */
  async filterByModelDrivenApps(): Promise<void> {
    await ModelDrivenAppLocators.Home.AppTypeFilter(this.page).selectOption('ModelDriven');
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
    const nameInput = ModelDrivenAppLocators.Designer.CommandBar.AppNameInput(this.page);
    await nameInput.click();
    await nameInput.fill(appName);
    await nameInput.press('Enter');
  }

  /**
   * Save the Model Driven app
   */
  async saveApp(): Promise<void> {
    await ModelDrivenAppLocators.Designer.CommandBar.SaveButton(this.page).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Publish the Model Driven app
   */
  async publishApp(): Promise<void> {
    await ModelDrivenAppLocators.Designer.CommandBar.PublishButton(this.page).click();
    await ModelDrivenAppLocators.PublishDialog.Dialog(this.page).waitFor({ state: 'visible' });
    await ModelDrivenAppLocators.PublishDialog.PublishButton(this.page).click();
    await this.waitForPublishComplete();
  }

  /**
   * Wait for publish operation to complete
   */
  async waitForPublishComplete(): Promise<void> {
    await ModelDrivenAppLocators.PublishDialog.SuccessMessage(this.page).waitFor({
      state: 'visible',
      timeout: 90000,
    });
  }

  /**
   * Play/Open the app in runtime
   */
  async playApp(): Promise<void> {
    await ModelDrivenAppLocators.Designer.CommandBar.PlayButton(this.page).click();
    // Wait for new tab/window to open with the app
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      ModelDrivenAppLocators.Designer.CommandBar.PlayButton(this.page).click(),
    ]);
    await newPage.waitForLoadState();
    return newPage as any;
  }

  /**
   * Validate the app
   */
  async validateApp(): Promise<void> {
    await ModelDrivenAppLocators.Designer.CommandBar.ValidateButton(this.page).click();
    await ModelDrivenAppLocators.Validation.ValidationPanel(this.page).waitFor({
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
    await ModelDrivenAppLocators.Designer.LeftNav.PagesTab(this.page).click();

    // Click Add page
    await ModelDrivenAppLocators.Designer.Pages.AddPageButton(this.page).click();

    // Select table-based page
    await ModelDrivenAppLocators.Designer.Pages.TableBasedPage(this.page).click();

    // Wait for dialog
    await ModelDrivenAppLocators.AddPageDialog.Dialog(this.page).waitFor({ state: 'visible' });

    // Select table
    await ModelDrivenAppLocators.AddPageDialog.SelectTableDropdown(this.page).selectOption(
      tableName
    );

    // Select forms
    for (const formName of forms) {
      await ModelDrivenAppLocators.AddPageDialog.FormItem(this.page, formName).click();
    }

    // Select views
    for (const viewName of views) {
      await ModelDrivenAppLocators.AddPageDialog.ViewItem(this.page, viewName).click();
    }

    // Add
    await ModelDrivenAppLocators.AddPageDialog.AddButton(this.page).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Add a dashboard page
   */
  async addDashboardPage(): Promise<void> {
    await ModelDrivenAppLocators.Designer.LeftNav.PagesTab(this.page).click();
    await ModelDrivenAppLocators.Designer.Pages.AddPageButton(this.page).click();
    await ModelDrivenAppLocators.Designer.Pages.DashboardPage(this.page).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Add a custom page
   */
  async addCustomPage(): Promise<void> {
    await ModelDrivenAppLocators.Designer.LeftNav.PagesTab(this.page).click();
    await ModelDrivenAppLocators.Designer.Pages.AddPageButton(this.page).click();
    await ModelDrivenAppLocators.Designer.Pages.CustomPage(this.page).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Delete a page
   * @param pageName - Name of the page to delete
   */
  async deletePage(pageName: string): Promise<void> {
    const pageItem = ModelDrivenAppLocators.Designer.Pages.PageItem(this.page, pageName);
    await pageItem.hover();
    await ModelDrivenAppLocators.Designer.Pages.PageMenu(pageItem).click();
    await ModelDrivenAppLocators.Designer.Pages.DeletePage(this.page).click();
  }

  // ========================================
  // Navigation Designer Methods
  // ========================================

  /**
   * Add navigation group
   * @param groupName - Name for the group
   */
  async addNavigationGroup(groupName: string): Promise<void> {
    await ModelDrivenAppLocators.Designer.LeftNav.NavigationTab(this.page).click();
    await ModelDrivenAppLocators.Designer.Navigation.AddGroupButton(this.page).click();
    await ModelDrivenAppLocators.Designer.Navigation.TitleInput(this.page).fill(groupName);
    await ModelDrivenAppLocators.Designer.Navigation.TitleInput(this.page).press('Enter');
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
    await ModelDrivenAppLocators.Designer.LeftNav.NavigationTab(this.page).click();

    // Select group
    await ModelDrivenAppLocators.Designer.Navigation.GroupItem(this.page, groupName).click();

    // Add subarea
    await ModelDrivenAppLocators.Designer.Navigation.AddSubAreaButton(this.page).click();

    // Set title
    await ModelDrivenAppLocators.Designer.Navigation.TitleInput(this.page).fill(subAreaTitle);

    // Link to table if provided
    if (tableName) {
      await ModelDrivenAppLocators.Designer.Navigation.TablePicker(this.page).click();
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
    await ModelDrivenAppLocators.Designer.LeftNav.DataTab(this.page).click();
    await ModelDrivenAppLocators.Designer.Data.AddTableButton(this.page).click();
    await ModelDrivenAppLocators.Designer.Data.SearchTable(this.page).fill(tableName);
    await ModelDrivenAppLocators.Designer.Data.TableItem(this.page, tableName).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Create a new table
   * @param displayName - Display name for the table
   * @param pluralName - Plural name for the table
   */
  async createNewTable(displayName: string, pluralName: string): Promise<void> {
    await ModelDrivenAppLocators.Designer.LeftNav.DataTab(this.page).click();
    await ModelDrivenAppLocators.Designer.Data.AddTableButton(this.page).click();

    // Assume there's a "Create new table" option
    await ModelDrivenAppLocators.CreateTableDialog.Dialog(this.page).waitFor({
      state: 'visible',
    });
    await ModelDrivenAppLocators.CreateTableDialog.DisplayNameInput(this.page).fill(displayName);
    await ModelDrivenAppLocators.CreateTableDialog.PluralNameInput(this.page).fill(pluralName);
    await ModelDrivenAppLocators.CreateTableDialog.CreateButton(this.page).click();
    await this.waitForLoadingComplete();
  }

  // ========================================
  // Settings Methods
  // ========================================

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    await ModelDrivenAppLocators.Designer.CommandBar.SettingsButton(this.page).click();
    await ModelDrivenAppLocators.Settings.Dialog(this.page).waitFor({ state: 'visible' });
  }

  /**
   * Set app description
   * @param description - Description for the app
   */
  async setAppDescription(description: string): Promise<void> {
    await this.openSettings();
    await ModelDrivenAppLocators.Settings.DescriptionInput(this.page).fill(description);
    await ModelDrivenAppLocators.Settings.SaveButton(this.page).click();
  }

  /**
   * Enable mobile for the app
   */
  async enableMobile(): Promise<void> {
    await this.openSettings();
    await ModelDrivenAppLocators.Settings.FeaturesTab(this.page).click();
    await ModelDrivenAppLocators.Settings.EnableMobileToggle(this.page).check();
    await ModelDrivenAppLocators.Settings.SaveButton(this.page).click();
  }

  /**
   * Enable offline mode
   */
  async enableOfflineMode(): Promise<void> {
    await this.openSettings();
    await ModelDrivenAppLocators.Settings.FeaturesTab(this.page).click();
    await ModelDrivenAppLocators.Settings.EnableOfflineToggle(this.page).check();
    await ModelDrivenAppLocators.Settings.SaveButton(this.page).click();
  }

  // ─── Runtime / Play Mode ──────────────────────────────────────────────────
  // Methods below target a published MDA running in the UCI shell.
  // Prefer the component APIs (this.grid, this.form, this.commanding) for
  // advanced scenarios — these convenience methods cover common one-liners.
  // ──────────────────────────────────────────────────────────────────────────

  // ========================================
  // Runtime/Play Mode Methods
  // ========================================

  /**
   * Navigate to a navigation item in runtime
   * @param itemName - Name of the navigation item
   */
  async navigateToRuntimeItem(itemName: string): Promise<void> {
    await ModelDrivenAppLocators.Runtime.SiteMap.SubArea(this.page, itemName).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Expand navigation group in runtime
   * @param groupName - Name of the group
   */
  async expandNavigationGroup(groupName: string): Promise<void> {
    await ModelDrivenAppLocators.Runtime.SiteMap.GroupHeader(this.page, groupName).click();
  }

  /**
   * Create new record in runtime
   */
  async createNewRecord(): Promise<void> {
    await ModelDrivenAppLocators.Runtime.Commands.NewButton(this.page).click();
    await ModelDrivenAppLocators.Runtime.Content.Form(this.page).waitFor({ state: 'visible' });
  }

  /**
   * Save record in runtime
   */
  async saveRecord(): Promise<void> {
    await ModelDrivenAppLocators.Runtime.Commands.SaveButton(this.page).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Fill form field in runtime
   * @param fieldName - Name of the field
   * @param value - Value to fill
   */
  async fillFormField(fieldName: string, value: string): Promise<void> {
    const fieldLocator = ModelDrivenAppLocators.Runtime.Content.FormField(this.page, fieldName);
    await fieldLocator.fill(value);
  }

  /**
   * Click command bar button in runtime
   * @param buttonLabel - Label of the button
   */
  async clickCommandButton(buttonLabel: string): Promise<void> {
    // Prefer getByRole — semantically stable and handles aria-label + text matching.
    // Fall back to CSS aria-label in case the button role is not 'button' (e.g. menuitem).
    const btn = await findLocator(this.page, [
      { by: 'role', role: 'button', name: buttonLabel },
      { by: 'role', role: 'menuitem', name: buttonLabel },
      { by: 'css', selector: `button[aria-label="${buttonLabel}"]` },
    ]);
    await btn.click();
  }

  /**
   * Switch form tab in runtime
   * @param tabName - Name of the tab
   */
  async switchFormTab(tabName: string): Promise<void> {
    await ModelDrivenAppLocators.Runtime.Content.FormTab(this.page, tabName).click();
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
    await ModelDrivenAppLocators.Designer.CommandBar.ShareButton(this.page).click();
    await ModelDrivenAppLocators.ShareDialog.Dialog(this.page).waitFor({ state: 'visible' });

    // Search for user
    await ModelDrivenAppLocators.ShareDialog.SearchUsers(this.page).fill(userEmail);
    await this.page.keyboard.press('Enter');

    // Select security role
    await ModelDrivenAppLocators.ShareDialog.SecurityRoleDropdown(this.page).selectOption(
      securityRole
    );

    // Share
    await ModelDrivenAppLocators.ShareDialog.ShareButton(this.page).click();
  }

  // ========================================
  // App Search and Selection Methods
  // ========================================

  /**
   * Search for an app by name
   * @param appName - Name of the app
   */
  async searchApp(appName: string): Promise<void> {
    await ModelDrivenAppLocators.Home.SearchBox(this.page).fill(appName);
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
    const appCard = ModelDrivenAppLocators.Home.AppCard(this.page, appName);
    await appCard.hover();
    await ModelDrivenAppLocators.Details.EditButton(appCard).click();
    await this.waitForDesignerLoad();
  }

  /**
   * Open an existing app in play mode
   * @param appName - Name of the app
   */
  async openAppForPlay(appName: string): Promise<void> {
    await this.filterByModelDrivenApps();
    await this.searchApp(appName);
    await ModelDrivenAppLocators.Home.AppCard(this.page, appName).click();
    await this.waitForRuntimeLoad();
  }

  /**
   * Delete an app
   * @param appName - Name of the app to delete
   */
  async deleteApp(appName: string): Promise<void> {
    await this.searchApp(appName);
    const appCard = ModelDrivenAppLocators.Home.AppCard(this.page, appName);
    await appCard.hover();
    await ModelDrivenAppLocators.Details.MoreButton(appCard).click();
    await ModelDrivenAppLocators.Details.DeleteButton(this.page).click();
    await ModelDrivenAppLocators.DeleteDialog.Dialog(this.page).waitFor({ state: 'visible' });
    await ModelDrivenAppLocators.DeleteDialog.DeleteButton(this.page).click();
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
    await expect(ModelDrivenAppLocators.Home.AppCard(this.page, appName)).toBeVisible();
  }

  /**
   * Verify app is published
   */
  async verifyAppPublished(): Promise<void> {
    await expect(ModelDrivenAppLocators.PublishDialog.SuccessMessage(this.page)).toBeVisible();
  }

  /**
   * Verify page exists in designer
   * @param pageName - Name of the page
   */
  async verifyPageExists(pageName: string): Promise<void> {
    await expect(ModelDrivenAppLocators.Designer.Pages.PageItem(this.page, pageName)).toBeVisible();
  }

  /**
   * Verify navigation item exists
   * @param itemName - Name of the navigation item
   */
  async verifyNavigationItemExists(itemName: string): Promise<void> {
    await expect(
      ModelDrivenAppLocators.Designer.Navigation.SubAreaItem(this.page, itemName)
    ).toBeVisible();
  }

  /**
   * Verify table is added to app
   * @param tableName - Name of the table
   */
  async verifyTableAdded(tableName: string): Promise<void> {
    await ModelDrivenAppLocators.Designer.LeftNav.DataTab(this.page).click();
    await expect(
      ModelDrivenAppLocators.Designer.Data.TableItem(this.page, tableName)
    ).toBeVisible();
  }

  /**
   * Verify validation has no errors
   */
  async verifyNoValidationErrors(): Promise<void> {
    await this.validateApp();
    await expect(ModelDrivenAppLocators.Validation.ErrorItem(this.page)).toHaveCount(0);
  }

  /**
   * Verify runtime loaded successfully
   */
  async verifyRuntimeLoaded(): Promise<void> {
    await expect(ModelDrivenAppLocators.Runtime.SiteMap.NavigationPane(this.page)).toBeVisible();
    await expect(ModelDrivenAppLocators.Runtime.Content.MainContent(this.page)).toBeVisible();
  }

  /**
   * Verify record saved in runtime
   */
  async verifyRecordSaved(): Promise<void> {
    await expect(ModelDrivenAppLocators.Common.SuccessNotification(this.page)).toBeVisible();
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
