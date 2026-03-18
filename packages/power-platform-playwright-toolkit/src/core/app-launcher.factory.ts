/**
 * App Launcher Factory
 * Creates appropriate app launcher based on app type
 * Follows Factory Design Pattern for extensibility
 */

import { Page } from '@playwright/test';
import { IAppLauncher } from './app-launcher.interface';
import { AppType } from '../types';
import { CanvasAppPage } from '../pages/canvas-app.page';
import { ModelDrivenAppPage } from '../pages/model-driven-app.page';
import { PowerAppsLauncher } from './power-apps-launcher';

/**
 * Factory class to create app launchers
 * Supports Canvas Apps, Model Driven Apps, and extensible for future app types
 */
export class AppLauncherFactory {
  private static launcherInstances: Map<string, IAppLauncher> = new Map();

  /**
   * Create an app launcher for the specified app type
   * Returns a singleton instance for each page-appType combination
   * @param page - Playwright page
   * @param appType - Type of app to launch
   * @returns App launcher instance
   */
  static createLauncher(page: Page, appType: AppType): IAppLauncher {
    // Create unique key for caching
    const cacheKey = `${appType}-${this.getPageId(page)}`;

    // Return cached instance if exists
    if (this.launcherInstances.has(cacheKey)) {
      return this.launcherInstances.get(cacheKey)!;
    }

    // Create new instance based on app type
    let launcher: IAppLauncher;

    switch (appType) {
      case AppType.Canvas:
        launcher = new CanvasAppPage(page) as unknown as IAppLauncher;
        break;

      case AppType.ModelDriven:
        launcher = new ModelDrivenAppPage(page) as unknown as IAppLauncher;
        break;

      case AppType.PowerApps:
        launcher = new PowerAppsLauncher(page) as unknown as IAppLauncher;
        break;

      case AppType.Portal:
        throw new Error('Portal app launcher not yet implemented. Coming soon!');

      default:
        throw new Error(`Unsupported app type: ${appType}`);
    }

    // Cache the instance
    this.launcherInstances.set(cacheKey, launcher);

    return launcher;
  }

  /**
   * Get launcher for Canvas Apps
   * @param page - Playwright page
   * @returns Canvas app launcher
   */
  static getCanvasLauncher(page: Page): IAppLauncher {
    return this.createLauncher(page, AppType.Canvas);
  }

  /**
   * Get launcher for Model Driven Apps
   * @param page - Playwright page
   * @returns Model driven app launcher
   */
  static getModelDrivenLauncher(page: Page): IAppLauncher {
    return this.createLauncher(page, AppType.ModelDriven);
  }

  /**
   * Clear all cached launcher instances
   * Use this when you need to reset state between tests
   */
  static clearCache(): void {
    this.launcherInstances.clear();
  }

  /**
   * Clear launcher cache for a specific page
   * @param page - Playwright page
   */
  static clearCacheForPage(page: Page): void {
    const pageId = this.getPageId(page);
    const keysToDelete: string[] = [];

    this.launcherInstances.forEach((_, key) => {
      if (key.endsWith(`-${pageId}`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.launcherInstances.delete(key));
  }

  /**
   * Get a unique identifier for a page
   * @param page - Playwright page
   * @returns Unique page identifier
   */
  private static getPageId(page: Page): string {
    // Use page URL or a unique identifier
    return page.url() || `page-${Date.now()}`;
  }

  /**
   * Check if a launcher exists for the given page and app type
   * @param page - Playwright page
   * @param appType - Type of app
   * @returns true if launcher exists in cache
   */
  static hasLauncher(page: Page, appType: AppType): boolean {
    const cacheKey = `${appType}-${this.getPageId(page)}`;
    return this.launcherInstances.has(cacheKey);
  }
}
