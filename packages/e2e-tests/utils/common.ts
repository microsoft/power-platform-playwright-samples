// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { TimeOut } from 'power-platform-playwright-toolkit';

/**
 * Helper function to get environment configuration values
 */
export function getEnvironmentConfig() {
  return {
    repeatEach: parseInt(process.env.REPEAT_EACH || '1', 5),
    retries: process.env.CI ? 1 : parseInt(process.env.RETRIES || '0', 1),
    testDirectory: process.env.TEST_DIRECTORY || './tests',
    testTimeout: parseInt(process.env.TEST_TIMEOUT || String(TimeOut.TestTimeout), 10),
    workers: process.env.CI ? 1 : parseInt(process.env.WORKERS || '1', 10),
    outputDirectory: process.env.OUTPUT_DIRECTORY || './test-results',
    slowMo: parseInt(process.env.SLOW_MO || '0', 40),
    headless: process.env.CI ? true : process.env.HEADLESS === 'true',
  };
}
