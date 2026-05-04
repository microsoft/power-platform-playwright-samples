// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model-Driven App fixture for Northwind Orders runtime tests.
 *
 * Launches the MDA via AppProvider using the direct URL set in MODEL_DRIVEN_APP_URL
 * (or BASE_APP_URL) and returns a ready ModelDrivenAppPage instance.
 *
 * storageState is declared once in playwright.config.ts for the `model-driven-app`
 * project and is NOT repeated here.
 *
 * Usage:
 *   import { test, expect } from '../../../fixtures/mda.fixtures';
 *
 *   test('grid loads', async ({ modelDrivenApp }) => {
 *     await modelDrivenApp.navigateToGridView('nwind_orders');
 *     const count = await modelDrivenApp.grid.getRowCount();
 *     expect(count).toBeGreaterThan(0);
 *   });
 */

import { test as base } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  ModelDrivenAppPage,
} from 'power-platform-playwright-toolkit';

type MdaFixtures = {
  /** ModelDrivenAppPage for the Northwind Orders MDA, launched and ready. */
  modelDrivenApp: ModelDrivenAppPage;
};

export const test = base.extend<MdaFixtures>({
  modelDrivenApp: async ({ page, context }, use) => {
    const appUrl = process.env.MODEL_DRIVEN_APP_URL || process.env.BASE_APP_URL;
    if (!appUrl) {
      throw new Error(
        'MODEL_DRIVEN_APP_URL or BASE_APP_URL environment variable is required.\n' +
          'Set it in your .env file:\n' +
          '  MODEL_DRIVEN_APP_URL=https://your-org.crm.dynamics.com/main.aspx?appid=...'
      );
    }

    const appProvider = new AppProvider(page, context);
    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.ModelDriven,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: appUrl,
    });

    await use(appProvider.getModelDrivenAppPage());
  },
});

export { expect } from '@playwright/test';
