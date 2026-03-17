/**
 * Configuration utilities for Power Platform testing
 *
 * @packageDocumentation
 */

import {
  getAuthToken as getAuthTokenHelper,
  checkStorageStateExpiration as checkStorageStateExpirationHelper,
  type TokenExpirationCheck,
} from './auth-helpers';

/**
 * Timeout constants (in milliseconds)
 *
 * @example
 * ```typescript
 * import { TimeOut } from '@playwright-power-platform/toolkit';
 *
 * await page.waitForSelector('.my-element', { timeout: TimeOut.DefaultWaitTime });
 * ```
 */
export enum TimeOut {
  /** 5 seconds - Default loop wait time */
  DefaultLoopWaitTime = 5000,
  /** 30 seconds - Default wait time */
  DefaultWaitTime = 30000,
  /** 3 minutes - Default maximum wait time */
  DefaultMaxWaitTime = 180000,
  /** 30 seconds - Default wait time for validation */
  DefaultWaitTimeForValidation = DefaultWaitTime,
  /** 2 seconds - Element wait time */
  ElementWaitTime = 2000,
  /** 5 minutes - Five minutes timeout */
  FiveMinutesTimeout = 300000,
  /** 1 minute - Load timeout */
  LoadTimeOut = 60000,
  /** 1 minute - Navigation timeout */
  NavigationTimeout = LoadTimeOut,
  /** 1 minute - One minute timeout */
  OneMinuteTimeOut = LoadTimeOut,
  /** 5 seconds - Optional element timeout */
  OptionalElementTimeout = DefaultLoopWaitTime,
  /** 30 seconds - Page load timeout */
  PageLoadTimeOut = DefaultWaitTime,
  /** 6 minutes - Test timeout */
  TestTimeout = 360000,
  /** 10 minutes - Maximum test timeout */
  TestTimeoutMax = 600000,
  /** 2 minutes - Two minutes timeout */
  TwoMinutesTimeout = 120000,
  /** 15 minutes - Fifteen minutes timeout */
  FifteenMinutesTimeout = 900000,
}

/**
 * Configuration helper for Power Platform testing
 *
 * @example
 * ```typescript
 * import { ConfigHelper } from '@playwright-power-platform/toolkit';
 *
 * const baseUrl = ConfigHelper.getBaseUrl();
 * const tenantId = ConfigHelper.getTenantId();
 * ```
 */
export class ConfigHelper {
  /**
   * Get base URL for Power Apps
   *
   * @returns Base URL from environment variable or default
   * @default 'https://make.powerapps.com'
   */
  static getBaseUrl(): string {
    return process.env.POWER_APPS_BASE_URL || 'https://make.powerapps.com';
  }

  /**
   * Get Business Application Platform (BAP) API base URL
   * Used for environment, tenant, and settings management
   *
   * @returns BAP API URL from environment variable or default
   * @default 'https://api.bap.microsoft.com'
   */
  static getBapApiUrl(): string {
    return process.env.BAP_API_URL || 'https://api.bap.microsoft.com';
  }

  /**
   * Get canvas designer URL
   *
   * @returns Canvas designer URL from environment variable or default
   * @default 'https://apps.powerapps.com/'
   */
  static getCanvasDesignerUrl(): string {
    return process.env.CANVAS_DESIGNER_URL || 'https://apps.powerapps.com/';
  }

  /**
   * Get Canvas app ID from environment
   */
  static getCanvasAppId(): string | undefined {
    return process.env.CANVAS_APP_ID;
  }

  /**
   * Get Model-Driven app ID from environment
   */
  static getModelAppId(): string | undefined {
    return process.env.MODEL_APP_ID;
  }

  /**
   * Get authentication endpoint
   *
   * @returns Auth endpoint from environment variable or default
   * @default 'https://login.microsoftonline.com'
   */
  static getAuthEndpoint(): string {
    return process.env.AUTH_ENDPOINT || 'https://login.microsoftonline.com';
  }

  /**
   * Get environment ID from environment variable
   *
   * @returns Environment ID or undefined if not set
   */
  static getEnvironmentId(): string | undefined {
    return process.env.POWER_APPS_ENVIRONMENT_ID;
  }

  /**
   * Get tenant ID from environment variable
   *
   * @returns Tenant ID
   * @throws {Error} If AZURE_TENANT_ID is not set
   */
  static getTenantId(): string {
    const tenantId = process.env.AZURE_TENANT_ID;
    if (!tenantId) {
      throw new Error('AZURE_TENANT_ID is not set in environment variables');
    }
    return tenantId;
  }

  /**
   * Extract environment ID from a Power Apps URL
   *
   * @param url - Power Apps URL containing environment ID
   * @returns Environment ID or null if not found
   *
   * @example
   * ```typescript
   * const envId = ConfigHelper.extractEnvironmentId(
   *   'https://make.powerapps.com/environments/abc-123/apps'
   * );
   * // Returns: 'abc-123'
   * ```
   */
  static extractEnvironmentId(url: string): string | null {
    const match = url.match(/\/environments\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Build full URL with optional environment ID
   *
   * @param path - Path to append (e.g., '/apps', '/solutions')
   * @param environmentId - Optional environment ID to include in URL
   * @returns Full URL with environment and path
   *
   * @example
   * ```typescript
   * const url = ConfigHelper.buildUrl('/apps', 'env-123');
   * // Returns: 'https://make.powerapps.com/environments/env-123/apps'
   * ```
   */
  static buildUrl(path: string, environmentId?: string): string {
    const baseUrl = this.getBaseUrl();
    const envId = environmentId || this.getEnvironmentId();

    if (envId && path) {
      return `${baseUrl}/environments/${envId}${path}`;
    }
    return baseUrl + path;
  }

  /**
   * Get authentication token from storage state
   *
   * Retrieves the Bearer token from the stored authentication state.
   * Optionally filters by API URL to get a token with the correct audience.
   *
   * @param storagePath - Optional custom path to storage state file
   * @param apiUrl - Optional API URL to match token audience
   * @returns Bearer token string or undefined if not found
   *
   * @example
   * ```typescript
   * const token = ConfigHelper.getAuthToken();
   * const bapToken = ConfigHelper.getAuthToken(undefined, 'https://api.bap.microsoft.com');
   * ```
   */
  static getAuthToken(storagePath?: string, apiUrl?: string): string | undefined {
    return getAuthTokenHelper(storagePath, apiUrl);
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
   * const check = ConfigHelper.checkStorageStateExpiration();
   *
   * if (check.expired) {
   *   console.log('Token expired, please re-authenticate');
   * }
   * ```
   */
  static checkStorageStateExpiration(storagePath?: string): TokenExpirationCheck {
    return checkStorageStateExpirationHelper(storagePath);
  }

  /**
   * Get default URL path (home page)
   *
   * @returns Default path string
   * @default '/home'
   */
  static getDefaultUrl(): string {
    return '/home';
  }
}
