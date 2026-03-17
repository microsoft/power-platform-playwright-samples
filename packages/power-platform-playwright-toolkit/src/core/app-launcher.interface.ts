/**
 * App Launcher Interface
 * Defines common contract for launching and interacting with Power Platform apps
 * Supports Canvas Apps, Model Driven Apps, Portal Apps, and future app types
 */

import { Locator } from '@playwright/test';
import { AppLaunchMode, AppPlayerOptions, ControlOptions, AssertionOptions } from '../types';

/**
 * Base interface that all app launchers must implement
 * Provides a consistent API for launching and testing any Power Platform app type
 */
export interface IAppLauncher {
  /**
   * The app type this launcher handles
   */
  readonly appType: string;

  /**
   * Launch app by name
   * Finds the app in the apps list and launches it
   * @param appName - Name of the app to launch
   * @param findAppCallback - Callback to find the app in the apps list
   * @param mode - Launch mode (play, edit, preview)
   * @param options - Additional launch options
   */
  launchByName(
    appName: string,
    findAppCallback: (appName: string) => Promise<Locator>,
    mode: AppLaunchMode,
    options?: AppPlayerOptions
  ): Promise<void>;

  /**
   * Launch app by ID
   * Directly navigates to the app using its ID
   * @param appId - ID of the app to launch
   * @param baseUrl - Base URL for the environment
   * @param mode - Launch mode (play, edit, preview)
   * @param options - Additional launch options
   */
  launchById(
    appId: string,
    baseUrl: string,
    mode: AppLaunchMode,
    options?: AppPlayerOptions
  ): Promise<void>;

  /**
   * Wait for app to fully load
   * @param options - Wait options
   */
  waitForAppLoad(options?: AppPlayerOptions): Promise<void>;

  /**
   * Check if app is ready for interaction
   * @returns true if app is ready
   */
  isAppReady(): boolean;

  /**
   * Get the current app ID
   * @returns App ID or null if not set
   */
  getAppId(): string | null;

  /**
   * Get the current app URL
   * @returns App URL or null if not set
   */
  getAppUrl(): string | null;

  /**
   * Get a control by name and type
   * @param options - Control options
   * @returns Locator for the control
   */
  getControl(options: ControlOptions): Locator;

  /**
   * Click a control
   * @param options - Control options
   */
  clickControl(options: ControlOptions): Promise<void>;

  /**
   * Fill a text input control
   * @param options - Control options
   * @param value - Value to fill
   */
  fillControl(options: ControlOptions, value: string): Promise<void>;

  /**
   * Fill a form with multiple fields
   * @param formData - Key-value pairs of field names and values
   */
  fillForm(formData: Record<string, string>): Promise<void>;

  /**
   * Assert control is visible
   * @param options - Control options
   * @param assertOptions - Assertion options
   */
  assertControlVisible(options: ControlOptions, assertOptions?: AssertionOptions): Promise<void>;

  /**
   * Assert control text matches
   * @param options - Control options
   * @param expectedText - Expected text
   * @param assertOptions - Assertion options
   */
  assertControlText(
    options: ControlOptions,
    expectedText: string,
    assertOptions?: AssertionOptions
  ): Promise<void>;

  /**
   * Close the app
   */
  closeApp(): Promise<void>;

  /**
   * Reset the launcher state
   * Clears app ID, URL, and ready state
   */
  reset(): void;
}

/**
 * App metadata returned by the provider
 */
export interface AppMetadata {
  id: string;
  name: string;
  type: string;
  url: string | null;
  isReady: boolean;
  launchedAt: Date;
}
