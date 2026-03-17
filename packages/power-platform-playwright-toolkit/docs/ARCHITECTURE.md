# Architecture Overview

This document describes the architecture and design patterns used in the Power Platform Playwright Toolkit.

## Core Principles

1. **AppProvider Pattern**: Single entry point for all Power Platform testing
2. **Component-Based Architecture**: Reusable UI components (GridComponent, FormComponent)
3. **Page Object Model**: Structured page interactions
4. **Type Safety**: Full TypeScript support with strict typing
5. **Performance First**: Direct URL launch, optimized waits, parallel execution

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Test Layer                                │
│   (User Tests - Canvas App Tests, Model-Driven App Tests)          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       AppProvider (Entry Point)                      │
│  - Handles authentication                                           │
│  - Manages app lifecycle                                            │
│  - Creates appropriate page objects                                 │
│  - Supports direct URL launch                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│       CanvasAppPage           │  │    ModelDrivenAppPage          │
│  - getControl()               │  │  - GridComponent               │
│  - Canvas-specific methods    │  │  - FormComponent               │
└───────────────────────────────┘  └───────────────────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
                  │GridComponent │  │FormComponent    │  │More...       │
                  │  - openRecord│  │  - getAttribute │  │              │
                  │  - selectRow │  │  - setAttribute │  │              │
                  │  - getCellVal│  │  - save()       │  │              │
                  │  - sortColumn│  │  - isDirty()    │  │              │
                  └──────────────┘  └─────────────────┘  └──────────────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │FormContext API   │
                                    │  - getFormContext│
                                    │  - getAttribute  │
                                    │  - saveForm      │
                                    └──────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
                  │Locators      │  │Utils            │  │Types         │
                  │  - Canvas    │  │  - Config       │  │  - AppType   │
                  │  - MDA       │  │  - Auth Helpers │  │  - Interfaces│
                  └──────────────┘  └─────────────────┘  └──────────────┘
```

## Core Components

### 1. AppProvider

**Purpose**: Single entry point for launching and managing Power Platform apps.

**Key Responsibilities**:

- Authentication management (uses storage state from playwright-ms-auth)
- App lifecycle management
- Page object creation
- Direct URL launch support

**Usage**:

```typescript
const appProvider = new AppProvider(page, context);

await appProvider.launch({
  app: 'My App',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true,
  directUrl: process.env.APP_URL,
});

const canvasApp = appProvider.getCanvasAppPage();
```

**Why Mandatory**:

- Ensures consistent authentication handling
- Manages browser context and new tabs properly
- Provides proper app initialization and waiting
- Enforces best practices

### 2. Page Object Models

#### CanvasAppPage

**Purpose**: Provides methods for interacting with Canvas Apps.

**Key Methods**:

- `getControl(options)`: Get control by data-test-id or name
- Canvas-specific control interactions

**Design Pattern**:

- Extends base functionality
- Provides Canvas-specific methods
- Delegates to Playwright Page for core operations

#### ModelDrivenAppPage

**Purpose**: Provides methods for interacting with Model-Driven Apps, with component-based access to grids and forms.

**Key Components**:

- `grid`: GridComponent instance (lazy-initialized)
- `form`: FormComponent instance (lazy-initialized)

**Design Pattern**:

- Component-based architecture
- Lazy initialization for performance
- Convenience methods that delegate to components

### 3. Component Architecture

#### GridComponent

**Purpose**: Encapsulates all grid/list view operations for Model-Driven Apps.

**Key Methods**:

- `openRecord(options)`: Open record by row number or column value
- `getCellValue(row, column)`: Get cell value from grid
- `selectRow(rowNumber)`: Select single row
- `selectRows(rowNumbers)`: Select multiple rows
- `sortByColumn(columnName, direction)`: Sort grid
- `waitForGridLoad()`: Wait for grid to fully load
- `getRowCount()`: Get total number of rows

**Design Decisions**:

- Handles multiple fallback strategies (link click, double-click)
- Provides both component access and convenience methods
- Robust error handling and retry logic

**Usage**:

```typescript
// Via component (full control)
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
const value = await modelDrivenApp.grid.getCellValue(0, 'Order Number');

// Via convenience methods (simpler)
await modelDrivenApp.openRecordFromGrid({ rowNumber: 0 });
const value = await modelDrivenApp.getGridCellValue(0, 'Order Number');
```

#### FormComponent

**Purpose**: Encapsulates all form operations and FormContext API access.

**Key Methods**:

- `getAttribute(name)`: Get field value
- `setAttribute(name, value)`: Set field value
- `save(options)`: Save form
- `isDirty()`: Check if form has unsaved changes
- `isValid()`: Check if form is valid
- `navigateToTab(options)`: Navigate to form tab
- `setFieldVisibility(name, visible)`: Control field visibility
- `setFieldDisabled(name, disabled)`: Control field state
- `showNotification(message, level, id)`: Show form notification
- `execute(fn)`: Execute custom FormContext code

**Design Decisions**:

- Wraps low-level FormContext API for convenience
- Type-safe attribute access
- Consistent error handling
- Supports both simple and advanced scenarios

**Usage**:

```typescript
// Simple operations
await modelDrivenApp.form.setAttribute('name', 'Contoso Ltd');
await modelDrivenApp.form.save();

// Advanced operations
await modelDrivenApp.form.setFieldVisibility('internalNotes', false);
await modelDrivenApp.form.showNotification('Saved', 'success', 'save-msg');

// Custom FormContext code
const formType = await modelDrivenApp.form.execute((Xrm) => {
  return Xrm.Page.ui.getFormType();
});
```

### 4. Utility Layer

#### Configuration (ConfigHelper)

**Purpose**: Centralize configuration and environment variable access.

**Key Methods**:

- `getBaseUrl()`: Get Power Apps base URL
- `getTenantId()`: Get Azure tenant ID
- `getEnvironmentId()`: Get Power Platform environment ID
- `getAuthToken()`: Get authentication token from storage state
- `checkStorageStateExpiration()`: Check if auth token is expired
- `buildUrl(path, environmentId)`: Build full Power Apps URLs

**Design Pattern**:

- Static methods for easy access
- Environment variable fallbacks
- Centralized URL building

#### Authentication Helpers

**Purpose**: Helper functions for authentication and token management.

**Key Functions**:

- `getAuthToken(storagePath, apiUrl)`: Extract token from storage state
- `checkStorageStateExpiration(storagePath)`: Check token expiration
- `checkEnvironmentVariables()`: Validate required environment variables

**Design Decisions**:

- Works with playwright-ms-auth storage state format
- Supports multiple API token audiences
- Validates environment configuration

#### Test Data Utilities

**Purpose**: Generate unique test data for consistent, repeatable tests.

**Key Functions**:

- `generateUniqueOrderNumber(digits)`: Generate order numbers (ORD-12345)
- `generateUniqueTestId(prefix)`: Generate test IDs (TEST-ABC123)
- `generateRandomAlphaNumeric(length)`: Generate random strings
- `buildCanvasAppUrl(options)`: Build Canvas App URLs
- `buildCanvasAppUrlFromEnv()`: Build from environment variables

**Design Pattern**:

- Timestamp-based uniqueness
- Consistent formatting
- Easy to use and understand

#### Locator Helpers

**Purpose**: Provide reusable locator strategies with fallback support.

**Key Functions**:

- `findWithFallback(page, selectors, opts)`: Try multiple selectors in order
- `findWithFallbackRole(page, roleQueries, opts)`: Try multiple role queries

**Design Decisions**:

- Handles unstable selectors
- Provides graceful fallback
- Reduces test flakiness

### 5. Locators

#### Structure

Locators are organized by app type and UI area:

```
BaseLocators
├── Common (shared selectors)
└── Utilities

PowerAppsPageLocators
├── Navigation
├── TopBar
└── Content

CanvasAppLocators
├── Controls (by data-test-id, name)
└── Screens

ModelDrivenAppLocators
├── Runtime
│   ├── Content
│   │   ├── Grid (rows, cells, headers, pagination)
│   │   ├── Form (fields, tabs, sections)
│   │   └── CommandBar
│   └── Navigation
└── Designer
```

**Design Principles**:

- Hierarchical organization
- Separated by concern
- Functions for dynamic selectors
- Constants for static selectors

### 6. Type System

#### Core Types

```typescript
// App Types
enum AppType {
  Canvas = 'Canvas',
  ModelDriven = 'ModelDriven',
}

enum AppLaunchMode {
  Play = 'play',
  Edit = 'edit',
}

// App Launch Config
interface LaunchAppConfig {
  app: string | AppIdentifier;
  type: AppType;
  mode?: AppLaunchMode;
  skipMakerPortal?: boolean;
  directUrl?: string;
  context?: BrowserContext;
}

// Grid Options
interface GridRecordOptions {
  rowNumber?: number;
  columnValue?: string;
  columnName?: string;
}

// Form Options
interface FormSaveOptions {
  saveMode?: 'save' | 'saveandclose' | 'saveandnew';
}

interface FormTabOptions {
  tabName?: string;
  tabIndex?: number;
}
```

**Design Decisions**:

- Strong typing prevents errors
- Optional parameters for flexibility
- Union types for multiple valid options
- Clear, self-documenting interfaces

## Design Patterns

### 1. Factory Pattern

**Where Used**: AppLauncherFactory (internal)

**Purpose**: Create appropriate app launcher based on app type.

**Benefits**:

- Encapsulates object creation logic
- Easy to extend with new app types
- Type-safe creation

### 2. Component Pattern

**Where Used**: GridComponent, FormComponent

**Purpose**: Encapsulate UI behavior into reusable components.

**Benefits**:

- Separation of concerns
- Reusable across different page objects
- Easy to test independently
- Reduces code duplication

### 3. Lazy Initialization

**Where Used**: GridComponent and FormComponent properties

**Purpose**: Create components only when first accessed.

**Benefits**:

- Performance optimization
- Reduces memory footprint
- Pays cost only when needed

```typescript
export class ModelDrivenAppPage {
  private _grid?: GridComponent;

  get grid(): GridComponent {
    if (!this._grid) {
      this._grid = new GridComponent(this.page, this.locators.Grid);
    }
    return this._grid;
  }
}
```

### 4. Delegation Pattern

**Where Used**: Convenience methods on ModelDrivenAppPage

**Purpose**: Provide simpler API while delegating to components.

**Benefits**:

- Backward compatibility
- Flexibility (both simple and advanced usage)
- Clean separation

```typescript
// Convenience method (simple)
async openRecordFromGrid(options: GridRecordOptions): Promise<void> {
  return this.grid.openRecord(options);
}

// Component access (full control)
modelDrivenApp.grid.openRecord(options);
```

### 5. Fallback Strategy Pattern

**Where Used**: GridComponent.openRecord(), findWithFallback()

**Purpose**: Try multiple approaches until one succeeds.

**Benefits**:

- Handles UI variations
- Reduces flakiness
- Graceful degradation

```typescript
// Strategy 1: Try clicking link
try {
  await row.locator('a').first().click();
  return;
} catch {
  // Strategy 2: Try double-click
  await row.dblclick();
}
```

## Authentication Flow

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Run Authentication Script (Once)                            │
│    npx ts-node scripts/authenticate.ts                         │
│    → Creates .auth/storageState.json                           │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. Playwright Config Uses Storage State                        │
│    storageState: '.auth/storageState.json'                     │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. Tests Run with Authentication                               │
│    AppProvider uses storage state automatically                │
│    No login required in each test                              │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. Optional: Check Token Expiration                            │
│    ConfigHelper.checkStorageStateExpiration()                  │
│    Re-authenticate if expired                                  │
└────────────────────────────────────────────────────────────────┘
```

## Test Execution Flow

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Test Setup (beforeEach)                                     │
│    - Create AppProvider                                        │
│    - Launch app with direct URL                                │
│    - Get page object (CanvasAppPage or ModelDrivenAppPage)    │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. App Launch                                                  │
│    - Navigate to direct URL                                    │
│    - Wait for OAuth redirects (Model-Driven Apps)              │
│    - Wait for app initialization                               │
│    - Create app launcher                                       │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. Test Execution                                              │
│    Canvas App:                     Model-Driven App:           │
│    - getControl()                  - grid.openRecord()         │
│    - Control interactions          - grid.getCellValue()       │
│                                    - form.setAttribute()        │
│                                    - form.save()                │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. Verification                                                │
│    - Assert expected outcomes                                  │
│    - Verify data correctness                                   │
│    - Check UI state                                            │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Test Teardown (automatic)                                   │
│    - Page objects cleaned up                                   │
│    - Browser context closed                                    │
│    - Screenshots on failure                                    │
└────────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### 1. Direct URL Launch

**Optimization**: Skip maker portal navigation entirely.

**Impact**: 10-20 seconds saved per test.

```typescript
// Fast: Direct URL
await appProvider.launch({
  skipMakerPortal: true,
  directUrl: process.env.APP_URL,
});

// Slow: Maker portal navigation (not recommended)
await appProvider.launch({
  skipMakerPortal: false,
  app: 'My App',
  baseUrl: 'https://make.powerapps.com',
});
```

### 2. Storage State Reuse

**Optimization**: Authenticate once, reuse tokens.

**Impact**: 5-10 seconds saved per test.

### 3. Lazy Component Initialization

**Optimization**: Create components only when accessed.

**Impact**: Reduced memory usage, faster page object creation.

### 4. Parallel Test Execution

**Optimization**: Run tests concurrently.

**Impact**: 2-4x faster total execution time.

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4,
  fullyParallel: true,
});
```

## Future Extensions

### Planned Components

1. **CommandBarComponent**: Enhanced command button handling
   - Overflow menu support
   - Button state checking
   - Ribbon customization

2. **DialogComponent**: Generic dialog/modal handling
   - Dialog detection
   - Button interactions
   - Content extraction

3. **SubgridComponent**: Subgrid operations
   - Nested grid handling
   - Subgrid-specific operations

4. **QuickViewFormComponent**: Quick view form interactions

5. **BusinessProcessFlowComponent**: BPF navigation and stage management

### Extension Points

- Custom page objects can extend CanvasAppPage or ModelDrivenAppPage
- Custom components can follow same pattern as GridComponent
- Custom locators can be added to locator files
- Custom utilities can be added to utils folder

## Summary

The Power Platform Playwright Toolkit follows a **component-based, type-safe architecture** with these key characteristics:

1. **AppProvider as mandatory entry point** for consistency and reliability
2. **Component architecture** (GridComponent, FormComponent) for reusability
3. **Hybrid API** - both component access and convenience methods
4. **Performance-first design** - direct URLs, lazy initialization, parallel execution
5. **Strong typing** throughout for type safety
6. **Extensible** - easy to add custom page objects and components
7. **Well-organized** - clear separation of concerns, hierarchical structure

This architecture enables:

- **Fast test execution** (direct URL launch, auth reuse)
- **Reliable tests** (fallback strategies, proper waits)
- **Maintainable code** (components, page objects, DRY principle)
- **Type safety** (TypeScript strict mode)
- **Extensibility** (custom page objects, components)
