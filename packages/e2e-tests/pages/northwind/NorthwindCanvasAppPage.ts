/**
 * Northwind Canvas App Page
 * Custom page class for Northwind Canvas app with app-specific methods
 */

import { Page, FrameLocator, expect } from '@playwright/test';

const canvasAppSelector = {
  // Edit Mode (Studio) selectors
  studioFrame: 'iframe[data-test-id="iframe-powerapps-studio"]',
  powerAppsLogo: '[id="spl-powerapps"] [class="spl-powerapps-logo"]',
  skipButton: '[data-test-id="dialog-skip-button-id"]',
  insertButton: '[id="commandBar_insert"]',
  controlSearchBox: '[class*="ms-Callout-main"] input[type="search"][id*="control"]',
  controlName: (name: string) => `[class*="margin"] div[class*="ba-Tree-Node"][title="${name}"]`,
  spinnerProgressbar: '[role="progressbar"]',
  editControlName: '[data-icon-name="Edit"]',
  controlNameTextBox: '[id="control-sidebar-header-control-name-input"]',
  controlItem: (name: string) => `[role="treeitem"] [aria-label="${name}"]:not([role="textbox"])`,

  // Runtime Mode (Player) selectors - Northwind specific
  canvasAppFrame: 'iframe[name="fullscreen-app-host"]',
  orderGalleryItem: '[data-control-name="Gallery1"] [data-control-part="item"]',
  orderDetailView: '[data-control-name="DetailScreen1"]',
  saveButton: '[data-control-name="IconSave1"]',
  backButton: '[data-control-name="IconBackarrow1"]',
  orderStatus: '[data-control-name="StatusDropdown"]',
};

export class NorthwindCanvasAppPage {
  private studioFrame!: FrameLocator;
  private canvasFrame!: FrameLocator;
  private appPage!: Page;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get the studio frame locator (for Edit Mode)
   */
  private async getStudioFrame(): Promise<FrameLocator> {
    if (!this.studioFrame) {
      this.studioFrame = this.page.mainFrame().frameLocator(canvasAppSelector.studioFrame);
    }
    return this.studioFrame;
  }

  /**
   * Set the app page reference (for Runtime Mode when app opens in new tab)
   * @param page The new page where the app is running
   */
  setAppPage(page: Page): void {
    this.appPage = page;
    this.canvasFrame = this.appPage.mainFrame().frameLocator(canvasAppSelector.canvasAppFrame);
  }

  /**
   * Wait for Canvas App to Load in Runtime Mode
   */
  async waitForCanvasAppToLoad(): Promise<void> {
    await this.appPage.waitForLoadState('domcontentloaded');
    await this.appPage.waitForTimeout(5000);
  }

  /**
   * Insert Controls by Using Search Option
   * @param controlNames Array of control names to insert
   */
  async insertControlsBySearch(controlNames: string[]): Promise<void> {
    const frame = await this.getStudioFrame();

    for (const controlName of controlNames) {
      // Click insert button
      await frame.locator(canvasAppSelector.insertButton).click();

      // Search for control
      await frame.locator(canvasAppSelector.controlSearchBox).clear();
      await frame.locator(canvasAppSelector.controlSearchBox).fill(controlName);

      // Click on the control in search results
      await frame.locator(canvasAppSelector.controlName(controlName)).click();

      // Wait for spinner to disappear
      await frame
        .locator(canvasAppSelector.spinnerProgressbar)
        .waitFor({ state: 'hidden', timeout: 180000 });
      await this.page.waitForTimeout(5000);
    }
  }

  /**
   * Edit Control Name
   * @param newControlName New name for the control
   */
  async editControlName(newControlName: string): Promise<void> {
    const frame = await this.getStudioFrame();

    // Click edit icon
    await frame.locator(canvasAppSelector.editControlName).click();

    // Fill in new name
    await frame.locator(canvasAppSelector.controlNameTextBox).fill(newControlName);

    // Press Enter to confirm
    await this.page.keyboard.press('Enter');

    // Wait for spinner
    await frame
      .locator(canvasAppSelector.spinnerProgressbar)
      .waitFor({ state: 'hidden', timeout: 180000 });
  }

  /**
   * Verify Added Control is Displayed on Canvas
   * @param controlName Control name to verify
   */
  async verifyControlDisplayedOnCanvas(controlName: string): Promise<void> {
    const frame = await this.getStudioFrame();
    const controlItem = frame.locator(canvasAppSelector.controlItem(controlName));
    await expect(controlItem).toBeVisible();
  }

  // ========================================
  // Runtime Mode Methods (Play Mode)
  // ========================================

  /**
   * Navigate to Orders Grid View (Gallery)
   * Verifies the gallery is visible
   */
  async navigateToOrdersGrid(): Promise<void> {
    await this.canvasFrame.locator(canvasAppSelector.orderGalleryItem).first().waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  /**
   * Open First Order Record from Gallery
   */
  async openFirstOrderRecord(): Promise<void> {
    await this.canvasFrame.locator(canvasAppSelector.orderGalleryItem).first().click();
    await this.appPage.waitForTimeout(2000);
  }

  /**
   * Verify Order Detail View is Displayed
   */
  async verifyOrderDetailIsDisplayed(): Promise<void> {
    await expect(this.canvasFrame.locator(canvasAppSelector.orderDetailView)).toBeVisible({
      timeout: 30000,
    });
  }

  /**
   * Click Save Button
   */
  async clickSaveButton(): Promise<void> {
    await this.canvasFrame.locator(canvasAppSelector.saveButton).click();
    await this.appPage.waitForTimeout(2000);
  }

  /**
   * Click Back Button to return to Grid
   */
  async clickBackButton(): Promise<void> {
    await this.canvasFrame.locator(canvasAppSelector.backButton).click();
    await this.canvasFrame.locator(canvasAppSelector.orderGalleryItem).first().waitFor({
      state: 'visible',
      timeout: 30000,
    });
  }

  /**
   * Close App by closing the tab
   */
  async closeApp(): Promise<void> {
    await this.appPage.close();
  }
}
