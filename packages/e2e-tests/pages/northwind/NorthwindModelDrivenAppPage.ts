// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Northwind Model-driven App Page
 * Custom page class for Northwind Model-driven app with app-specific methods.
 * Extends ModelDrivenAppPage to inherit GridComponent and navigation helpers.
 */

import { Page, expect } from '@playwright/test';
import { ModelDrivenAppPage } from 'power-platform-playwright-toolkit';

// CSS selectors kept for internal Power Apps IDs/attributes that have no ARIA equivalent
const StudioSelectors = {
  addPage: '#add-new-page-in-command-bar',
  urlInput: '#subAreaUrl',
  nameInput: '#subarea-title-property',
};

export class NorthwindModelDrivenAppPage extends ModelDrivenAppPage {
  constructor(page: Page) {
    super(page);
  }

  // ── Edit Mode Methods (App Designer) ──────────────────────────────────────

  /**
   * Add a URL-based navigation page to the app via the App Designer sidebar.
   */
  async addNewNavigationPage(url: string, title: string): Promise<void> {
    await this.page.locator(StudioSelectors.addPage).click();
    await this.page.getByRole('dialog').getByLabel('Navigation link').click();
    await this.page.locator(StudioSelectors.urlInput).fill(url);
    await this.page.locator(StudioSelectors.nameInput).fill(title);
    await this.page.getByTestId('Wizard_PrimaryButton').click();

    const component = this.page.getByRole('treeitem', { name: title }).last();
    await expect(component).toBeVisible();
  }

  // ── Runtime Mode Methods (Play Mode) ──────────────────────────────────────

  /**
   * Wait for the Orders grid to be visible.
   * In Play mode the app loads directly to the Orders view.
   */
  async navigateToOrdersGrid(): Promise<void> {
    await this.page.waitForTimeout(5000);

    const candidates = [
      this.page.getByRole('grid').first(),
      this.page.locator('[aria-label*="Orders"]').first(),
    ];

    for (const locator of candidates) {
      try {
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return;
      } catch {
        // try next
      }
    }
    console.log('Orders view not found, but continuing');
  }

  /**
   * Open the first order record from the grid using GridComponent.
   */
  async openFirstOrderRecord(): Promise<void> {
    await this.grid.openRecord({ rowNumber: 0 });
    await this.page.waitForTimeout(3000);
  }

  /**
   * Assert that the Order form is visible.
   */
  async verifyOrderFormIsDisplayed(): Promise<void> {
    await expect(this.page.getByRole('textbox', { name: /Order/i }).first()).toBeVisible({
      timeout: 30000,
    });
  }

  /**
   * Click a command bar button by name using ARIA role fallback chain.
   */
  async clickCommandButton(buttonName: string): Promise<void> {
    await this.page.waitForTimeout(5000);

    const btn = this.page
      .getByRole('menuitem', { name: buttonName })
      .or(this.page.getByRole('button', { name: buttonName }))
      .first();

    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
  }

  /**
   * Click the Refresh button.
   */
  async clickRefreshButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Refresh' }).click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate back to the grid by clicking the Back button.
   */
  async closeRecordAndGoBack(): Promise<void> {
    await this.page.getByRole('button', { name: /back/i }).first().click();
    await this.page.waitForTimeout(3000);
  }
}
