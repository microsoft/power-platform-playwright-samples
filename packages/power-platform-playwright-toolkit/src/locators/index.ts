/**
 * Locators Index
 * Export all locator modules
 */

// Base Locators (from legacy library integration)
export { BaseLocators, LocatorUtils } from './base.locators';

// Power Apps Page Locators (from legacy library integration)
export { PowerAppsPageLocators, PowerAppsPageSelectors } from './power-apps.locators';

// Canvas App Locators
export {
  CanvasAppLocators,
  getCanvasDataTestId,
  getCanvasControlByName,
  getCanvasScreenByName,
} from './canvas-app.locators';

// Model Driven App Locators
export {
  ModelDrivenAppLocators,
  getModelDrivenDataAutomationId,
  getModelDrivenTablePage,
  getModelDrivenFormField,
  getModelDrivenNavItem,
} from './model-driven-app.locators';
