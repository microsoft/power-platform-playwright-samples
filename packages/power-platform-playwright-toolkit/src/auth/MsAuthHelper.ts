/*!
 * Microsoft Authentication Helper for Power Apps
 * Based on playwright-ms-auth package
 */

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import {
  authenticate,
  loadConfigFromEnv,
  getStorageStatePath as getMsAuthStorageStatePath,
  getAuthBaseDir,
} from 'playwright-ms-auth';

dotenv.config();

/**
 * Microsoft Authentication configuration
 *
 * @remarks
 * This interface extends the playwright-ms-auth configuration with additional
 * MSAL token waiting options specific to Power Platform SPAs.
 */
export interface MsAuthConfig {
  email: string;
  credentialType?: 'password' | 'token' | 'certificate';
  credentialProvider?: 'environment' | 'azure-keyvault' | 'local-file' | 'github-secrets';
  providerConfig?: any; // Provider-specific configuration (required by playwright-ms-auth)
  envVariableName?: string;
  localFilePath?: string;
  certificatePassword?: string;
  headless?: boolean;
  timeout?: number;
  /** Wait for MSAL tokens to be stored in localStorage (default: true) */
  waitForMsalTokens?: boolean;
  /** Timeout for waiting for MSAL tokens in milliseconds (default: 30000) */
  msalTokenTimeout?: number;
}

/**
 * Load MS Auth configuration from environment variables
 *
 * @remarks
 * Reads configuration from environment variables including:
 * - MS_AUTH_EMAIL: Email address
 * - MS_AUTH_CREDENTIAL_TYPE: password, token, or certificate
 * - MS_AUTH_WAIT_FOR_MSAL_TOKENS: Wait for MSAL tokens (default: true)
 * - MS_AUTH_MSAL_TOKEN_TIMEOUT: MSAL token timeout in ms (default: 30000)
 */
export function loadAuthConfig(): MsAuthConfig {
  const config = loadConfigFromEnv() as MsAuthConfig;

  // Read MSAL token configuration from environment variables
  if (process.env.MS_AUTH_WAIT_FOR_MSAL_TOKENS !== undefined) {
    config.waitForMsalTokens = process.env.MS_AUTH_WAIT_FOR_MSAL_TOKENS === 'true';
  }

  if (process.env.MS_AUTH_MSAL_TOKEN_TIMEOUT) {
    config.msalTokenTimeout = parseInt(process.env.MS_AUTH_MSAL_TOKEN_TIMEOUT, 10);
  }

  return config;
}

/**
 * Get the storage state file path for authenticated session
 * Uses playwright-ms-auth's getStorageStatePath function
 */
export function getStorageStatePath(email?: string): string {
  const config = loadConfigFromEnv();
  const userEmail = email || config.email;
  return getMsAuthStorageStatePath(userEmail);
}

/**
 * Check if valid authentication exists
 */
export function hasValidAuth(email?: string): boolean {
  const storagePath = getStorageStatePath(email);
  return fs.existsSync(storagePath);
}

/**
 * Clear saved authentication state
 */
export function clearAuthState(email?: string): void {
  const storagePath = getStorageStatePath(email);

  if (fs.existsSync(storagePath)) {
    fs.unlinkSync(storagePath);
    console.log(`✅ Cleared authentication state: ${storagePath}`);
  } else {
    console.log('ℹ️ No authentication state to clear');
  }

  // Also clear screenshots directory if it exists
  const authBaseDir = getAuthBaseDir();
  const screenshotsDir = `${authBaseDir}/screenshots`;
  if (fs.existsSync(screenshotsDir)) {
    console.log(`📁 Screenshots directory: ${screenshotsDir}`);
  }
}

/**
 * Authenticate to Microsoft using playwright-ms-auth
 *
 * @param url - URL to authenticate to (e.g., Power Apps maker portal)
 * @param headless - Whether to run browser in headless mode
 *
 * @remarks
 * This function uses playwright-ms-auth v0.0.16+ which automatically waits for
 * MSAL tokens to be stored in localStorage before saving the storage state.
 *
 * Configuration options:
 * - MS_AUTH_WAIT_FOR_MSAL_TOKENS: Enable/disable MSAL token waiting (default: true)
 * - MS_AUTH_MSAL_TOKEN_TIMEOUT: Timeout in milliseconds (default: 30000)
 *
 * @example
 * ```typescript
 * // Basic authentication
 * await authenticateToMicrosoft('https://make.powerapps.com/home', false);
 *
 * // With custom MSAL timeout (via environment)
 * process.env.MS_AUTH_MSAL_TOKEN_TIMEOUT = '60000'; // 60 seconds
 * await authenticateToMicrosoft('https://make.powerapps.com/home', true);
 * ```
 */
export async function authenticateToMicrosoft(
  url: string,
  headless: boolean = true
): Promise<void> {
  console.log('🔐 Starting Microsoft authentication...');
  console.log(`🌐 URL: ${url}`);
  console.log(`👁️  Browser mode: ${headless ? 'headless' : 'headful'}`);

  try {
    // Load configuration from environment variables (includes MSAL settings)
    const config = loadAuthConfig();
    config.headless = headless;

    console.log('📧 Email:', config.email);
    console.log('🔑 Credential Type:', config.credentialType || 'password');

    // Log MSAL token configuration if debug mode
    if (process.env.SYSTEM_DEBUG === 'true') {
      console.log('🔧 MSAL Token Waiting:', config.waitForMsalTokens ?? 'true (default)');
      console.log('⏱️  MSAL Token Timeout:', config.msalTokenTimeout ?? '30000 (default)');
    }

    // Perform authentication - saves to ~/.playwright-ms-auth/state-{email}.json
    // Note: playwright-ms-auth v0.0.16+ automatically waits for MSAL tokens
    // Cast to any to handle type differences between versions
    await authenticate(config as any, url);

    const storagePath = getMsAuthStorageStatePath(config.email);
    console.log('✅ Authentication successful!');
    console.log(`📁 Auth state saved to: ${storagePath}`);
  } catch (error: any) {
    console.error('❌ Authentication failed:', error?.message || error);
    throw error;
  }
}

/**
 * Helper to get authentication state for Playwright BrowserContext
 */
export async function getAuthState(): Promise<{ storageState: string }> {
  const config = loadConfigFromEnv();
  const storagePath = getStorageStatePath(config.email);

  if (!fs.existsSync(storagePath)) {
    throw new Error(
      `Authentication state not found at ${storagePath}. ` +
        'Please run authentication first: npm run auth'
    );
  }

  return { storageState: storagePath };
}

/**
 * Validate authentication configuration
 */
export function validateAuthConfig(): void {
  const config = loadConfigFromEnv();
  const credentialType = config.credentialType || 'password';

  const missing: string[] = [];

  // Required for all auth types
  if (!process.env.MS_AUTH_EMAIL) {
    missing.push('MS_AUTH_EMAIL');
  }
  if (!process.env.POWER_APPS_BASE_URL) {
    missing.push('POWER_APPS_BASE_URL');
  }

  // Credential-specific validation
  if (credentialType === 'certificate') {
    if (!process.env.MS_AUTH_LOCAL_FILE_PATH) {
      missing.push('MS_AUTH_LOCAL_FILE_PATH');
    }
    // Certificate password is optional (cert might not be password-protected)
  } else if (credentialType === 'password') {
    if (!process.env.MS_USER_PASSWORD) {
      missing.push('MS_USER_PASSWORD');
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Please check your .env file.'
    );
  }
}
