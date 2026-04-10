// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, FrameLocator, Page } from '@playwright/test';
import { TimeOut } from 'power-platform-playwright-toolkit/dist/utils/config';
import {
  clickSelector,
  clearAndFillTextInput,
  fillTextInput,
  navigateToNewTab,
  waitForSelectorToDisable,
  waitForSelectorToEnable,
  delay,
} from '../../utils/common';

export const canvasAppSelector = {
  studioFrame: 'iframe[data-test-id="iframe-powerapps-studio"]',
  powerAppsLogo: '[id="spl-powerapps"] [class="spl-powerapps-logo"]',
  startFromData: '#start-from-data-button',
  callout: '.ms-Callout-main',
  dataSourceItemList: (option: string) =>
    `[data-item-id*="datasourceItem"] [aria-label="${option}"]`,
  successMessageText: '[class*="success ms-MessageBar"]',
  spinnerProgressbar: '[role="progressbar"]',
  previewButton: '#commandBar_preview',
  previewScreen: '[class*="animatedCanvasContainerPreview"]',
  newRecordButton: '[title="New record"]',
  accountNameInput: 'input[aria-label="Account Name"]',
  saveRecord: '[title="Save record"]',
  addedRecord: '[id*="component"][id*="Title"]',
  deleteRecord: '[title="Delete"]',
  deleteRecordConfirmButton: '[data-control-name*="DeleteConfirmBtn"]',
};

export const modernAppSelector = {
  addPage: '#add-new-page-in-command-bar',
  customPage: '[aria-label="Custom page"]',
  customPageName: '#custom-page-name',
  createButton: '[data-test-id="Wizard_PrimaryButton"]',
  appSpinner: '[class*="spinner"]',
  button: (label: string) => `button:has-text("${label}")`,
};

export enum Buttons {
  CreateCustomPage = 'Create custom page',
}

export class CustomPage {
  readonly page: Page;
  studioFrame!: FrameLocator;

  constructor(page: Page) {
    this.page = page;
    this.studioFrame = this.page.frameLocator(canvasAppSelector.studioFrame);
  }

  /**
   * Create New Custom Page
   * @param title Title
   */
  public async createNewCustomPage(title?: string): Promise<Page> {
    console.log('[CustomPage] Clicking "Add page" in command bar');
    await clickSelector(this.page, modernAppSelector.addPage);

    console.log('[CustomPage] Selecting "Custom page" option');
    await clickSelector(this.page, modernAppSelector.customPage);

    console.log(`[CustomPage] Clicking "${Buttons.CreateCustomPage}" button`);
    await clickSelector(this.page, modernAppSelector.button(Buttons.CreateCustomPage));

    if (title) {
      console.log(`[CustomPage] Setting custom page name: "${title}"`);
      await clearAndFillTextInput(this.page, modernAppSelector.customPageName, title);
    }

    console.log('[CustomPage] Clicking Create — waiting for new tab to open');
    const customPage = await navigateToNewTab(this.page, modernAppSelector.createButton);
    console.log('[CustomPage] New tab opened, waiting for spinner to disappear');
    await waitForSelectorToDisable(customPage, modernAppSelector.appSpinner);

    console.log('[CustomPage] Attaching to studio iframe');
    this.studioFrame = customPage.frameLocator(canvasAppSelector.studioFrame);

    console.log('[CustomPage] Waiting for Power Apps logo to hide (studio loading)');
    await waitForSelectorToDisable(this.studioFrame, canvasAppSelector.powerAppsLogo);

    console.log('[CustomPage] Waiting for "Start from data" button to appear');
    await waitForSelectorToEnable(this.studioFrame, canvasAppSelector.startFromData);

    console.log('[CustomPage] Studio is ready');
    return customPage;
  }

  /**
   * Verify to Add Data Source With Data
   * @param dataSource Data Source Name
   */
  public async verifyToAddDataSourceWithData(dataSource: string) {
    console.log('[CustomPage] Clicking "Start from data"');
    await clickSelector(this.studioFrame, canvasAppSelector.startFromData);

    console.log(`[CustomPage] Waiting for data source option: "${dataSource}"`);
    const callout = this.studioFrame.locator(canvasAppSelector.callout).last();
    await waitForSelectorToEnable(callout, canvasAppSelector.dataSourceItemList(dataSource));

    console.log(`[CustomPage] Selecting data source: "${dataSource}"`);
    await clickSelector(callout, canvasAppSelector.dataSourceItemList(dataSource));

    console.log('[CustomPage] Waiting for spinner to disappear after data source selection');
    await waitForSelectorToDisable(this.studioFrame, canvasAppSelector.spinnerProgressbar);
    await waitForSelectorToDisable(this.studioFrame, canvasAppSelector.spinnerProgressbar);

    console.log('[CustomPage] Waiting for success message');
    await waitForSelectorToEnable(this.studioFrame, canvasAppSelector.successMessageText);
    console.log('[CustomPage] Data source added successfully');

    await delay(TimeOut.DefaultLoopWaitTime);
  }

  /**
   * Navigate To Preview Screen
   */
  public async navigateToPreviewScreen() {
    console.log('[CustomPage] Clicking preview button');
    await clickSelector(this.studioFrame, canvasAppSelector.previewButton);
    console.log('[CustomPage] Waiting for preview screen to load');
    await waitForSelectorToEnable(this.studioFrame, canvasAppSelector.previewScreen);
    console.log('[CustomPage] Preview screen is ready');
  }

  /**
   * Add New Record in Preview Mode
   * @param accountName Account Name
   */
  public async addNewRecordInPreviewMode(accountName: string) {
    console.log('[CustomPage] Clicking "New record"');
    await clickSelector(this.studioFrame, canvasAppSelector.newRecordButton);
    console.log(`[CustomPage] Filling account name: "${accountName}"`);
    await fillTextInput(this.studioFrame, canvasAppSelector.accountNameInput, accountName);
    console.log('[CustomPage] Saving record');
    await clickSelector(this.studioFrame, canvasAppSelector.saveRecord);
    console.log('[CustomPage] Verifying record is visible');
    await expect(
      this.studioFrame
        .locator(canvasAppSelector.addedRecord)
        .getByText(accountName, { exact: true })
    ).toBeVisible({ timeout: 30000 });
    console.log('[CustomPage] Record added successfully');
  }

  /**
   * Delete Record in Preview Mode
   * @param accountName Account name to select and delete
   */
  public async deleteRecordInPreviewMode(accountName: string) {
    console.log('[CustomPage] Selecting record to delete');
    await this.studioFrame
      .locator(canvasAppSelector.addedRecord)
      .getByText(accountName, { exact: true })
      .first()
      .click();
    console.log('[CustomPage] Clicking Delete');
    await clickSelector(this.studioFrame, canvasAppSelector.deleteRecord);
    console.log('[CustomPage] Confirming deletion');
    await clickSelector(this.studioFrame, canvasAppSelector.deleteRecordConfirmButton);
    console.log('[CustomPage] Verifying record is gone');
    await expect(
      this.studioFrame
        .locator(canvasAppSelector.addedRecord)
        .getByText(accountName, { exact: true })
    ).toHaveCount(0);
    console.log('[CustomPage] Record deleted successfully');
  }
}
