// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, FrameLocator, Page } from '@playwright/test';
import { TimeOut } from 'power-platform-playwright-toolkit';

// CSS selectors kept for internal Power Apps IDs/attributes that have no ARIA equivalent
const SEL = {
  studioFrame: 'iframe[data-test-id="iframe-powerapps-studio"]',
  powerAppsLogo: '[id="spl-powerapps"] [class="spl-powerapps-logo"]',
  startFromData: '#start-from-data-button',
  // The data-source-pane opens as an ms-Callout flyout. Scoping to the Callout container
  // avoids the command-bar search (also type="search" but outside the Callout).
  datasourcePaneSearch: '[class*="ms-Callout-main"] input[type="search"][placeholder="Search"]',
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

    // Canvas Studio may open as a new popup tab OR navigate the current tab depending
    // on the Studio version. Register the popup listener BEFORE clicking so we don't
    // miss the event; fall back to the current page if no popup appears within 20 s.
    // The "Create" button is identified by role — the Wizard_PrimaryButton data-testid
    // is no longer present in current Studio versions.
    console.log('[CustomPage] Clicking Create — Canvas Studio may open as popup or in same tab');
    const popupPromise = this.page.waitForEvent('popup', { timeout: 20_000 }).catch(() => null);
    await this.page.getByRole('button', { name: 'Create' }).click();
    const popup = await popupPromise;
    const studioPage = popup ?? this.page;

    if (popup) {
      console.log('[CustomPage] Canvas Studio opened in new tab');
    } else {
      console.log('[CustomPage] Canvas Studio opened in current tab — waiting for navigation');
      await this.page
        .waitForLoadState('domcontentloaded', { timeout: TimeOut.DefaultMaxWaitTime })
        .catch(() => {});
    }

    console.log('[CustomPage] Waiting for spinner to disappear');
    await studioPage
      .locator(SEL.appSpinner)
      .waitFor({ state: 'hidden', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Attaching to studio iframe');
    this.studioFrame = studioPage.frameLocator(SEL.studioFrame);

    console.log('[CustomPage] Waiting for Power Apps logo to hide (studio loading)');
    await this.studioFrame
      .locator(SEL.powerAppsLogo)
      .waitFor({ state: 'hidden', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Waiting for "Start from data" button to appear');
    await this.studioFrame
      .locator(SEL.startFromData)
      .waitFor({ state: 'attached', timeout: TimeOut.DefaultMaxWaitTime });

    console.log('[CustomPage] Studio is ready');
    return studioPage;
  }

  async verifyToAddDataSourceWithData(dataSource: string): Promise<void> {
    console.log('[CustomPage] Clicking "Start from data"');
    await this.studioFrame
      .locator(SEL.startFromData)
      .waitFor({ timeout: TimeOut.OneMinuteTimeOut });
    await this.studioFrame.locator(SEL.startFromData).click();

    // The "Start from data" button opens a Callout with a Fluent UI v9 search input.
    // type="search" uniquely identifies it vs the tree view's ms-SearchBox (type="text").
    console.log('[CustomPage] Waiting for data source pane search to appear');
    const searchInput = this.studioFrame.locator(SEL.datasourcePaneSearch);
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
