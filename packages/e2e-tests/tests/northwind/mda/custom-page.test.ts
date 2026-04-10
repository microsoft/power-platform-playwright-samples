// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Custom Page Test for Northwind Model-Driven App
 *
 * Tests creating a custom page in the Power Apps Modern App Designer,
 * adding a data source, and verifying record operations in preview mode.
 *
 * Prerequisites:
 * - Northwind Orders Model-Driven App deployed
 * - Environment variables configured in .env
 * - Authentication completed (npm run auth)
 *
 * Run this test:
 *   npm test -- tests/northwind/mda/custom-page.test.ts
 *   npm test -- tests/northwind/mda/custom-page.test.ts -- --headed
 */

import * as path from 'path';
import { test } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  getStorageStatePath,
} from 'power-platform-playwright-toolkit';
import { CustomPage } from '../../../pages/northwind/CustomPage.page';

// This test opens the app in Edit mode (maker portal), so it needs the standard
// MSAL-token storage state rather than the MDA cert-auth state
test.use({
  storageState: process.env.MS_AUTH_EMAIL
    ? getStorageStatePath(process.env.MS_AUTH_EMAIL)
    : undefined,
});

const POWER_APPS_URL = process.env.POWER_APPS_BASE_URL;
const ENTITY_NAME = 'nwind_orders'; // Northwind Orders entity

// Validate required environment variable
if (!POWER_APPS_URL) {
  throw new Error(
    'POWER_APPS_BASE_URL environment variable is required. ' +
      'Please set it in your .env file. ' +
      'Example: POWER_APPS_BASE_URL=https://make.preview.powerapps.com'
  );
}

test.describe('Custom Page - Northwind App', () => {
  let customPageHelper: CustomPage;

  test.beforeEach(async ({ page, context }) => {
    console.log('\n=== beforeEach: Launching Northwind Orders app in Edit mode ===');
    const appProvider = new AppProvider(page, context);

    await appProvider.launch({
      app: 'Northwind Orders (Model-driven)',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Edit,
      baseUrl: POWER_APPS_URL,
    });
    console.log('App launched, initialising CustomPage helper');

    customPageHelper = new CustomPage(page);
  });

  test('should create and test a custom page with data source', async () => {
    await test.step('Create New Custom Page', async () => {
      await customPageHelper.createNewCustomPage();
    });

    await test.step('Verify to Add Data Source With Data', async () => {
      await customPageHelper.verifyToAddDataSourceWithData('Accounts');
    });

    await test.step('Navigate to Preview Screen', async () => {
      await customPageHelper.navigateToPreviewScreen();
    });

    const accountName = `Test Account ${Date.now()}`;
    await test.step('Add New Record in Preview Mode', async () => {
      await customPageHelper.addNewRecordInPreviewMode(accountName);
    });

    await test.step('Delete New Record in Preview Mode', async () => {
      await customPageHelper.deleteRecordInPreviewMode(accountName);
    });
  });
});
