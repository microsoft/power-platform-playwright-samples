// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { test as base, Page, BrowserContext } from '@playwright/test';
import { AppProvider, LaunchAppConfig } from '../core/app-provider';

/**
 * Builds a typed Page Object from the already-launched page and browser context.
 * Called by the fixture after AppProvider.launch() completes.
 */
export type PageObjectBuilder<T> = (page: Page, context: BrowserContext) => Promise<T>;

/**
 * Pairs a launch configuration with a factory that creates the typed Page Object.
 */
export interface FixtureDefinition<T> {
  /** Passed verbatim to AppProvider.launch(). Authentication is handled by playwright.config.ts storageState — do not include auth config here. */
  launchOptions: LaunchAppConfig;
  /** Receives the already-authenticated, already-launched page and returns a ready-to-use POM. */
  build: PageObjectBuilder<T>;
}

type FixtureDefinitions<T extends Record<string, unknown>> = {
  [K in keyof T]: FixtureDefinition<T[K]>;
};

/**
 * Creates a typed Playwright `test` object where each fixture key resolves to a
 * pre-launched, ready-to-use Page Object Model instance.
 *
 * **Authentication** is handled entirely by `playwright.config.ts` via `storageState`
 * declared per project. The fixture receives a pre-authenticated `page` and `context`
 * from Playwright — it only calls `AppProvider.launch()` and invokes the `build` factory.
 *
 * @example
 * ```typescript
 * // fixtures/mda.fixtures.ts
 * import { createPowerAppFixture, AppType, AppLaunchMode } from 'power-platform-playwright-toolkit';
 * import { NorthwindMdaPage } from '../pages/NorthwindMdaPage';
 *
 * export const test = createPowerAppFixture<{ mdaApp: NorthwindMdaPage }>({
 *   mdaApp: {
 *     launchOptions: {
 *       app: 'Northwind Orders',
 *       type: AppType.ModelDriven,
 *       mode: AppLaunchMode.Play,
 *       skipMakerPortal: true,
 *       directUrl: process.env.MODEL_DRIVEN_APP_URL!,
 *     },
 *     build: async (page) => new NorthwindMdaPage(page),
 *   },
 * });
 *
 * export { expect } from '@playwright/test';
 * ```
 *
 * In each test file, import `test` and `expect` from the fixture file instead of
 * `@playwright/test`. The fixture parameter name must match the key in the definitions:
 *
 * ```typescript
 * import { test, expect } from '../fixtures/mda.fixtures';
 *
 * test('should load grid', async ({ mdaApp }) => {
 *   await expect(mdaApp.ordersGrid).toBeVisible();
 * });
 * ```
 */
export function createPowerAppFixture<T extends Record<string, unknown>>(
  definitions: FixtureDefinitions<T>
) {
  // Build the Playwright fixture map dynamically. Each entry is an async fixture
  // function that (1) calls AppProvider.launch() and (2) invokes the build factory,
  // then passes the resulting POM to Playwright's `use()` callback.
  const fixtureMap: Record<string, unknown> = {};

  for (const [key, def] of Object.entries(definitions) as [string, FixtureDefinition<unknown>][]) {
    fixtureMap[key] = async (
      { page, context }: { page: Page; context: BrowserContext },
      use: (value: unknown) => Promise<void>
    ) => {
      const provider = new AppProvider(page, context);
      await provider.launch(def.launchOptions);
      const pom = await def.build(page, context);
      await use(pom);
    };
  }

  // The cast to `any` is required: TypeScript cannot statically verify that the
  // dynamically-built fixture map satisfies base.extend<T>'s generic constraint,
  // even though the runtime structure is correct.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return base.extend<T>(fixtureMap as any);
}
