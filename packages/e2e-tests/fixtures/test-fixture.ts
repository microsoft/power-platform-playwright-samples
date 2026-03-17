/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 */

import { test as base } from '@playwright/test';
import { PowerAppsPage, ConfigHelper } from 'power-platform-playwright-toolkit';

/**
 * Environment types for test filtering
 */
export enum Environment {
  LOCAL = 'local',
  DEV = 'dev',
  TEST = 'test',
  PREVIEW = 'preview',
  STAGING = 'staging',
  PROD = 'prod',
  USSEC = 'ussec',
  USNAT = 'usnat',
}

/**
 * Geography types for test filtering
 */
export enum Geography {
  US = 'us',
  EUROPE = 'europe',
  ASIA = 'asia',
  CHINA = 'china',
  AUSTRALIA = 'australia',
  CANADA = 'canada',
  UK = 'uk',
  BRAZIL = 'brazil',
  INDIA = 'india',
  UNITEDARABEMIRATES = 'unitedarabemirates',
  GCC = 'gcc',
  GCCH = 'gcch',
  DOD = 'dod',
  USSEC = 'ussec',
  USNAT = 'usnat',
}

/**
 * Base URL configuration mapping
 */
const BASE_URL_MAP: Record<string, string | Record<string, string>> = {
  dev: 'https://make.local.powerapps.com',
  test: 'https://make.test.powerapps.com',
  preview: 'https://make.preview.powerapps.com',
  ussec: 'https://make.powerapps.microsoft.scloud',
  usnat: 'https://make.powerapps.eaglex.ic.gov',
  prod: {
    asia: 'https://make.powerapps.com',
    australia: 'https://make.powerapps.com',
    brazil: 'https://make.powerapps.com',
    europe: 'https://make.powerapps.com',
    india: 'https://make.powerapps.com',
    unitedarabemirates: 'https://make.powerapps.com',
    us: 'https://make.powerapps.com',
    china: 'https://make.powerapps.cn',
    gcc: 'https://make.gov.powerapps.us',
    gcch: 'https://make.high.powerapps.us',
    dod: 'https://make.apps.appsplatform.us',
  },
};

/**
 * Build pipeline types for test filtering
 */
export enum BuildPipeline {
  LOCAL = 'local',
  PR = 'pr',
  CI = 'ci',
  NIGHTLY = 'nightly',
  SMOKE = 'smoke',
  REGRESSION = 'regression',
  PERFORMANCE = 'performance',
}

/**
 * Test priority levels
 */
export enum Priority {
  P0 = 'p0', // Critical - must pass
  P1 = 'p1', // High priority
  P2 = 'p2', // Medium priority
  P3 = 'p3', // Low priority
}

/**
 * Test categories for organization
 */
export enum TestCategory {
  UI = 'ui',
  API = 'api',
  ACCESSIBILITY = 'accessibility',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  SMOKE = 'smoke',
  REGRESSION = 'regression',
}

/**
 * Annotation interface for test metadata
 */
interface Annotation {
  type: string;
  description?: string;
}

/**
 * Base options for all tests
 */
export type BaseTestOptions = {
  owner: string;
  environment: Environment | Environment[];
  geography: Geography | Geography[];
  buildPipeline: BuildPipeline | BuildPipeline[];
  priority: Priority;
  category: TestCategory;
};

/**
 * Extended fixtures with page objects and helpers
 */
export type ExtendedFixtures = {
  powerAppsPage: PowerAppsPage;
  config: typeof ConfigHelper;
  baseUrl: string;
};

/**
 * Combined test options with fixtures
 */
export type TestOptions = BaseTestOptions & ExtendedFixtures;

/**
 * Environment variables for test filtering
 */
const CURRENT_ENV = (process.env.TEST_ENV || Environment.TEST) as Environment;
const CURRENT_GEO = (process.env.TEST_GEO || Geography.US) as Geography;
const CURRENT_PIPELINE = (process.env.BUILD_PIPELINE || BuildPipeline.LOCAL) as BuildPipeline;

/**
 * Helper function to check if value matches current setting
 */
function matchesEnvironment(testEnv: Environment | Environment[]): boolean {
  if (Array.isArray(testEnv)) {
    return testEnv.includes(CURRENT_ENV);
  }
  return testEnv === CURRENT_ENV;
}

function matchesGeography(testGeo: Geography | Geography[]): boolean {
  if (Array.isArray(testGeo)) {
    return testGeo.includes(CURRENT_GEO);
  }
  return testGeo === CURRENT_GEO;
}

function matchesPipeline(testPipeline: BuildPipeline | BuildPipeline[]): boolean {
  if (Array.isArray(testPipeline)) {
    return testPipeline.includes(CURRENT_PIPELINE);
  }
  return testPipeline === CURRENT_PIPELINE;
}

/**
 * Base test with options - extends Playwright's base test
 */
export const testWithOptions = base.extend<BaseTestOptions>({
  owner: ['unassigned', { option: true }],
  environment: [[CURRENT_ENV], { option: true }],
  geography: [[CURRENT_GEO], { option: true }],
  buildPipeline: [[CURRENT_PIPELINE], { option: true }],
  priority: [Priority.P2, { option: true }],
  category: [TestCategory.UI, { option: true }],
});

/**
 * Base test with fixtures (without filtering)
 */
const baseTest = testWithOptions.extend<ExtendedFixtures>({
  // PowerAppsPage fixture - automatically initialized
  powerAppsPage: async ({ page }, use) => {
    const powerAppsPage = new PowerAppsPage(page);
    await use(powerAppsPage);
  },

  // ConfigHelper fixture - provides static class
  config: async ({}, use) => {
    await use(ConfigHelper);
  },

  // Base URL fixture - dynamically computed based on environment and geography
  baseUrl: async ({ environment, geography }, use) => {
    const env = Array.isArray(environment) ? environment[0] : environment;
    const geo = Array.isArray(geography) ? geography[0] : geography;
    const url = getBaseUrl(env, geo);
    await use(url);
  },

  // Auto-set annotations (without skip logic)
  owner: async ({ owner }, use, testInfo) => {
    setAnnotation(testInfo, 'owner', owner);
    await use(owner);
  },

  environment: async ({ environment }, use, testInfo) => {
    const envArray = Array.isArray(environment) ? environment : [environment];
    setAnnotation(testInfo, 'environment', envArray.join(', '));
    await use(environment);
  },

  geography: async ({ geography }, use, testInfo) => {
    const geoArray = Array.isArray(geography) ? geography : [geography];
    setAnnotation(testInfo, 'geography', geoArray.join(', '));
    await use(geography);
  },

  buildPipeline: async ({ buildPipeline }, use, testInfo) => {
    const pipelineArray = Array.isArray(buildPipeline) ? buildPipeline : [buildPipeline];
    setAnnotation(testInfo, 'buildPipeline', pipelineArray.join(', '));
    await use(buildPipeline);
  },

  priority: async ({ priority }, use, testInfo) => {
    setAnnotation(testInfo, 'priority', priority);
    await use(priority);
  },

  category: async ({ category }, use, testInfo) => {
    setAnnotation(testInfo, 'category', category);
    await use(category);
  },
});

/**
 * Custom test function with filtering at registration time
 * Tests that don't match current environment/geography/pipeline are not registered
 */
type TestFunction = Parameters<typeof baseTest>[1];
type TestConfig = Partial<BaseTestOptions>;

export function test(title: string, testFn: TestFunction): void;
export function test(config: TestConfig, title: string, testFn: TestFunction): void;
export function test(
  configOrTitle: TestConfig | string,
  titleOrFn: string | TestFunction,
  maybeFn?: TestFunction
): void {
  let config: TestConfig;
  let title: string;
  let testFn: TestFunction;

  // Parse overload arguments
  if (typeof configOrTitle === 'string') {
    // test(title, testFn)
    config = {};
    title = configOrTitle;
    testFn = titleOrFn as TestFunction;
  } else {
    // test(config, title, testFn)
    config = configOrTitle;
    title = titleOrFn as string;
    testFn = maybeFn as TestFunction;
  }

  // Apply defaults
  const testConfig: Required<BaseTestOptions> = {
    owner: config.owner || 'unassigned',
    environment: config.environment || [CURRENT_ENV],
    geography: config.geography || [CURRENT_GEO],
    buildPipeline: config.buildPipeline || [CURRENT_PIPELINE],
    priority: config.priority || Priority.P2,
    category: config.category || TestCategory.UI,
  };

  // Check if test should run in current environment/geography/pipeline
  const shouldRun =
    matchesEnvironment(testConfig.environment) &&
    matchesGeography(testConfig.geography) &&
    matchesPipeline(testConfig.buildPipeline);

  if (!shouldRun) {
    // Don't register test if it doesn't match current environment
    return;
  }

  // Register test with baseTest using configuration
  baseTest.use({
    owner: testConfig.owner,
    environment: testConfig.environment,
    geography: testConfig.geography,
    buildPipeline: testConfig.buildPipeline,
    priority: testConfig.priority,
    category: testConfig.category,
  });

  baseTest(title, testFn as any);
}

// Add test.describe, test.beforeEach, test.afterEach, etc.
test.describe = baseTest.describe;
test.beforeEach = baseTest.beforeEach;
test.afterEach = baseTest.afterEach;
test.beforeAll = baseTest.beforeAll;
test.afterAll = baseTest.afterAll;
test.use = baseTest.use;
test.skip = baseTest.skip;
test.only = baseTest.only;
test.fixme = baseTest.fixme;
test.fail = baseTest.fail;
test.slow = baseTest.slow;
test.setTimeout = baseTest.setTimeout;
test.step = baseTest.step;

/**
 * Helper function to set annotations
 */
function setAnnotation(testInfo: any, type: string, value: string) {
  const existing = testInfo.annotations.find((a: Annotation) => a.type === type);
  if (existing) {
    existing.description = value;
  } else {
    testInfo.annotations.push({ type, description: value });
  }
}

/**
 * Export expect from Playwright
 */
export { expect } from '@playwright/test';

/**
 * Helper to log test metadata at start
 */
export function logTestMetadata(
  testInfo: any,
  options?: {
    owner?: string;
    environment?: Environment | Environment[];
    geography?: Geography | Geography[];
    buildPipeline?: BuildPipeline | BuildPipeline[];
    priority?: Priority;
    category?: TestCategory;
  }
) {
  console.log(`Test: ${testInfo.title}`);
  if (options?.owner) console.log(`  Owner: ${options.owner}`);
  if (options?.environment) {
    const envStr = Array.isArray(options.environment)
      ? options.environment.join(', ')
      : options.environment;
    console.log(`  Environment: ${envStr}`);
  }
  if (options?.geography) {
    const geoStr = Array.isArray(options.geography)
      ? options.geography.join(', ')
      : options.geography;
    console.log(`  Geography: ${geoStr}`);
  }
  if (options?.buildPipeline) {
    const pipelineStr = Array.isArray(options.buildPipeline)
      ? options.buildPipeline.join(', ')
      : options.buildPipeline;
    console.log(`  Pipeline: ${pipelineStr}`);
  }
  if (options?.priority) console.log(`  Priority: ${options.priority}`);
  if (options?.category) console.log(`  Category: ${options.category}`);
}

/**
 * Get current environment/geography/pipeline
 */
export function getCurrentEnvironment(): Environment {
  return CURRENT_ENV;
}

export function getCurrentGeography(): Geography {
  return CURRENT_GEO;
}

export function getCurrentPipeline(): BuildPipeline {
  return CURRENT_PIPELINE;
}

/**
 * Get base URL based on environment and geography
 * @param environment - The environment (dev, test, preview, prod, etc.)
 * @param geography - The geography (us, europe, china, etc.)
 * @returns The base URL for the specified environment and geography
 */
export function getBaseUrl(
  environment: Environment = CURRENT_ENV,
  geography: Geography = CURRENT_GEO
): string {
  const envKey = environment.toLowerCase();
  const geoKey = geography.toLowerCase();

  // Special handling for sovereign clouds that don't depend on environment
  if (envKey === 'ussec') {
    return BASE_URL_MAP.ussec as string;
  }
  if (envKey === 'usnat') {
    return BASE_URL_MAP.usnat as string;
  }

  // Get environment-specific URL
  const envConfig = BASE_URL_MAP[envKey];

  if (!envConfig) {
    // Fallback to test environment if unknown
    console.warn(`Unknown environment: ${environment}, falling back to test environment`);
    return BASE_URL_MAP.test as string;
  }

  // If environment config is a string (dev, test, preview), return it directly
  if (typeof envConfig === 'string') {
    return envConfig;
  }

  // If environment is prod, get geography-specific URL
  if (typeof envConfig === 'object') {
    const geoUrl = envConfig[geoKey];
    if (!geoUrl) {
      // Fallback to US for prod if geography not found
      console.warn(`Unknown geography for prod: ${geography}, falling back to US`);
      return envConfig.us || 'https://make.powerapps.com';
    }
    return geoUrl;
  }

  // Final fallback to test environment
  return BASE_URL_MAP.test as string;
}
