/**
 * CommandingComponent
 * Handles command bar operations for Model-Driven Apps
 *
 * @example
 * ```typescript
 * const modelDrivenApp = new ModelDrivenAppPage(page);
 *
 * // Click command bar button
 * await modelDrivenApp.commanding.clickButton('New');
 * await modelDrivenApp.commanding.clickButton('Delete');
 *
 * // Click button in overflow menu
 * await modelDrivenApp.commanding.clickButton('Export to Excel', { checkOverflow: true });
 *
 * // Refresh the page
 * await modelDrivenApp.commanding.refresh();
 *
 * // Share a record
 * await modelDrivenApp.commanding.share();
 * ```
 */

import { Page, Locator } from '@playwright/test';
import { TimeOut } from '../../utils/config';

/**
 * Command bar context - where the command bar is located
 */
export enum CommandBarContext {
  /** Form page command bar */
  Form = 'form',
  /** Grid/View page command bar */
  Grid = 'grid',
  /** Subgrid command bar */
  SubGrid = 'subgrid',
}

/**
 * Options for clicking command bar buttons
 */
export interface CommandBarButtonOptions {
  /** Check overflow menu if button not found in main command bar */
  checkOverflow?: boolean;
  /** Timeout for waiting for button (milliseconds) */
  timeout?: number;
  /** Wait for button to be enabled before clicking */
  waitForEnabled?: boolean;
  /** Context where command bar is located */
  context?: CommandBarContext;
}

/**
 * CommandingComponent for Model-Driven Apps
 * Provides methods for interacting with command bars
 */
export class CommandingComponent {
  constructor(private page: Page) {}

  /**
   * Click a command bar button by its name or aria-label
   *
   * @param buttonName - Button name or aria-label (e.g., 'New', 'Delete', 'Save', 'Refresh')
   * @param options - Button click options
   *
   * @example
   * ```typescript
   * // Click New button
   * await commanding.clickButton('New');
   *
   * // Click Delete button with overflow check
   * await commanding.clickButton('Delete', { checkOverflow: true });
   *
   * // Click Save button and wait for it to be enabled
   * await commanding.clickButton('Save', { waitForEnabled: true });
   * ```
   */
  async clickButton(buttonName: string, options: CommandBarButtonOptions = {}): Promise<void> {
    const {
      checkOverflow = true,
      timeout = TimeOut.DefaultWaitTime,
      waitForEnabled = true,
      context = CommandBarContext.Form,
    } = options;

    console.log(`[CommandingComponent] Clicking button: ${buttonName}`);

    // Try to find button in main command bar
    let button = this.getButtonLocator(buttonName, context);
    let buttonFound = await button.count().then((c) => c > 0);

    // Check overflow menu if button not found
    if (!buttonFound && checkOverflow) {
      console.log(`[CommandingComponent] Button not found in main bar, checking overflow menu`);
      await this.openOverflowMenu(context);

      // Try to find button in overflow menu
      button = this.getOverflowButtonLocator(buttonName);
      buttonFound = await button.count().then((c) => c > 0);
    }

    if (!buttonFound) {
      throw new Error(`Button "${buttonName}" not found in command bar`);
    }

    // Wait for button to be enabled if requested
    if (waitForEnabled) {
      await button.waitFor({ state: 'visible', timeout });
      await this.page.waitForTimeout(1000); // Allow button to stabilize
    }

    // Click the button
    await button.click({ timeout });
    console.log(`[CommandingComponent] Clicked button: ${buttonName}`);
  }

  /**
   * Click the Refresh button to reload the page
   *
   * @example
   * ```typescript
   * await commanding.refresh();
   * ```
   */
  async refresh(): Promise<void> {
    await this.clickButton('Refresh', { waitForEnabled: true });
    await this.page.waitForLoadState('networkidle', { timeout: TimeOut.PageLoadTimeOut });
    console.log('[CommandingComponent] Page refreshed');
  }

  /**
   * Click the New button to create a new record
   *
   * @example
   * ```typescript
   * await commanding.clickNew();
   * // Wait for form to load
   * await page.waitForTimeout(3000);
   * ```
   */
  async clickNew(): Promise<void> {
    await this.clickButton('New', { checkOverflow: false });
    console.log('[CommandingComponent] Clicked New button');
  }

  /**
   * Click the Save button to save the current form
   *
   * @param waitForSave - Wait for save operation to complete
   *
   * @example
   * ```typescript
   * await commanding.save();
   * await commanding.save({ waitForSave: true });
   * ```
   */
  async save(waitForSave = true): Promise<void> {
    await this.clickButton('Save', { waitForEnabled: true });

    if (waitForSave) {
      // Wait for save notification to appear and disappear
      await this.page.waitForTimeout(2000);
    }

    console.log('[CommandingComponent] Clicked Save button');
  }

  /**
   * Click the Save & Close button
   *
   * @example
   * ```typescript
   * await commanding.saveAndClose();
   * ```
   */
  async saveAndClose(): Promise<void> {
    await this.clickButton('Save & Close', { waitForEnabled: true });
    await this.page.waitForTimeout(2000);
    console.log('[CommandingComponent] Clicked Save & Close button');
  }

  /**
   * Click the Delete button
   * Note: This does not confirm the deletion dialog
   *
   * @example
   * ```typescript
   * await commanding.clickDelete();
   * // Confirm deletion in dialog
   * await page.getByRole('button', { name: 'Delete' }).click();
   * ```
   */
  async clickDelete(): Promise<void> {
    await this.clickButton('Delete', { checkOverflow: true });
    console.log('[CommandingComponent] Clicked Delete button');
  }

  /**
   * Click the Share button
   *
   * @example
   * ```typescript
   * await commanding.share();
   * // Handle share dialog
   * ```
   */
  async share(): Promise<void> {
    await this.clickButton('Share', { checkOverflow: true });
    console.log('[CommandingComponent] Clicked Share button');
  }

  /**
   * Click the Assign button
   *
   * @example
   * ```typescript
   * await commanding.assign();
   * // Handle assign dialog
   * ```
   */
  async assign(): Promise<void> {
    await this.clickButton('Assign', { checkOverflow: true });
    console.log('[CommandingComponent] Clicked Assign button');
  }

  /**
   * Click the Deactivate button
   *
   * @example
   * ```typescript
   * await commanding.deactivate();
   * // Confirm in dialog if needed
   * ```
   */
  async deactivate(): Promise<void> {
    await this.clickButton('Deactivate', { checkOverflow: true });
    console.log('[CommandingComponent] Clicked Deactivate button');
  }

  /**
   * Click the Activate button
   *
   * @example
   * ```typescript
   * await commanding.activate();
   * ```
   */
  async activate(): Promise<void> {
    await this.clickButton('Activate', { checkOverflow: true });
    console.log('[CommandingComponent] Clicked Activate button');
  }

  /**
   * Open the overflow menu (... more commands)
   *
   * @param context - Command bar context
   *
   * @example
   * ```typescript
   * await commanding.openOverflowMenu();
   * ```
   */
  async openOverflowMenu(context = CommandBarContext.Form): Promise<void> {
    const overflowButton = this.getOverflowButtonLocator(context);

    const isExpanded = await overflowButton
      .getAttribute('aria-expanded')
      .then((attr) => attr === 'true')
      .catch(() => false);

    if (!isExpanded) {
      await overflowButton.click();
      await this.page.waitForTimeout(1000);
      console.log('[CommandingComponent] Opened overflow menu');
    }
  }

  /**
   * Check if a command bar button is visible
   *
   * @param buttonName - Button name or aria-label
   * @param options - Button options
   * @returns true if button is visible, false otherwise
   *
   * @example
   * ```typescript
   * const isDeleteVisible = await commanding.isButtonVisible('Delete');
   * if (isDeleteVisible) {
   *   await commanding.clickButton('Delete');
   * }
   * ```
   */
  async isButtonVisible(
    buttonName: string,
    options: CommandBarButtonOptions = {}
  ): Promise<boolean> {
    const { checkOverflow = true, context = CommandBarContext.Form } = options;

    // Check main command bar
    const button = this.getButtonLocator(buttonName, context);
    const isVisible = await button.isVisible().catch(() => false);

    if (isVisible) {
      return true;
    }

    // Check overflow menu if requested
    if (checkOverflow) {
      await this.openOverflowMenu(context);
      const overflowButton = this.getOverflowButtonLocator(buttonName);
      return await overflowButton.isVisible().catch(() => false);
    }

    return false;
  }

  /**
   * Check if a command bar button is enabled
   *
   * @param buttonName - Button name or aria-label
   * @param options - Button options
   * @returns true if button is enabled, false otherwise
   *
   * @example
   * ```typescript
   * const isSaveEnabled = await commanding.isButtonEnabled('Save');
   * ```
   */
  async isButtonEnabled(
    buttonName: string,
    options: CommandBarButtonOptions = {}
  ): Promise<boolean> {
    const { checkOverflow = true, context = CommandBarContext.Form } = options;

    // Check main command bar
    const button = this.getButtonLocator(buttonName, context);
    let isEnabled = await button.isEnabled().catch(() => false);

    if (isEnabled) {
      return true;
    }

    // Check overflow menu if requested
    if (checkOverflow) {
      await this.openOverflowMenu(context);
      const overflowButton = this.getOverflowButtonLocator(buttonName);
      isEnabled = await overflowButton.isEnabled().catch(() => false);
    }

    return isEnabled;
  }

  /**
   * Wait for a command bar button to be visible
   *
   * @param buttonName - Button name or aria-label
   * @param timeout - Timeout in milliseconds
   *
   * @example
   * ```typescript
   * await commanding.waitForButton('Save', 10000);
   * ```
   */
  async waitForButton(buttonName: string, timeout = TimeOut.DefaultWaitTime): Promise<void> {
    const button = this.getButtonLocator(buttonName);
    await button.waitFor({ state: 'visible', timeout });
    console.log(`[CommandingComponent] Button "${buttonName}" is visible`);
  }

  /**
   * Execute a custom command by clicking a button with specific data-id
   *
   * @param dataId - The data-id attribute of the command button
   *
   * @example
   * ```typescript
   * // Click a custom button
   * await commanding.executeCommand('mycompany.custombutton');
   * ```
   */
  async executeCommand(dataId: string): Promise<void> {
    const button = this.page.locator(`button[data-id="${dataId}"]`);
    await button.waitFor({ state: 'visible', timeout: TimeOut.DefaultWaitTime });
    await button.click();
    console.log(`[CommandingComponent] Executed custom command: ${dataId}`);
  }

  /**
   * Get the main command bar locator
   *
   * @returns Command bar container locator
   *
   * @example
   * ```typescript
   * const commandBar = await commanding.getCommandBar();
   * const buttons = await commandBar.locator('button').all();
   * ```
   */
  async getCommandBar(): Promise<Locator> {
    return this.page.locator('[data-id="CommandBar"]').first();
  }

  /**
   * Get button locator by name or aria-label
   * @private
   */
  private getButtonLocator(buttonName: string, context = CommandBarContext.Form): Locator {
    // Try multiple strategies to find the button
    return this.page
      .locator('[data-id="CommandBar"]')
      .locator(
        `button[aria-label="${buttonName}"], button[title="${buttonName}"], button:has-text("${buttonName}")`
      )
      .first();
  }

  /**
   * Get overflow button locator
   * @private
   */
  private getOverflowButtonLocator(contextOrButtonName: CommandBarContext | string): Locator {
    if (typeof contextOrButtonName === 'string') {
      // Button name provided - return button in overflow menu
      const buttonName = contextOrButtonName;
      return this.page
        .locator('[role="menu"]')
        .locator(
          `button[aria-label="${buttonName}"], button[title="${buttonName}"], button:has-text("${buttonName}")`
        )
        .first();
    } else {
      // Context provided - return overflow menu button itself
      return this.page.locator('button[data-id*="OverflowButton"]').first();
    }
  }
}
