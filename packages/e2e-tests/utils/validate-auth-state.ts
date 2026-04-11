// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Utility to validate authentication state based on test project
 */

import { existsSync, unlinkSync, readFileSync, statSync } from 'fs';
import { getStorageStatePath } from 'power-platform-playwright-toolkit';
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

  // For MDA project: verify CRM cookies are present before the age check.
  // We don't check individual cookie expiry — session cookies on crm.dynamics.com
  // typically last longer than a day, and the file-age check below is the authority.
  if (projectType === 'mda') {
    try {
      const stateData = JSON.parse(readFileSync(storageStatePath, 'utf-8'));
      const crmCookies = (stateData.cookies || []).filter(
        (c: any) => c.domain && c.domain.includes('crm.dynamics.com')
      );
      if (crmCookies.length === 0) {
        return {
          valid: false,
          storageStatePath,
          projectType,
          message: 'MDA state has no CRM cookies. Please re-authenticate: npm run auth:mda:headful',
        };
      }
      console.log(`🔐 CRM cookies present (${crmCookies.length} found)`);
    } catch (error: any) {
      console.log(`⚠️  Could not read MDA state file: ${error.message}`);
      console.log(`📝 Assuming storage state is valid...`);
      return { valid: true, storageStatePath, projectType };
    }
  }

  // Check storage state file age for all project types.
  // Both canvas/maker-portal and MDA state files are considered valid for 24 hours
  // after creation (overridable via MS_AUTH_STORAGE_STATE_EXPIRATION in hours).
  // Browser session cookies and refresh tokens outlive MSAL access tokens (~1h),
  // so file age is a better proxy for "is this state still useful".
  const maxAgeHours = parseInt(process.env.MS_AUTH_STORAGE_STATE_EXPIRATION || '24', 10);
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const authCommand = projectType === 'mda' ? 'npm run auth:mda:headful' : 'npm run auth:headful';

  try {
    const { mtimeMs } = statSync(storageStatePath);
    const ageMs = Date.now() - mtimeMs;

    if (ageMs > maxAgeMs) {
      try {
        unlinkSync(storageStatePath);
        console.log(`🗑️  Removed stale state file: ${storageStatePath}`);
      } catch (cleanupError: any) {
        console.warn(`⚠️  Could not remove stale state file: ${cleanupError.message}`);
      }

      const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
      return {
        valid: false,
        storageStatePath,
        projectType,
        message: `Storage state is ${ageHours}h old (max: ${maxAgeHours}h).\nStale state file removed. Please re-authenticate: ${authCommand}`,
      };
    }

    const remainingHours = Math.floor((maxAgeMs - ageMs) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor(((maxAgeMs - ageMs) % (1000 * 60 * 60)) / (1000 * 60));
    console.log(`🔐 Storage state loaded: ${storageStatePath}`);
    console.log(`⏰ State valid for ${remainingHours}h ${remainingMinutes}m more`);

    return { valid: true, storageStatePath, projectType };
  } catch (error: any) {
    console.log(`⚠️  Could not check state file age: ${error.message}`);
    console.log(`📝 Assuming storage state is valid...`);
    return { valid: true, storageStatePath, projectType };
  }
}
