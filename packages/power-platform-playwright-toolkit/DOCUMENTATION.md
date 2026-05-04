# API Documentation Guide

This document explains how to write and generate API documentation for the Power Platform Playwright Toolkit.

## Overview

We use **TypeDoc** with the **markdown plugin** to automatically generate comprehensive API documentation from TypeScript source code. The generated documentation is integrated into our **Nextra**-based documentation site.

## Documentation Workflow

```
TypeScript Source Code (with JSDoc comments)
              ↓
         TypeDoc CLI
              ↓
    Markdown Files Generated
              ↓
    Nextra Documentation Site
              ↓
      Published Docs
```

## Generating Documentation

### Quick Commands

```bash
# Generate API documentation (from toolkit package)
npm run docs

# Watch mode - regenerate on file changes
npm run docs:watch

# Watch with live server
npm run docs:serve
```

### From Docs Package

```bash
# Build docs site (includes API generation)
cd packages/docs
npm run build

# Development mode
npm run dev
```

## Writing JSDoc Comments

### Basic Structure

````typescript
/**
 * Brief one-line description
 *
 * Detailed description with multiple paragraphs if needed.
 * Can include additional context, behavior notes, etc.
 *
 * @param paramName - Parameter description
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * // Example usage
 * const result = await myFunction('example');
 * ```
 */
````

### Essential Tags

#### @param - Document Parameters

```typescript
/**
 * Navigate to Power Apps home page
 *
 * @param baseUrl - Optional base URL to navigate to. If not provided, uses ConfigHelper.getBaseUrl()
 */
async navigateToHome(baseUrl?: string): Promise<void> {
  // Implementation
}
```

**For Object Parameters:**

```typescript
/**
 * @param options - Control options
 * @param options.name - Name or label of the control
 * @param options.type - Type of control (Button, TextInput, etc.)
 * @param options.timeout - Maximum time to wait in milliseconds
 * @param options.exact - Whether to match the name exactly
 */
getControl(options: ControlOptions): Locator {
  // Implementation
}
```

#### @returns - Document Return Values

```typescript
/**
 * Get Canvas gallery item count
 *
 * @param galleryName - Name of the gallery
 * @returns Promise that resolves to the number of items in the gallery
 */
async getCanvasGalleryItemCount(galleryName: string): Promise<number> {
  const items = await this.getCanvasGalleryItems(galleryName);
  return items.count();
}
```

#### @throws - Document Exceptions

```typescript
/**
 * Launch Canvas app by ID
 *
 * @throws {Error} If the app fails to load within the timeout period
 * @throws {Error} If the app ID is invalid or not found
 */
async launchCanvasAppById(appId: string): Promise<void> {
  // Implementation
}
```

#### @example - Provide Usage Examples

````typescript
/**
 * Click a Canvas control
 *
 * @example Basic usage
 * ```typescript
 * await canvas.clickControl({ name: 'Submit Button' });
 * ```
 *
 * @example With specific control type
 * ```typescript
 * await canvas.clickControl({
 *   name: 'Submit',
 *   type: CanvasControlType.Button,
 *   timeout: 5000
 * });
 * ```
 *
 * @example With exact matching
 * ```typescript
 * await canvas.clickControl({
 *   name: 'Submit',
 *   exact: true
 * });
 * ```
 */
async clickControl(options: ControlOptions): Promise<void> {
  // Implementation
}
````

#### @see - Cross-reference Related Items

```typescript
/**
 * Launch Canvas app by name
 *
 * @see {@link launchCanvasAppById} for launching by app ID
 * @see {@link CanvasAppHelper.closeCanvasApp} for closing the app
 */
async launchCanvasAppByName(appName: string): Promise<void> {
  // Implementation
}
```

#### @deprecated - Mark Deprecated APIs

```typescript
/**
 * Old method for launching apps
 *
 * @deprecated Use {@link launchCanvasAppByName} instead
 */
async oldLaunchMethod(): Promise<void> {
  // Implementation
}
```

#### @category - Organize Documentation

```typescript
/**
 * Navigate to home page
 *
 * @category Navigation
 */
async navigateToHome(): Promise<void> {
  // Implementation
}

/**
 * Click a control
 *
 * @category Canvas Apps
 * @category User Interactions
 */
async clickControl(options: ControlOptions): Promise<void> {
  // Implementation
}
```

#### @internal - Hide Internal APIs

```typescript
/**
 * Internal helper method
 *
 * @internal
 */
private internalHelper(): void {
  // This won't appear in public docs
}
```

### Best Practices

#### 1. Write Clear Descriptions

**❌ Bad:**

```typescript
/**
 * Clicks thing
 */
async click(): Promise<void> {}
```

**✅ Good:**

```typescript
/**
 * Clicks a Canvas control by name and waits for it to be clickable
 *
 * This method first locates the control using the provided options,
 * waits for it to become visible and enabled, then performs the click action.
 */
async clickControl(options: ControlOptions): Promise<void> {}
```

#### 2. Document All Public APIs

Every exported function, class, method, and property should have documentation.

```typescript
/**
 * Helper class for Canvas App specific operations
 *
 * Handles launching, interacting with, and testing Canvas apps.
 * Use via PowerAppsPage.canvas or instantiate directly.
 */
export class CanvasAppHelper {
  /**
   * Creates a new CanvasAppHelper instance
   *
   * @param page - Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
  }
}
```

#### 3. Include Type Information

TypeDoc automatically extracts TypeScript types, but you can add context:

```typescript
/**
 * Control options for locating Canvas controls
 *
 * @property name - Name or label of the control (e.g., "Submit Button")
 * @property type - Optional control type for more specific matching
 * @property timeout - Max wait time in milliseconds (default: 10000)
 * @property exact - Whether to match the name exactly (default: false)
 */
export interface ControlOptions {
  name: string;
  type?: CanvasControlType;
  timeout?: number;
  exact?: boolean;
}
```

#### 4. Document Default Values

```typescript
/**
 * Launch Canvas app
 *
 * @param mode - Launch mode (default: AppLaunchMode.Play)
 * @param options - Player options
 * @param options.waitForReady - Wait for app to be ready (default: true)
 * @param options.timeout - Max wait time in ms (default: 30000)
 */
async launchCanvasApp(
  mode: AppLaunchMode = AppLaunchMode.Play,
  options: AppPlayerOptions = {}
): Promise<void> {}
```

#### 5. Document Async Behavior

```typescript
/**
 * Wait for Canvas app to be ready
 *
 * This method waits for:
 * 1. The app container to be visible
 * 2. Loading spinners to disappear
 * 3. A 2-second settle period
 *
 * @param timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns Promise that resolves when the app is ready
 */
private async waitForCanvasAppReady(timeout: number = 30000): Promise<void> {}
```

#### 6. Use Markdown in Descriptions

You can use markdown formatting in JSDoc comments:

````typescript
/**
 * Canvas App Helper
 *
 * ## Features
 *
 * - Launch apps by name or ID
 * - Interact with controls (buttons, inputs, etc.)
 * - Work with galleries and forms
 * - Assert control visibility and text
 *
 * ## Usage
 *
 * Access via `PowerAppsPage.canvas` or create directly:
 *
 * ```typescript
 * const canvas = new CanvasAppHelper(page);
 * await canvas.launchCanvasAppByName('My App');
 * ```
 *
 * @see {@link PowerAppsPage}
 */
export class CanvasAppHelper {}
````

#### 7. Document Enums

```typescript
/**
 * Canvas control types
 *
 * Used to specify the type of control when locating elements
 * in Canvas apps. Different control types use different locator strategies.
 */
export enum CanvasControlType {
  /**
   * Button control
   * Located using role="button"
   */
  Button = 'Button',

  /**
   * Text input control
   * Located using role="textbox"
   */
  TextInput = 'TextInput',

  /**
   * Label or text display
   * Located using text content
   */
  Label = 'Label',
}
```

## Configuration

### TypeDoc Configuration

The TypeDoc configuration is in `typedoc.json`:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["./src/index.ts"],
  "out": "../docs/pages/reference",
  "plugin": ["typedoc-plugin-markdown"],
  "excludePrivate": true,
  "excludeInternal": true,
  "categorizeByGroup": true,
  "categoryOrder": [
    "Core",
    "Page Object Models",
    "App-Specific Helpers",
    "Locators",
    "Types",
    "Utilities",
    "*"
  ]
}
```

### Key Settings

- **entryPoints**: Where TypeDoc starts scanning (usually `index.ts`)
- **out**: Where to write the generated documentation
- **plugin**: The markdown plugin for Nextra compatibility
- **excludePrivate**: Don't document private members
- **excludeInternal**: Don't document `@internal` tagged items
- **categorizeByGroup**: Group by `@category` tags
- **categoryOrder**: Custom order for categories

## Output Structure

Generated documentation is organized as:

```
docs/pages/reference/
├── README.md              # Main API index
├── classes/               # All classes
│   ├── PowerAppsPage.md
│   ├── CanvasAppHelper.md
│   └── ...
├── interfaces/            # All interfaces
│   ├── ControlOptions.md
│   └── ...
├── enumerations/          # All enums
│   ├── AppType.md
│   ├── CanvasControlType.md
│   └── ...
├── functions/             # Standalone functions
└── variables/             # Exported constants
```

## Integration with Nextra

The generated markdown files are automatically integrated into the Nextra documentation site:

1. **Navigation**: Nextra creates sidebar navigation from the file structure
2. **Search**: All API content is searchable
3. **Links**: Cross-references become clickable links
4. **Syntax Highlighting**: Code examples are highlighted
5. **Responsive**: Works on mobile and desktop

## Continuous Integration

Documentation is automatically regenerated:

1. **On Build**: `npm run build` in docs package
2. **On Deploy**: GitHub Actions runs `npm run build:github`
3. **On Commit**: Pre-commit hooks can run `npm run docs`

## Viewing Documentation Locally

```bash
# Start development server
cd packages/docs
npm run dev

# Open http://localhost:3000
# Navigate to Reference > API
```

## Publishing Documentation

Documentation is published via GitHub Pages:

```bash
# Build for GitHub Pages
cd packages/docs
npm run build:github

# Export static site
npm run export

# Deploy (handled by GitHub Actions)
```

## Tips for Great Documentation

### ✅ DO

- Write clear, concise descriptions
- Include practical examples
- Document all parameters and return values
- Use `@category` to organize related items
- Add `@see` links to related APIs
- Document edge cases and special behavior
- Use proper grammar and punctuation

### ❌ DON'T

- Skip documentation for "obvious" methods
- Write vague descriptions like "does stuff"
- Forget to update docs when changing code
- Use jargon without explanation
- Include implementation details in public docs
- Write overly long descriptions (save details for guides)

## Example: Well-Documented Class

````typescript
/**
 * Canvas App Helper
 *
 * Provides methods for testing Canvas apps in Power Platform.
 * Handles app launching, control interaction, and assertions.
 *
 * @example Basic usage
 * ```typescript
 * const powerAppsPage = new PowerAppsPage(page);
 * await powerAppsPage.canvas.launchCanvasAppByName('My App');
 * await powerAppsPage.canvas.clickControl({ name: 'Submit' });
 * ```
 *
 * @category Canvas Apps
 */
export class CanvasAppHelper {
  /**
   * Launch Canvas app by name
   *
   * Finds the app in the Apps list, clicks it, and waits for it to load.
   * Supports Play, Edit, and Preview modes.
   *
   * @param appName - Name of the Canvas app
   * @param findAppCallback - Callback to find the app (usually PowerAppsPage.findApp)
   * @param mode - Launch mode (default: Play)
   * @param options - Additional launch options
   * @param options.waitForReady - Wait for app to be ready (default: true)
   * @param options.timeout - Max wait time in ms (default: 30000)
   *
   * @returns Promise that resolves when app is loaded
   *
   * @throws {Error} If app is not found
   * @throws {Error} If app fails to load within timeout
   *
   * @example Launch in play mode
   * ```typescript
   * await canvas.launchCanvasAppByName('My App', findApp);
   * ```
   *
   * @example Launch in edit mode
   * ```typescript
   * await canvas.launchCanvasAppByName(
   *   'My App',
   *   findApp,
   *   AppLaunchMode.Edit
   * );
   * ```
   *
   * @see {@link launchCanvasAppById} for launching by app ID
   * @category Canvas Apps
   */
  async launchCanvasAppByName(
    appName: string,
    findAppCallback: (appName: string) => Promise<Locator>,
    mode: AppLaunchMode = AppLaunchMode.Play,
    options: AppPlayerOptions = {}
  ): Promise<void> {
    // Implementation
  }
}
````

## Troubleshooting

### Documentation not updating

```bash
# Clean and rebuild
cd packages/power-platform-playwright-toolkit
rm -rf ../docs/pages/reference
npm run docs
```

### TypeDoc errors

```bash
# Check for TypeScript errors first
npm run build

# Run TypeDoc with verbose logging
npx typedoc --logLevel Verbose
```

### Links not working

- Ensure you use proper `@see` or `@link` syntax
- Use `{@link ClassName}` for inline links
- Use `@see ClassName` for "See also" sections

## Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [TSDoc Standard](https://tsdoc.org/)
- [JSDoc Reference](https://jsdoc.app/)
- [Nextra Documentation](https://nextra.site/)
- [TypeDoc Markdown Plugin](https://github.com/tgreyuk/typedoc-plugin-markdown)

## Questions?

- Open an issue on GitHub
- Check existing API documentation examples
- Refer to this guide when in doubt
