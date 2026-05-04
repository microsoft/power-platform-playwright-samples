// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, FrameLocator, Page } from '@playwright/test';
import { TimeOut } from 'power-platform-playwright-toolkit';

// CSS selectors kept for internal Power Apps IDs/attributes that have no ARIA equivalent
const SEL = {
  studioFrame: 'iframe[data-test-id="iframe-powerapps-studio"]',
  powerAppsLogo: '[id="spl-powerapps"] [class="spl-powerapps-logo"]',
  startFromData: '#start-from-data-button',
  dataSourceItem: (option: string) =>
    `[data-item-id*="datasourceItem"] [aria-label="${option}"], ` +
    `[role="option"][aria-label="${option}"], ` +
    `[aria-label="${option}"][tabindex], ` +
    `button[title="${option}"], ` +
    `[role="option"]:has-text("${option}"), ` +
    `[role="treeitem"]:has-text("${option}"), ` +
    `[role="listitem"] :text-is("${option}")`,
  successMessage: '[class*="success ms-MessageBar"]',
  spinnerProgressbar: '[role="progressbar"]',
  previewButton: '#commandBar_preview',
  previewScreen: '[class*="animatedCanvasContainerPreview"]',
  addedRecord: '[id*="component"][id*="Title"]',
  deleteConfirmButton: '[data-control-name*="DeleteConfirmBtn"]',
  addPage: '#add-new-page-in-command-bar',
  customPageName: '#custom-page-name',
  appSpinner: '[class*="spinner"]',
};

export class CustomPage {
  readonly page: Page;
  private studioFrame!: FrameLocator;

  constructor(page: Page) {
    this.page = page;
    this.studioFrame = page.frameLocator(SEL.studioFrame);
  }

  async createNewCustomPage(title?: string): Promise<Page> {
    console.log('[CustomPage] Clicking "Add page" in command bar');
    await this.page.locator(SEL.addPage).click();

    console.log('[CustomPage] Selecting "Custom page" option');
    await this.page.getByLabel('Custom page').click();

    console.log('[CustomPage] Clicking "Create custom page" button');
    await this.page.getByRole('button', { name: 'Create custom page' }).click();

    if (title) {
      console.log(`[CustomPage] Setting custom page name: "${title}"`);
      await this.page.locator(SEL.customPageName).clear();
      await this.page.locator(SEL.customPageName).fill(title);
    }

    console.log('[CustomPage] Clicking Create — waiting for new tab to open');
    const [newTab] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.page.getByTestId('Wizard_PrimaryButton').click(),
    ]);
    await this.page.waitForLoadState();

    console.log('[CustomPage] New tab opened, waiting for spinner to disappear');
    await newTab
      .locator(SEL.appSpinner)
      .waitFor({ state: 'hidden', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Attaching to studio iframe');
    this.studioFrame = newTab.frameLocator(SEL.studioFrame);

    console.log('[CustomPage] Waiting for Power Apps logo to hide (studio loading)');
    await this.studioFrame
      .locator(SEL.powerAppsLogo)
      .waitFor({ state: 'hidden', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Waiting for "Start from data" button to appear');
    await this.studioFrame
      .locator(SEL.startFromData)
      .waitFor({ state: 'attached', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Studio is ready');
    return newTab;
  }

  async verifyToAddDataSourceWithData(dataSource: string): Promise<void> {
    console.log('[CustomPage] Clicking "Start from data"');
    await this.studioFrame
      .locator(SEL.startFromData)
      .waitFor({ timeout: TimeOut.OneMinuteTimeOut });
    await this.studioFrame.locator(SEL.startFromData).click();

    // Power Apps Studio v3 replaced the Callout flyout with a "Select a data source"
    // dialog/panel that has a search box. Type the data source name to filter the list.
    console.log('[CustomPage] Waiting for data source search panel to appear');
    const searchInput = this.studioFrame.getByPlaceholder('Search').first();
    await searchInput.waitFor({ state: 'visible', timeout: 30000 });

    console.log(`[CustomPage] Searching for data source: "${dataSource}"`);
    await searchInput.fill(dataSource);
    // Wait for search results to populate (Studio filter is async)
    await this.page.waitForTimeout(3000);

    console.log(`[CustomPage] Waiting for data source option: "${dataSource}"`);
    await this.studioFrame
      .locator(SEL.dataSourceItem(dataSource))
      .first()
      .waitFor({ state: 'attached', timeout: TimeOut.DefaultMaxWaitTime });

    console.log(`[CustomPage] Selecting data source: "${dataSource}"`);
    await this.studioFrame.locator(SEL.dataSourceItem(dataSource)).first().click();

    console.log('[CustomPage] Waiting for spinner to disappear after data source selection');
    await this.studioFrame
      .locator(SEL.spinnerProgressbar)
      .waitFor({ state: 'hidden', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Waiting for success message');
    await this.studioFrame
      .locator(SEL.successMessage)
      .waitFor({ state: 'attached', timeout: TimeOut.DefaultMaxWaitTime });
    console.log('[CustomPage] Data source added successfully');

    await new Promise<void>((resolve) => setTimeout(resolve, TimeOut.DefaultLoopWaitTime));
  }

  async navigateToPreviewScreen(): Promise<void> {
    console.log('[CustomPage] Clicking preview button');
    await this.studioFrame
      .locator(SEL.previewButton)
      .waitFor({ timeout: TimeOut.OneMinuteTimeOut });
    await this.studioFrame.locator(SEL.previewButton).click();

    console.log('[CustomPage] Waiting for preview screen to load');
    await this.studioFrame
      .locator(SEL.previewScreen)
      .waitFor({ state: 'attached', timeout: TimeOut.DefaultMaxWaitTime });
    console.log('[CustomPage] Preview screen is ready');
  }

  async addNewRecordInPreviewMode(accountName: string): Promise<void> {
    console.log('[CustomPage] Clicking "New record"');
    await this.studioFrame.getByTitle('New record').waitFor({ timeout: TimeOut.OneMinuteTimeOut });
    await this.studioFrame.getByTitle('New record').click();

    console.log(`[CustomPage] Filling account name: "${accountName}"`);
    await this.studioFrame.getByLabel('Account Name').fill(accountName);

    console.log('[CustomPage] Saving record');
    await this.studioFrame.getByTitle('Save record').click();

    console.log('[CustomPage] Verifying record is visible');
    await expect(
      this.studioFrame.locator(SEL.addedRecord).getByText(accountName, { exact: true })
    ).toBeVisible({ timeout: 30000 });
    console.log('[CustomPage] Record added successfully');
  }

  async deleteRecordInPreviewMode(accountName: string): Promise<void> {
    console.log('[CustomPage] Selecting record to delete');
    await this.studioFrame
      .locator(SEL.addedRecord)
      .getByText(accountName, { exact: true })
      .first()
      .click();

    console.log('[CustomPage] Clicking Delete');
    await this.studioFrame.getByTitle('Delete').click();

    console.log('[CustomPage] Confirming deletion');
    await this.studioFrame.locator(SEL.deleteConfirmButton).click();

    console.log('[CustomPage] Verifying record is gone');
    await expect(
      this.studioFrame.locator(SEL.addedRecord).getByText(accountName, { exact: true })
    ).toHaveCount(0);
    console.log('[CustomPage] Record deleted successfully');
  }
}
