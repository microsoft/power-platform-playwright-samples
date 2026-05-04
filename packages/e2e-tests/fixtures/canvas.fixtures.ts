// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Canvas App fixture for Northwind Orders runtime tests.
 *
 * Launches the Canvas App via AppProvider and waits until the orders gallery is
 * visible — so every test starts with a fully-loaded app, no `waitForTimeout` needed.
 *
 * storageState is declared once in playwright.config.ts for the `canvas-app` project
 * and is NOT repeated here.
 *
 * Usage:
 *   import { test, expect } from '../../../fixtures/canvas.fixtures';
 *
 *   test('gallery loads', async ({ canvasFrame }) => {
 *     const count = await canvasFrame.locator('[data-control-name="Gallery1"] ...').count();
 *     expect(count).toBeGreaterThan(0);
 *   });
 */

import { test as base, FrameLocator } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  buildCanvasAppUrlFromEnv,
} from 'power-platform-playwright-toolkit';

/** Selector for the Canvas player iframe in fullscreen play mode. */
const CANVAS_FRAME = 'iframe[name="fullscreen-app-host"]';

/** Northwind-specific ready signal — gallery item visible means the app has fully loaded. */
const GALLERY_ITEM_READY = '[data-control-name="Gallery1"] [data-control-part="gallery-item"]';

type CanvasFixtures = {
  /** FrameLocator scoped to the Canvas app iframe, ready to use immediately. */
  canvasFrame: FrameLocator;
};

export const test = base.extend<CanvasFixtures>({
  canvasFrame: async ({ page, context }, use) => {
    const appUrl = buildCanvasAppUrlFromEnv();

    const appProvider = new AppProvider(page, context);
    await appProvider.launch({
      app: 'Northwind Orders Canvas',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      skipMakerPortal: true,
      directUrl: appUrl,
    });

    const canvasFrame = page.frameLocator(CANVAS_FRAME);

    // Wait for the gallery to be visible — this is the "app is ready" signal.
    // Replaces the bare waitForTimeout(10000) that was previously in beforeEach.
    await canvasFrame.locator(GALLERY_ITEM_READY).first().waitFor({
      state: 'visible',
      timeout: 60000,
    });

    await use(canvasFrame);
  },
});

export { expect } from '@playwright/test';
