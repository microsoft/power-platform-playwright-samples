/*!
 * Authentication setup script for Power Apps
 * Run this before tests to authenticate to Microsoft/Power Apps
 *
 * Usage:
 *   npm run auth:headful              # Authenticate to Power Apps maker portal
 *   npm run auth:headful -- --mda     # Authenticate to Model-Driven App (CRM domain)
 */

import {
  authenticateToMicrosoft,
  validateAuthConfig,
  getStorageStatePath,
  addCertAuthRoute,
} from 'power-platform-playwright-toolkit';
import { ConfigHelper } from 'power-platform-playwright-toolkit';
import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Authenticate to Model-Driven App (CRM domain)
 * This creates a separate storage state file with 'mda-' prefix
 */
async function authenticateModelDriven() {
  try {
    console.log('🚀 Model-Driven App Authentication Setup');
    console.log('==========================================\n');

    const email = process.env.MS_AUTH_EMAIL;
    const modelDrivenAppUrl = process.env.MODEL_DRIVEN_APP_URL;

    if (!email) {
      throw new Error('MS_AUTH_EMAIL environment variable is required');
    }

    if (!modelDrivenAppUrl) {
      throw new Error('MODEL_DRIVEN_APP_URL environment variable is required in .env file');
    }

    // Get base storage state path and create MDA-specific path
    const baseStorageStatePath = getStorageStatePath(email);
    const storageStateDir = path.dirname(baseStorageStatePath);
    const mdaStorageStatePath = path.join(storageStateDir, `state-mda-${email}.json`);

    console.log(`📧 Email: ${email}`);
    console.log(`🔗 Model-Driven App URL: ${modelDrivenAppUrl}`);
    console.log(`📁 MDA Storage state: ${mdaStorageStatePath}\n`);

    // First, ensure base authentication exists
    if (!fs.existsSync(baseStorageStatePath)) {
      console.log('⚠️  Base authentication not found!');
      console.log('💡 Running base authentication first...\n');
      await authenticatePowerApps();
    }

    // Check for headful mode
    const headless = !process.argv.includes('--headful');
    console.log(`👁️  Browser mode: ${headless ? 'headless' : 'headful'}\n`);

    // Launch browser with existing auth state
    console.log('🌐 Launching browser with existing authentication...');
    const browser = await chromium.launch({
      headless,
      channel: 'msedge',
    });

    const context = await browser.newContext({
      storageState: baseStorageStatePath,
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Enable certificate authentication if configured
    const credentialType = process.env.MS_AUTH_CREDENTIAL_TYPE;
    const certPath = process.env.MS_AUTH_LOCAL_FILE_PATH;

    if (credentialType === 'certificate' && certPath) {
      console.log('🔐 Enabling certificate authentication...');
      try {
        const pfxBuffer = fs.readFileSync(certPath);
        const certPassword = process.env.MS_AUTH_CERTIFICATE_PASSWORD;
        const authEndpoint =
          process.env.AUTH_ENDPOINT?.replace('https://', '') || 'login.microsoftonline.com';

        await addCertAuthRoute(page, {
          pfx: pfxBuffer,
          passphrase: certPassword,
          authEndpoint: authEndpoint,
        });

        console.log('✅ Certificate authentication enabled\n');
      } catch (error: any) {
        console.error('❌ Failed to enable certificate authentication:', error.message);
        console.error('Authentication may fail without certificate auth\n');
      }
    }

    console.log('🔐 Navigating to Model-Driven App (CRM domain)...');

    // Navigate to Model-Driven App - this will establish CRM session
    await page.goto(modelDrivenAppUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for page to settle
    await page.waitForTimeout(5000);

    // Check if we're on an error page
    const errorElement = await page.locator('text=An error has occurred').count();
    if (errorElement > 0) {
      console.log('\n⚠️  Error page detected!');
      console.log('💡 This might indicate:');
      console.log('   1. Invalid app ID in MODEL_DRIVEN_APP_URL');
      console.log('   2. User does not have access to this app');
      console.log('   3. Entity or environment does not exist');
      console.log('   4. Additional authentication required\n');

      // Take screenshot for debugging
      const screenshotPath = 'model-driven-error.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

      await browser.close();
      process.exit(1);
    }

    console.log('✅ Successfully accessed Model-Driven App!');

    // Save the storage state with CRM cookies
    await context.storageState({ path: mdaStorageStatePath });
    console.log(`💾 MDA storage state saved: ${mdaStorageStatePath}`);

    await browser.close();

    console.log('\n✅ Model-Driven App authentication complete!');
    console.log('💡 You can now run MDA tests with: npm test -- model-driven-direct-url.test.ts');
    return mdaStorageStatePath;
  } catch (error: any) {
    console.error('\n❌ Model-Driven App authentication failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure MODEL_DRIVEN_APP_URL is set in .env');
    console.log('   2. Run base auth first: npm run auth:headful');
    console.log('   3. Verify your user has access to the Model-Driven App');
    console.log('   4. Check the app ID in the URL is correct');
    throw error;
  }
}

/**
 * Authenticate to Power Apps maker portal
 * This is the base authentication
 */
async function authenticatePowerApps() {
  try {
    console.log('🚀 Power Apps Authentication Setup');
    console.log('===================================\n');

    // Validate configuration
    validateAuthConfig();

    // Get URL to authenticate to
    const powerAppsUrl = ConfigHelper.buildUrl(ConfigHelper.getDefaultUrl());

    // Check for headful mode
    const headless = !process.argv.includes('--headful');

    // Perform authentication (now includes MSAL token waiting in playwright-ms-auth v0.0.16+)
    await authenticateToMicrosoft(powerAppsUrl, headless);

    console.log('\n✅ Power Apps authentication complete!');
    console.log('💡 You can now run tests with: npm test');
    return getStorageStatePath(process.env.MS_AUTH_EMAIL!);
  } catch (error) {
    console.error('\n❌ Power Apps authentication failed:', error.message);
    throw error;
  }
}

/**
 * Main authentication function
 */
async function authenticate() {
  try {
    const isMDA = process.argv.includes('--mda');

    if (isMDA) {
      // Authenticate to Model-Driven App (CRM domain)
      await authenticateModelDriven();
    } else {
      // Authenticate to Power Apps maker portal
      await authenticatePowerApps();
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Authentication failed:', error.message);
    console.log('\n📋 Required environment variables:');
    console.log('   - MS_AUTH_EMAIL');
    console.log('   - POWER_APPS_BASE_URL');
    console.log('   - MS_AUTH_CREDENTIAL_TYPE (password or certificate)');
    console.log('');
    console.log('   For password authentication:');
    console.log('   - MS_USER_PASSWORD');
    console.log('');
    console.log('   For certificate authentication:');
    console.log('   - MS_AUTH_CREDENTIAL_PROVIDER (e.g., local-file, azure-keyvault)');
    console.log('   - MS_AUTH_LOCAL_FILE_PATH (path to .pfx certificate)');
    console.log('   - MS_AUTH_CERTIFICATE_PASSWORD (optional, if cert is password-protected)');
    console.log('\n💡 Run with --headful to see the browser:');
    console.log('   npm run auth -- --headful');
    console.log('\n📝 Optional MSAL token configuration:');
    console.log('   - MS_AUTH_WAIT_FOR_MSAL_TOKENS=true (default)');
    console.log('   - MS_AUTH_MSAL_TOKEN_TIMEOUT=30000 (default, in ms)');
    process.exit(1);
  }
}

authenticate();
