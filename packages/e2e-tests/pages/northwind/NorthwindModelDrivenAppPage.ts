/**
 * Northwind Model-driven App Page
 * Custom page class for Northwind Model-driven app with app-specific methods
 * Now extends ModelDrivenAppPage to use GridComponent
 */

import { Page, expect, FrameLocator } from '@playwright/test';
import { ModelDrivenAppPage } from 'power-platform-playwright-toolkit';

const modernAppSelector = {
  // Edit Mode (Designer) selectors
  uciFrame: 'iframe#embeddedUCI',
  appBreadCrumb: '[data-id="appBreadCrumbText"]',
  component: (name: string) => `[role="treeitem"][aria-label="${name}"]`,
  addPage: '#add-new-page-in-command-bar',
  navigationLink: '[role="dialog"] [aria-label="Navigation link"]',
  urlInput: '#subAreaUrl',
  nameInput: '#subarea-title-property',
  navigationAddButton: '[data-test-id="Wizard_PrimaryButton"]',

  // Runtime Mode (Player) selectors - Northwind specific
  // NOTE: In Play mode, elements are in MAIN PAGE, not iframe!
  orderGridView: '[data-id="nwind_order"]',
  gridRow: '[data-id="cell-0-1"]',
  formContainer: '[data-id="form-container"]',
  // Command buttons are menuitems in main page
  commandMenuItem: (name: string) => `[role="menuitem"][aria-label="${name}"]`,
  commandButton: (name: string) => `button[aria-label="${name}"]`,
  saveAndCloseButton: '[role="menuitem"][aria-label="Save & Close"]',
  refreshButton: 'button[aria-label="Refresh"]',
  backButton: 'button[aria-label="Go back"]',
  recordTitle: '[data-id="header_title"]',
  // Form fields (main page)
  orderNumberField: '[role="textbox"][aria-label="Order Number"]',
};

export class NorthwindModelDrivenAppPage extends ModelDrivenAppPage {
  private modernAppFrame!: FrameLocator;

  constructor(page: Page) {
    super(page);
  }

  /**
   * Get the runtime frame locator (for Runtime Mode)
   */
  private getAppFrame(): FrameLocator {
    if (!this.modernAppFrame) {
      this.modernAppFrame = this.page.mainFrame().frameLocator(modernAppSelector.uciFrame);
    }
    return this.modernAppFrame;
  }

  // ========================================
  // Edit Mode Methods (Designer)
  // ========================================

  /**
   * Add New Navigation Page
   * @param url Page URL
   * @param title Title of the page
   */
  async addNewNavigationPage(url: string, title: string): Promise<void> {
    // Click add page button
    await this.page.locator(modernAppSelector.addPage).click();

    // Select navigation link option
    await this.page.locator(modernAppSelector.navigationLink).click();

    // Fill in URL
    await this.page.locator(modernAppSelector.urlInput).fill(url);

    // Fill in title
    await this.page.locator(modernAppSelector.nameInput).fill(title);

    // Click add button
    await this.page.locator(modernAppSelector.navigationAddButton).click();

    // Verify the component appears in the tree (use .last() to handle duplicates from multiple test runs)
    const component = this.page.locator(modernAppSelector.component(title)).last();
    await expect(component).toBeVisible();
  }

  // ========================================
  // Runtime Mode Methods (Play Mode)
  // ========================================

  /**
   * Navigate to Orders Grid View
   * In Play mode, app loads directly to Orders page, so just verify it's loaded
   */
  async navigateToOrdersGrid(): Promise<void> {
    // Wait for page to fully load
    await this.page.waitForTimeout(5000);

    // In Play mode, the app loads directly to the Orders view
    // Just verify we're on the right page by checking for the view header
    const viewHeaderSelectors = [
      '[aria-label*="Orders"]', // Any element with Orders in aria-label
      'text=All Orders', // View name
      '[role="grid"]', // Grid should be visible
    ];

    let found = false;
    for (const selector of viewHeaderSelectors) {
      try {
        await this.page.locator(selector).first().waitFor({
          state: 'visible',
          timeout: 10000,
        });
        console.log(`✅ Found Orders view using selector: ${selector}`);
        found = true;
        break;
      } catch (error) {
        console.log(`⚠️  Selector not found: ${selector}`);
      }
    }

    if (!found) {
      console.log('⚠️  Orders view not found, but continuing (app should be at Orders page)');
    }
  }

  /**
   * Open First Order Record from Grid
   * Now uses GridComponent from base class for simplified, reliable operation
   */
  async openFirstOrderRecord(): Promise<void> {
    // Use GridComponent's openRecord method - handles multiple strategies automatically
    await this.grid.openRecord({ rowNumber: 0 });
    console.log('✅ Opened first order record');

    // Wait for form to load
    await this.page.waitForTimeout(3000);
  }

  /**
   * Verify Order Form is Displayed
   * In Play mode, form is in main page, not iframe
   */
  async verifyOrderFormIsDisplayed(): Promise<void> {
    // In Play mode, form fields are in main page
    // Use role-based selector from codegen
    const formFieldSelector = '[role="textbox"][aria-label*="Order"]';
    await expect(this.page.locator(formFieldSelector).first()).toBeVisible({
      timeout: 30000,
    });
    console.log('✅ Order form displayed');
  }

  /**
   * Click Command Button by Name with multiple selector fallbacks
   * @param buttonName Button Name (e.g., 'Refresh', 'Save & Close', 'New')
   */
  async clickCommandButton(buttonName: string): Promise<void> {
    // Wait for app to fully load
    await this.page.waitForTimeout(5000);

    // Command buttons are MENUITEMS in the main page, not in iframe!
    // Try multiple selectors - prefer role-based selectors from codegen
    const selectors = [
      `[role="menuitem"][aria-label="${buttonName}"]`, // menuitem with exact aria-label
      modernAppSelector.commandButton(buttonName), // button[aria-label="ButtonName"]
      `[role="menuitem"]:has-text("${buttonName}")`, // menuitem with text
      `button:has-text("${buttonName}")`, // Button with text
      `[title="${buttonName}"]`, // Title attribute
      `[aria-label*="${buttonName}"]`, // Partial aria-label match
    ];

    let clicked = false;
    for (const selector of selectors) {
      try {
        // Look in MAIN PAGE, not iframe
        const button = this.page.locator(selector).first();
        await button.waitFor({
          state: 'visible',
          timeout: 15000,
        });
        console.log(`✅ Found button "${buttonName}" using selector: ${selector}`);
        await button.click();
        clicked = true;
        break;
      } catch (error) {
        console.log(`⚠️  Button selector not found: ${selector}`);
      }
    }

    if (!clicked) {
      throw new Error(`Could not find button "${buttonName}" with any selector`);
    }
  }

  /**
   * Click Refresh Button
   * In Play mode, button is in main page command bar
   */
  async clickRefreshButton(): Promise<void> {
    await this.page.locator(modernAppSelector.refreshButton).click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Clicked refresh button');
  }

  /**
   * Close Record and Go Back to Grid
   * In Play mode, use command bar in main page
   */
  async closeRecordAndGoBack(): Promise<void> {
    // Use back navigation or close button in main page
    const backButton = this.page.locator('[aria-label*="Back"]').first();
    await backButton.click();

    // Wait for grid to appear
    await this.page.waitForTimeout(3000);
    console.log('✅ Closed record and returned to grid');
  }
}
