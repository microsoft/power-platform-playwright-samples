/**
 * Core Infrastructure Exports
 * Factory and Provider patterns for launching Power Platform apps
 */

// App Launcher Interface
export { IAppLauncher, AppMetadata } from './app-launcher.interface';

// App Launcher Factory
export { AppLauncherFactory } from './app-launcher.factory';

// App Provider
export { AppProvider, LaunchAppConfig } from './app-provider';

// URL Builder
export { URLBuilder } from './url-builder';

// Power Platform Navigator
export {
  PowerPlatformNavigator,
  NavigatorOptions,
  NavigationOptions,
} from './power-platform-navigator';

// Page Waiters
export * from './page-waiters';
