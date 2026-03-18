/**
 * Power Platform Apps Testing Library
 * Independent library for Canvas and Model Driven app testing
 * Enhanced with production-tested components from legacy library
 *
 * @packageDocumentation
 */

// Export Core Infrastructure (Factory & Provider patterns)
export { IAppLauncher, AppMetadata } from './core/app-launcher.interface';
export { AppLauncherFactory } from './core/app-launcher.factory';
export { AppProvider, LaunchAppConfig } from './core/app-provider';
export { URLBuilder } from './core/url-builder';
export {
  PowerPlatformNavigator,
  NavigatorOptions,
  NavigationOptions,
} from './core/power-platform-navigator';
export * from './core/page-waiters';

// Export Page Object Models
export { PowerAppsPage } from './pages/power-apps.page';
export { CanvasAppPage } from './pages/canvas-app.page';
export { ModelDrivenAppPage } from './pages/model-driven-app.page';

// Export Base Locators (from legacy library integration)
export { BaseLocators, LocatorUtils } from './locators/base.locators';

// Export Power Apps Page Locators (from legacy library integration)
export { PowerAppsPageLocators, PowerAppsPageSelectors } from './locators/power-apps.locators';

// Export Canvas & Model Driven Locators
export {
  CanvasAppLocators,
  getCanvasDataTestId,
  getCanvasControlByName,
  getCanvasScreenByName,
} from './locators/canvas-app.locators';
export {
  ModelDrivenAppLocators,
  getModelDrivenDataAutomationId,
  getModelDrivenTablePage,
  getModelDrivenFormField,
  getModelDrivenNavItem,
} from './locators/model-driven-app.locators';

// Export Types and Interfaces (from legacy library integration)
export * from './types';

// Export Utilities
export * from './utils';

// Export Authentication
export * from './auth';

// Export Model-Driven Components
export * from './components/model-driven';

// Export GenUX Components
export * from './components/gen-ux';
