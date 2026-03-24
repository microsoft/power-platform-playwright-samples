// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Utility to validate authentication state based on test project
 */

import { existsSync, unlinkSync } from 'fs';
import { getStorageStatePath, ConfigHelper } from 'power-platform-playwright-toolkit';
import * as path from 'path';

export interface AuthValidationResult {
  valid: boolean;
  storageStatePath: string;
  projectType: 'mda' | 'default';
  message?: string;
}

/**
 * Detect which project is being run based on command-line arguments
 */
export function detectProject(): 'mda' | 'default' {
  const args = process.argv.join(' ');

  // Check if running MDA project
  if (
    args.includes('--project=model-driven-app') ||
    args.includes('/mda/') ||
    args.includes('\\mda\\')
  ) {
    return 'mda';
  }

  return 'default';
}

/**
 * Get the appropriate storage state path based on project type
 */
export function getProjectStorageStatePath(email: string, projectType: 'mda' | 'default'): string {
  const baseStorageStatePath = getStorageStatePath(email);

  if (projectType === 'mda') {
    const storageStateDir = path.dirname(baseStorageStatePath);
    return path.join(storageStateDir, `state-mda-${email}.json`);
  }

  return baseStorageStatePath;
}

/**
 * Validate authentication state for the detected project
 */
export function validateAuthState(): AuthValidationResult {
  const email = process.env.MS_AUTH_EMAIL;

  if (!email || email.length === 0) {
    return {
      valid: false,
      storageStatePath: '',
      projectType: 'default',
      message: 'Missing required environment variable: MS_AUTH_EMAIL',
    };
  }

  // Detect which project is being run
  const projectType = detectProject();

  // Get the appropriate storage state path
  const storageStatePath = getProjectStorageStatePath(email, projectType);

  console.log(`🔍 Detected project type: ${projectType}`);
  console.log(`📂 Checking storage state: ${storageStatePath}`);

  // Check if storage state file exists
  if (!existsSync(storageStatePath)) {
    const authCommand = projectType === 'mda' ? 'npm run auth:mda:headful' : 'npm run auth:headful';

    return {
      valid: false,
      storageStatePath,
      projectType,
      message: `Storage state file does not exist!\nPlease run authentication first: ${authCommand}`,
    };
  }

  // Check if storage state has expired
  try {
    const expirationCheck = ConfigHelper.checkStorageStateExpiration(storageStatePath);

    if (expirationCheck.expired) {
      const authCommand =
        projectType === 'mda' ? 'npm run auth:mda:headful' : 'npm run auth:headful';

      // Remove stale state file so re-auth creates a clean one
      try {
        unlinkSync(storageStatePath);
        console.log(`🗑️  Removed expired state file: ${storageStatePath}`);
      } catch (cleanupError: any) {
        console.warn(`⚠️  Could not remove expired state file: ${cleanupError.message}`);
      }

      let message = 'Authentication tokens have expired!';
      if (expirationCheck.expiresOn) {
        const expiryDate = new Date(expirationCheck.expiresOn * 1000);
        message += `\nToken expired at: ${expiryDate.toLocaleString()}`;
      }
      message += `\nStale state file removed. Please re-authenticate: ${authCommand}`;

      return {
        valid: false,
        storageStatePath,
        projectType,
        message,
      };
    }

    // Log success info
    console.log(`🔐 Storage state loaded: ${storageStatePath}`);

    if (expirationCheck.expiresOn) {
      const expiryDate = new Date(expirationCheck.expiresOn * 1000);
      const timeUntilExpiry = Math.floor((expirationCheck.expiresOn - Date.now() / 1000) / 60);
      console.log(
        `⏰ Token expires: ${expiryDate.toLocaleString()} (in ${timeUntilExpiry} minutes)`
      );
    }

    return {
      valid: true,
      storageStatePath,
      projectType,
    };
  } catch (error: any) {
    // If expiration check fails (e.g., missing fields), assume valid
    // This can happen with certificate-based auth that doesn't store expiration
    console.log(`⚠️  Could not check token expiration: ${error.message}`);
    console.log(`📝 Assuming storage state is valid...`);

    return {
      valid: true,
      storageStatePath,
      projectType,
    };
  }
}
