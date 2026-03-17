/**
 * Authentication Helper Utilities
 *
 * Utilities for managing authentication state and tokens for Power Platform testing.
 *
 * @module AuthHelpers
 */

import * as fs from 'fs';
import { getStorageStatePath } from '../auth/MsAuthHelper';

/**
 * Storage state structure
 */
export interface StorageState {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

/**
 * Token expiration check result
 */
export interface TokenExpirationCheck {
  /** Whether the token has expired */
  expired: boolean;
  /** Expiration timestamp in seconds (if found) */
  expiresOn?: number;
  /** Token string (if found) */
  token?: string;
}

/**
 * Extract authentication token from storage state
 *
 * Reads the storage state file and extracts the Bearer token.
 * Optionally filters by API URL to get a token with the correct audience.
 *
 * @param storagePath - Optional custom path to storage state file
 * @param apiUrl - Optional API URL to match token audience
 * @returns Bearer token string or undefined if not found
 *
 * @example
 * ```typescript
 * // Get default token
 * const token = getAuthToken();
 *
 * // Get token for specific API
 * const bapToken = getAuthToken(undefined, 'https://api.bap.microsoft.com');
 * ```
 */
export function getAuthToken(storagePath?: string, apiUrl?: string): string | undefined {
  let storageFile = storagePath;

  // If no custom path provided, try playwright-ms-auth location
  if (!storageFile) {
    storageFile = getStorageStatePath();
  }

  if (!storageFile || !fs.existsSync(storageFile)) {
    return undefined;
  }

  try {
    const storageData: StorageState = JSON.parse(fs.readFileSync(storageFile, 'utf-8'));

    // Look for token in localStorage
    for (const origin of storageData.origins || []) {
      for (const item of origin.localStorage || []) {
        // Look for MSAL (Microsoft Authentication Library) tokens
        if (item.name.includes('accesstoken') || item.name.includes('msal')) {
          try {
            const tokenData = JSON.parse(item.value);

            // Check if token matches the requested API URL (audience)
            if (apiUrl && tokenData.resource && !apiUrl.includes(tokenData.resource)) {
              continue;
            }

            // Return the access token
            if (tokenData.secret || tokenData.accessToken) {
              return tokenData.secret || tokenData.accessToken;
            }
          } catch {
            // Not a JSON token, might be a plain token string
            if (item.value && item.value.length > 100) {
              // Tokens are typically long strings
              return item.value;
            }
          }
        }
      }
    }

    // If no token found in localStorage, check cookies for auth tokens
    for (const cookie of storageData.cookies || []) {
      if (cookie.name.includes('token') || cookie.name.includes('auth')) {
        return cookie.value;
      }
    }

    return undefined;
  } catch (error) {
    console.error(`Error reading storage state: ${error}`);
    return undefined;
  }
}

/**
 * Check storage state token expiration
 *
 * Reads the storage state file and checks if authentication tokens have expired.
 *
 * @param storagePath - Optional custom path to storage state file
 * @returns Token expiration check result
 *
 * @example
 * ```typescript
 * const check = checkStorageStateExpiration();
 *
 * if (check.expired) {
 *   console.log('Token expired, please re-authenticate');
 * } else if (check.expiresOn) {
 *   const expiryDate = new Date(check.expiresOn * 1000);
 *   console.log(`Token expires at: ${expiryDate}`);
 * }
 * ```
 */
export function checkStorageStateExpiration(storagePath?: string): TokenExpirationCheck {
  let storageFile = storagePath;

  // If no custom path provided, try playwright-ms-auth location
  if (!storageFile) {
    storageFile = getStorageStatePath();
  }

  if (!storageFile || !fs.existsSync(storageFile)) {
    return { expired: true };
  }

  try {
    const storageData: StorageState = JSON.parse(fs.readFileSync(storageFile, 'utf-8'));
    const currentTime = Math.floor(Date.now() / 1000);
    let earliestExpiration: number | undefined;
    let foundToken: string | undefined;

    // Check localStorage for MSAL tokens with expiration
    for (const origin of storageData.origins || []) {
      for (const item of origin.localStorage || []) {
        if (item.name.includes('accesstoken') || item.name.includes('msal')) {
          try {
            const tokenData = JSON.parse(item.value);

            if (tokenData.expiresOn || tokenData.expires_on) {
              const expiresOn = tokenData.expiresOn || tokenData.expires_on;
              const expirationTime =
                typeof expiresOn === 'string' ? parseInt(expiresOn, 10) : expiresOn;

              if (!earliestExpiration || expirationTime < earliestExpiration) {
                earliestExpiration = expirationTime;
                foundToken = tokenData.secret || tokenData.accessToken;
              }

              // Check if this token is expired
              if (expirationTime < currentTime) {
                return {
                  expired: true,
                  expiresOn: expirationTime,
                  token: tokenData.secret || tokenData.accessToken,
                };
              }
            }
          } catch {
            // Not a valid JSON token, skip
          }
        }
      }
    }

    // Check cookies for expiration
    for (const cookie of storageData.cookies || []) {
      if (cookie.expires && cookie.expires > 0) {
        const expiresSeconds = Math.floor(cookie.expires);

        if (expiresSeconds < currentTime) {
          return { expired: true, expiresOn: expiresSeconds };
        }

        if (!earliestExpiration || expiresSeconds < earliestExpiration) {
          earliestExpiration = expiresSeconds;
        }
      }
    }

    return {
      expired: false,
      expiresOn: earliestExpiration,
      token: foundToken,
    };
  } catch (error) {
    console.error(`Error checking token expiration: ${error}`);
    return { expired: true };
  }
}

/**
 * Validate that required authentication environment variables are set
 *
 * Checks for the presence of required environment variables for authentication.
 * Supports both password and certificate-based authentication.
 *
 * @throws {Error} If required environment variables are missing
 *
 * @example
 * ```typescript
 * try {
 *   checkEnvironmentVariables();
 *   console.log('All required environment variables are set');
 * } catch (error) {
 *   console.error('Missing environment variables:', error.message);
 * }
 * ```
 */
export function checkEnvironmentVariables(): void {
  const credentialType = process.env.MS_AUTH_CREDENTIAL_TYPE || 'password';
  const required: string[] = ['MS_AUTH_EMAIL'];

  // Add credential-specific required variables
  if (credentialType === 'certificate') {
    required.push(
      'MS_AUTH_CREDENTIAL_TYPE',
      'MS_AUTH_CREDENTIAL_PROVIDER',
      'MS_AUTH_LOCAL_FILE_PATH'
    );
  } else {
    // Password authentication
    required.push('MS_USER_PASSWORD');
  }

  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please set these variables in your .env file or environment.'
    );
  }
}
