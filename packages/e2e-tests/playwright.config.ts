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

/**
 * Helper function to get grep pattern from environment
 */
function getGrepPattern(): RegExp | undefined {
  const grepPattern = process.env.GREP;
  return grepPattern ? new RegExp(grepPattern) : undefined;
}

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
  retries: 0,

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
        ['blob', { outputDir: path.join(getEnvironmentConfig().outputDirectory, 'blob-report') }],
        [
          'junit',
          {
            outputFile: path.join(
              getEnvironmentConfig().outputDirectory,
              'artifacts',
              'testResults',
              `test-results-${process.env.SHARD_INDEX ?? 1}.xml`
            ),
          },
        ],
      ]
    : [
        ['list'],
        [
          'html',
          {
            outputFolder: path.join(getEnvironmentConfig().outputDirectory, 'html-report'),
            open: 'never',
          },
        ],
      ],

  /* Shared settings for all projects */
  use: {
    /* Base URL */
    baseURL: ConfigHelper.getBaseUrl(),

    /* Browser options */
    channel: 'msedge',
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

  /* Test filtering */
  grep: getGrepPattern(),

  /* Projects for different test types */
  projects: [
    {
      name: 'model-driven-app',
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
      name: 'gen-ux',
      testDir: path.join(getEnvironmentConfig().testDirectory, 'gen-ux'),
      testMatch: '**/*.test.ts',
      use: {
        // Use default (canvas/maker portal) storage state
        storageState: process.env.MS_AUTH_EMAIL
          ? getStorageStatePath(process.env.MS_AUTH_EMAIL!)
          : undefined,
      },
    },
    {
      name: 'default',
      testIgnore: ['**/mda/**/*.test.ts', '**/gen-ux/**/*.test.ts'],
      use: {
        // Use default storage state
        storageState: process.env.MS_AUTH_EMAIL
          ? getStorageStatePath(process.env.MS_AUTH_EMAIL!)
          : undefined,
      },
    },
  ],
});
