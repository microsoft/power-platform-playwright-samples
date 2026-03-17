/**
 * URLBuilder
 * Centralizes URL construction for Power Platform maker portal pages
 * Handles environment ID injection and path building
 */

import { ConfigHelper } from '../utils/config';
import { EndPointURL } from '../types';

/**
 * Builds URLs for Power Platform maker portal pages
 * Automatically includes environment ID when available
 *
 * @example
 * ```typescript
 * const builder = new URLBuilder();
 * const appsUrl = builder.buildAppsPageUrl();
 * // Result: https://make.powerapps.com/environments/{envId}/apps
 * ```
 */
export class URLBuilder {
  private baseUrl: string;
  private environmentId?: string;

  /**
   * Creates a new URLBuilder instance
   * @param baseUrl - Base URL for Power Apps maker portal (defaults to ConfigHelper.getBaseUrl())
   * @param environmentId - Environment ID to include in URLs (defaults to ConfigHelper.getEnvironmentId())
   */
  constructor(baseUrl?: string, environmentId?: string) {
    this.baseUrl = baseUrl || ConfigHelper.getBaseUrl();
    this.environmentId = environmentId || ConfigHelper.getEnvironmentId();
  }

  /**
   * Build URL for Apps page
   * @returns URL for the Apps page
   * @example
   * ```typescript
   * const url = builder.buildAppsPageUrl();
   * // https://make.powerapps.com/environments/{envId}/apps
   * ```
   */
  buildAppsPageUrl(): string {
    return this.buildUrl(EndPointURL.apps);
  }

  /**
   * Build URL for Solutions page
   * @returns URL for the Solutions page
   * @example
   * ```typescript
   * const url = builder.buildSolutionsPageUrl();
   * // https://make.powerapps.com/environments/{envId}/solutions
   * ```
   */
  buildSolutionsPageUrl(): string {
    return this.buildUrl(EndPointURL.solutions);
  }

  /**
   * Build URL for Home page
   * @returns URL for the Home page
   * @example
   * ```typescript
   * const url = builder.buildHomePageUrl();
   * // https://make.powerapps.com/environments/{envId}/home
   * ```
   */
  buildHomePageUrl(): string {
    if (this.environmentId) {
      return `${this.baseUrl}/environments/${this.environmentId}/home`;
    }
    return this.baseUrl;
  }

  /**
   * Build URL for Flows page
   * @returns URL for the Flows page
   */
  buildFlowsPageUrl(): string {
    return this.buildUrl(EndPointURL.flows);
  }

  /**
   * Build URL for Tables page
   * @returns URL for the Tables page
   */
  buildTablesPageUrl(): string {
    return this.buildUrl(EndPointURL.tablesEndPoint);
  }

  /**
   * Build URL for Connections page
   * @returns URL for the Connections page
   */
  buildConnectionsPageUrl(): string {
    return this.buildUrl(EndPointURL.connectionEndPoint);
  }

  /**
   * Generic URL builder using EndPointURL enum paths
   * @param path - Path from EndPointURL enum
   * @returns Complete URL with environment ID if available
   */
  private buildUrl(path: string): string {
    if (this.environmentId && path) {
      return `${this.baseUrl}/environments/${this.environmentId}${path}`;
    }
    return `${this.baseUrl}${path}`;
  }

  /**
   * Set or update the environment ID
   * @param environmentId - New environment ID
   * @example
   * ```typescript
   * builder.setEnvironment('env-123');
   * const url = builder.buildAppsPageUrl(); // Will include env-123
   * ```
   */
  setEnvironment(environmentId: string): void {
    this.environmentId = environmentId;
  }

  /**
   * Get current base URL
   * @returns Current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get current environment ID
   * @returns Current environment ID or undefined
   */
  getEnvironmentId(): string | undefined {
    return this.environmentId;
  }
}
