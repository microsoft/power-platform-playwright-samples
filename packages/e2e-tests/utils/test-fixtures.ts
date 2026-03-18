/**
 * Test Fixtures for Power Platform Tests
 * Provides enhanced test fixtures with automatic certificate authentication setup
 */

import { test as base, Page } from '@playwright/test';
import { addCertAuthRoute } from 'power-platform-playwright-toolkit';
import * as fs from 'fs';
import * as path from 'path';

export interface PowerPlatformFixtures {
  page: Page;
}

/**
 * Enhanced test fixture that automatically enables certificate authentication
 * when certificate credentials are configured
 */
export const test = base.extend<PowerPlatformFixtures>({
  page: async ({ page }, use) => {
    // Check if certificate authentication is configured
    const credentialType = process.env.MS_AUTH_CREDENTIAL_TYPE;
    const certPath = process.env.MS_AUTH_LOCAL_FILE_PATH;

    if (credentialType === 'certificate' && certPath) {
      console.log('[Test Fixture] Setting up certificate authentication...');

      try {
        // Read certificate file
        const pfxBuffer = fs.readFileSync(certPath);
        const certPassword = process.env.MS_AUTH_CERTIFICATE_PASSWORD;
        const authEndpoint =
          process.env.AUTH_ENDPOINT?.replace('https://', '') || 'login.microsoftonline.com';

        // Add certificate authentication route handler
        await addCertAuthRoute(page, {
          pfx: pfxBuffer,
          passphrase: certPassword,
          authEndpoint: authEndpoint,
        });

        console.log('[Test Fixture] ✅ Certificate authentication enabled');
      } catch (error: any) {
        console.error(
          '[Test Fixture] ❌ Failed to enable certificate authentication:',
          error.message
        );
        console.error('[Test Fixture] Tests may fail due to authentication errors');
      }
    }

    // Use the page with certificate auth enabled
    await use(page);
  },
});

export { expect } from '@playwright/test';
