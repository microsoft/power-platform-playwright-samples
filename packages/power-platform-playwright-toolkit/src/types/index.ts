/**
 * Shared Types and Interfaces for Power Apps Page Objects
 * Extracted and enhanced from lib/old
 */

/**
 * Canvas App Control Types
 */
export enum CanvasControlType {
  Button = 'Button',
  TextInput = 'TextInput',
  Label = 'Label',
  Dropdown = 'Dropdown',
  Gallery = 'Gallery',
  Form = 'Form',
  Icon = 'Icon',
  Image = 'Image',
  Checkbox = 'Checkbox',
  Toggle = 'Toggle',
  Slider = 'Slider',
  DatePicker = 'DatePicker',
  Timer = 'Timer',
  HTMLText = 'HTMLText',
  Camera = 'Camera',
  Microphone = 'Microphone',
  BarcodeScanner = 'BarcodeScanner',
  DataTable = 'DataTable',
  Chart = 'Chart',
  Shape = 'Shape',
  ComboBox = 'ComboBox',
}

/**
 * App Launch Mode
 */
export enum AppLaunchMode {
  Play = 'play',
  Edit = 'edit',
  Preview = 'preview',
}

/**
 * App Type
 */
export enum AppType {
  Canvas = 'Canvas',
  ModelDriven = 'Model-driven',
  Portal = 'Portal',
  /** Power Apps Maker Portal (make.powerapps.com) — used for GenUX designer and app management */
  PowerApps = 'PowerApps',
}

/**
 * Power Platform Endpoint URLs
 */
export enum EndPointURL {
  home = '/home',
  apps = '/apps',
  solutions = '/solutions',
  flows = '/flows',
  connectionEndPoint = '/connections',
  tablesEndPoint = '/entities',
  discoverAll = '/discover',
  cards = '/cards',
  chatBot = '/bot/create',
  aiBuilderHub = '/aibuilder/hub',
  websites = '/websites',
}

/**
 * App Player Options
 */
export interface AppPlayerOptions {
  /** Wait for app to be ready (default: true) */
  waitForReady?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Hide Power Apps header (default: false) */
  hideHeader?: boolean;
  /** Source parameter for tracking */
  source?: string;
}

/**
 * Control Locator Options
 */
export interface ControlOptions {
  /** Control name (aria-label or name attribute) */
  name: string;
  /** Control type (Button, TextInput, etc.) */
  type?: CanvasControlType;
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Exact text match (default: false) */
  exact?: boolean;
}

/**
 * Test Assertion Options
 */
export interface AssertionOptions {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Custom assertion message */
  message?: string;
}

/**
 * Navigation Options
 */
export interface NavigationOptions {
  /** URL to navigate to (default: base URL) */
  url?: string;
  /** Wait for navigation to complete (default: true) */
  waitForLoad?: boolean;
  /** Timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Wait for specific URL pattern */
  waitForURL?: string | RegExp;
}

/**
 * Search Options
 */
export interface SearchOptions {
  /** Search query */
  query?: string;
  /** Exact match (default: false) */
  exact?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * App Creation Options
 */
export interface AppCreationOptions {
  /** App name */
  name: string;
  /** App description */
  description?: string;
  /** Environment to create in */
  environment?: string;
  /** Wait for creation to complete (default: true) */
  waitForCreation?: boolean;
  /** Timeout in milliseconds (default: 60000) */
  timeout?: number;
}

/**
 * Wait Options
 */
export interface WaitOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** State to wait for */
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
}
