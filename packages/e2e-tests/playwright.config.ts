// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Playwright Configuration for Power Platform E2E Tests
 */

import * as path from 'path';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { getStorageStatePath, TimeOut, ConfigHelper } from 'power-platform-playwright-toolkit';
import { getEnvironmentConfig } from './utils/common';
import { validateAuthState } from './utils/validate-auth-state';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const playwrightTestRunName = 'Playwright Power Platform E2E Tests';

// Check all required environment variables
// Skip storage state validation in CI, when listing files, or in worker processes
const isMainProcess = !process.env.TEST_WORKER_INDEX && !process.env.PLAYWRIGHT_WORKER;
if (!process.argv.includes('list-files') && !process.env.CI && isMainProcess) {
  try {
    const validationResult = validateAuthState();

    if (!validationResult.valid) {
      console.log('===========================================================');
      console.error(`❌ ${validationResult.message}`);
      console.log('===========================================================');
      process.exit(1);
    }
  } catch (error: any) {
    // In case auth config is incomplete (e.g., missing KeyVault vars in CI), skip validation
    console.log(`⚠️  Skipping storage state validation (auth config incomplete): ${error.message}`);
  }
}

/**
 * Playwright configuration for Power Platform E2E Tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  name: playwrightTestRunName,

  /* Global setup and teardown */
  globalSetup: require.resolve('./globals/global-setup'),
  globalTeardown: require.resolve('./globals/global-teardown'),

  /* Run tests in files in parallel */
  fullyParallel: !process.env.CI,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry configuration */
  repeatEach: getEnvironmentConfig().repeatEach,
  retries: process.env.CI ? 2 : 0,

  /* Test directory and matching */
  testDir: getEnvironmentConfig().testDirectory,
  timeout: getEnvironmentConfig().testTimeout,
  testMatch: ['**/*.+(spec|test|setup).+(ts|js|mjs)'],
  testIgnore: [
    // All tests should run
  ],

  /* Worker configuration */
  workers: getEnvironmentConfig().workers,

  /* Output directory */
  outputDir: path.join(getEnvironmentConfig().outputDirectory, 'artifacts'),

  /* Reporting slow tests */
  reportSlowTests: null,

  /* Expect configuration */
  expect: {
    timeout: TimeOut.DefaultWaitTime,
  },

  /* Reporters */
  reporter: process.env.CI
    ? [
        ['dot'],
        [
          'junit',
          { outputFile: path.join(getEnvironmentConfig().outputDirectory, 'junit-results.xml') },
        ],
      ]
    : [['list'], ['html', { open: 'never' }]],

  /* Shared settings for all projects */
  use: {
    /* Base URL */
    baseURL: ConfigHelper.getBaseUrl(),

    /* Browser options */
    browserName: 'chromium',
    headless: getEnvironmentConfig().headless,
    viewport: { width: 1920, height: 1080 },

    /* Capture options */
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'retain-on-failure',

    /* Timeouts */
    actionTimeout: TimeOut.OneMinuteTimeOut,
    navigationTimeout: TimeOut.OneMinuteTimeOut,

    /* HTTP options */
    ignoreHTTPSErrors: true,
    acceptDownloads: true,

    /* Locale */
    locale: 'en-US',

    /* Permissions */
    permissions: ['clipboard-read', 'clipboard-write'],

    /* Launch options */
    launchOptions: {
      args: ['--start-maximized', '--window-size=1920,1080'],
    },
  },

  /* Projects for different test types */
  projects: [
    {
      name: 'model-driven-app',
      testDir: path.join(getEnvironmentConfig().testDirectory, 'northwind', 'mda'),
      testMatch: '**/*.test.ts',
      use: {
        // Use MDA-specific storage state
        storageState: process.env.MS_AUTH_EMAIL
          ? path.join(
              path.dirname(getStorageStatePath(process.env.MS_AUTH_EMAIL!)),
              `state-mda-${process.env.MS_AUTH_EMAIL}.json`
            )
          : undefined,
      },
    },
    {
      name: 'canvas-app',
      testDir: path.join(getEnvironmentConfig().testDirectory, 'northwind', 'canvas'),
      testMatch: '**/*.test.ts',
      use: {
        storageState: process.env.MS_AUTH_EMAIL
          ? getStorageStatePath(process.env.MS_AUTH_EMAIL!)
          : undefined,
      },
    },
    {
      // Runtime tests for the Canvas custom page embedded inside the MDA.
      // Uses MDA cert-auth state (crm.dynamics.com domain).
      name: 'custom-page',
      testDir: path.join(getEnvironmentConfig().testDirectory, 'northwind', 'custom-page'),
      testMatch: '**/custom-page-crud.test.ts',
      use: {
        storageState: process.env.MS_AUTH_EMAIL
          ? path.join(
              path.dirname(getStorageStatePath(process.env.MS_AUTH_EMAIL!)),
              `state-mda-${process.env.MS_AUTH_EMAIL}.json`
            )
          : undefined,
      },
    },
    {
      // Studio-authoring tests open the app in Edit mode (Maker Portal).
      // They require the standard Canvas/Maker Portal storage state, NOT the MDA cert-auth state.
      // Covers: custom-page.test.ts (creates custom pages in Studio) and gen-ux tests (AI generation).
      name: 'studio-authoring',
      testDir: getEnvironmentConfig().testDirectory,
      testMatch: ['**/custom-page.test.ts', '**/gen-ux/basic-form/*.test.ts'],
      use: {
        storageState: process.env.MS_AUTH_EMAIL
          ? getStorageStatePath(process.env.MS_AUTH_EMAIL!)
          : undefined,
      },
    },
    {
      // Runtime tests for a published Gen UX app.
      // Requires GEN_UX_APP_URL in .env — set it to the play URL of the published app.
      // Depends on studio-authoring so the authoring suite publishes the app first when
      // running the full test suite.
      name: 'gen-ux-runtime',
      testDir: getEnvironmentConfig().testDirectory,
      testMatch: '**/gen-ux/runtime/*.test.ts',
      dependencies: ['studio-authoring'],
      use: {
        storageState: process.env.MS_AUTH_EMAIL
          ? getStorageStatePath(process.env.MS_AUTH_EMAIL!)
          : undefined,
      },
    },
    {
      name: 'default',
      testDir: getEnvironmentConfig().testDirectory,
      testMatch: '**/*.test.ts',
      use: {
        // Use default storage state
        storageState: process.env.MS_AUTH_EMAIL
          ? getStorageStatePath(process.env.MS_AUTH_EMAIL!)
          : undefined,
      },
    },
  ],
});
