<div align="center">
  <h1><strong>Power Platform Playwright Samples</strong></h1>

[![Build Status](https://github.com/microsoft/power-platform-playwright-samples/actions/workflows/ci.yml/badge.svg)](https://github.com/microsoft/power-platform-playwright-samples/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%2B-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57%2B-green)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)

  <p><strong>Official Playwright automation toolkit and sample tests for Microsoft Power Platform</strong></p>
  <p>A production-ready testing framework for Canvas Apps, Model-Driven Apps, Custom Pages, and Gen UX — with built-in Microsoft authentication, intelligent waiters, and a composable Page Object Model.</p>
</div>

---

## Packages

This monorepo contains two packages:

| Package                                                                                      | Description                                             |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`packages/power-platform-playwright-toolkit/`](packages/power-platform-playwright-toolkit/) | Core library — clone the repo to use it in your project |
| [`packages/e2e-tests/`](packages/e2e-tests/)                                                 | Sample tests demonstrating real-world usage patterns    |

---

## API Reference

### Core

| Export                       | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `AppProvider`                | Entry point — launch any app type, exposes typed page objects   |
| `AppLauncherFactory`         | Lower-level factory for creating app launchers directly         |
| `URLBuilder`                 | Construct Maker Portal URLs programmatically                    |
| `PowerPlatformNavigator`     | Navigate between Power Platform sections                        |
| `ConfigHelper`               | Read environment variables with defaults (`getBaseUrl()`, etc.) |
| `getStorageStatePath(email)` | Resolve the storage state file path for a given user            |

### Page Objects

| Export               | App type                       | Key methods                                           |
| -------------------- | ------------------------------ | ----------------------------------------------------- |
| `ModelDrivenAppPage` | Model-Driven / Dynamics 365    | `.form`, `.grid`, `.commanding`                       |
| `CanvasAppPage`      | Canvas Apps                    | `clickControl()`, `getLabelText()`, `waitForScreen()` |
| `GenUxPage`          | Maker Portal / Gen UX designer | `waitForDesignerReady()`, `getPreviewFrame()`         |
| `PowerAppsPage`      | Maker Portal general           | Navigation, solutions, app management                 |

### Model-Driven components

| Export                | Description                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `FormComponent`       | `getEntityAttribute()`, `setEntityAttribute()`, `saveForm()`, `isFormDirty()`, `executeInFormContext()` |
| `GridComponent`       | `navigateToGridView()`, `getRowCount()`, `openRow()`, `searchGrid()`                                    |
| `CommandingComponent` | Interact with the ribbon / command bar                                                                  |

### Locators

| Export                               | Description                                      |
| ------------------------------------ | ------------------------------------------------ |
| `getCanvasDataTestId(id)`            | Selector for Canvas `data-testid` attributes     |
| `getCanvasControlByName(name)`       | Selector for Canvas controls by name             |
| `getCanvasScreenByName(name)`        | Selector for Canvas screens by name              |
| `getModelDrivenDataAutomationId(id)` | Selector for MDA `data-automation-id` attributes |
| `getModelDrivenTablePage(entity)`    | Selector for MDA entity grid pages               |
| `getModelDrivenFormField(field)`     | Selector for MDA form fields                     |
| `getModelDrivenNavItem(item)`        | Selector for MDA navigation items                |

### Types and enums

| Export              | Values                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `AppType`           | `Canvas`, `ModelDriven`, `Portal`, `PowerApps`                                                       |
| `AppLaunchMode`     | `play`, `edit`, `preview`                                                                            |
| `CanvasControlType` | `Button`, `TextInput`, `Label`, `Dropdown`, `Gallery`, `Form`, `Checkbox`, `Toggle`, `DatePicker`, … |
| `EndPointURL`       | `/home`, `/apps`, `/solutions`, `/flows`, `/connections`, …                                          |
| `TimeOut`           | `DefaultWaitTime`, `OneMinuteTimeOut`, …                                                             |

### Waiters

| Export                | Waits for               |
| --------------------- | ----------------------- |
| `AppRuntimeWaiter`    | App runtime to be ready |
| `HomePageWaiter`      | Maker Portal home page  |
| `AppsPageWaiter`      | Apps listing page       |
| `SolutionsPageWaiter` | Solutions page          |

### Canvas Flakiness Helpers

Utility functions in `src/utils/canvas-helpers.ts` that address the most common failure modes when automating Canvas Apps and Custom Pages.

> **Why these exist:** Canvas Apps run a Power Fx engine inside a sandboxed iframe. Standard Playwright operations behave differently here — `fill()` bypasses `OnChange` handlers, gallery rows outside the viewport are absent from the DOM entirely, and invisible overlay elements intercept pointer events. These helpers encapsulate the correct patterns so every test benefits automatically.

| Export                | Signature                                        | What it solves                                                                                                                   |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `fillCanvasInput`     | `(page, locator, value, options?)`               | Types via keyboard events so Power Fx `OnChange` fires. `fill()` updates the DOM but the canvas engine never sees the new value. |
| `clickCanvasButton`   | `(locator, options?)`                            | Retries with `{ force: true }` when an invisible overlay element intercepts the pointer event.                                   |
| `scrollGalleryToItem` | `(page, gallerySelector, itemLocator, options?)` | Scrolls a virtualized gallery with mouse wheel until the target item is rendered in the DOM.                                     |
| `retryAction`         | `(action, options?)`                             | Generic retry wrapper (configurable attempts + delay) for actions that fail transiently during Canvas engine initialization.     |
| `waitForCanvasReady`  | `(page, readinessSelector, options?)`            | Waits for a sentinel element (e.g. the command bar) to appear, replacing bare `waitForTimeout` after navigation.                 |
| `confirmCanvasDialog` | `(page, options)`                                | Waits for a custom Canvas confirmation dialog, clicks confirm, then waits for it to close — end-to-end.                          |

**Usage example — Custom Page form input:**

```typescript
import {
  fillCanvasInput,
  clickCanvasButton,
  scrollGalleryToItem,
  waitForCanvasReady,
  confirmCanvasDialog,
} from 'power-platform-playwright-toolkit';

// Navigate to a Custom Page and wait for Canvas engine to be ready
await page.locator('[title="AccountsCustomPage"]').click();
await waitForCanvasReady(page, '[title="New record"]');

// Type into a Canvas input (triggers Power Fx OnChange)
await page.locator('[title="New record"]').click();
const input = page.locator('input[aria-label="Account Name"]');
await fillCanvasInput(page, input, 'Contoso Ltd');

// Click a button behind an overlay element
await clickCanvasButton(page.locator('[data-control-name="Rectangle1"]'));

// Scroll a virtualized gallery to find a specific item
const item = page.locator('[role="listitem"]').filter({ hasText: 'Contoso Ltd' });
await scrollGalleryToItem(page, '[role="listitem"]', item);

// Accept a delete confirmation dialog
await confirmCanvasDialog(page, {
  dialogSelector: '[data-control-name="DeleteText1"]',
  confirmSelector: '[data-control-name="DeleteConfirmBtn1"] [data-control-part="button"]',
});
```

> **Custom Pages in Model-Driven Apps** are Canvas apps embedded in the MDA shell. The outer navigation (sidebar, URL routing) is MDA — use standard Playwright patterns there. The page content runs on the Canvas engine — use these helpers for all interactions inside the page.

---

## Architecture

```
Your Test Project (clone this repo and reference the toolkit locally)
      │
      │  rush build → packages/power-platform-playwright-toolkit/dist/
      ▼
┌─────────────────────────────────────────────────────────┐
│           power-platform-playwright-toolkit              │
├──────────────────────────────┬──────────────────────────┤
│  AppProvider (entry point)   │  Page Object Model        │
│  AppLauncherFactory          │  • ModelDrivenAppPage     │
│  Authentication helpers      │  • CanvasAppPage          │
│  Page waiters                │  • GenUxPage              │
│  Locator utilities           │  • FormComponent          │
│  URL builders                │  • GridComponent          │
│                              │  • CommandingComponent    │
└──────────────────────────────┴──────────────────────────┘
      │
      │  uses
      ▼
playwright-ms-auth  +  @playwright/test
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/microsoft/power-platform-playwright-samples.git
cd power-platform-playwright-samples

# Install Rush (monorepo manager)
npm install -g @microsoft/rush

# Install dependencies
rush install

# Build all packages
rush build
```

### Run the sample tests

#### Step 1 — Install the Northwind Traders sample solution

The sample tests target the **Northwind Traders** solution, which includes a Model-Driven App, a Canvas App, and a Custom Page. You must install it into your Power Platform environment before running any tests.

Follow the official installation guide: [Install Northwind Traders database and apps](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/northwind-install)

Once installed you will have:

- **Northwind Orders (MDA)** — used by the `model-driven-app` test project
- **Northwind Orders (Canvas)** — used by the `default` test project
- **Custom Page** — used by the MDA custom page tests

#### Step 2 — Set up environment variables

The tests read all configuration from a `.env` file inside `packages/e2e-tests/`. Copy the example and fill in your values:

```bash
cd packages/e2e-tests
cp .env.example .env
```

Then open `packages/e2e-tests/.env` and assign values to every variable:

```bash
# -----------------------------------------------------------------------
# Power Apps / Maker Portal
# -----------------------------------------------------------------------
# Base URL of the Maker Portal (leave as-is unless using a preview URL)
POWER_APPS_BASE_URL=https://make.powerapps.com

# Your environment GUID — find it in the Maker Portal URL:
#   make.powerapps.com/environments/<GUID>/...
POWER_APPS_ENVIRONMENT_ID=Default-00000000-0000-0000-0000-000000000000

# -----------------------------------------------------------------------
# Model-Driven App
# -----------------------------------------------------------------------
# Full URL of your MDA including the ?appid= parameter.
# How to find: open your app in the browser and copy the URL.
MODEL_DRIVEN_APP_URL=https://your-org.crm.dynamics.com/main.aspx?appid=00000000-0000-0000-0000-000000000000

# -----------------------------------------------------------------------
# Canvas App
# -----------------------------------------------------------------------
# Option A — component IDs (toolkit builds the play URL automatically):
#   App ID:    Maker Portal → select app → Details → App ID
#   Tenant ID: Azure Portal → Azure Active Directory → Overview → Tenant ID
CANVAS_APP_ID=00000000-0000-0000-0000-000000000000
CANVAS_APP_TENANT_ID=00000000-0000-0000-0000-000000000000

# Option B — full play URL (takes precedence over IDs above if set):
# CANVAS_APP_URL=https://apps.powerapps.com/play/e/<env-id>/a/<app-id>?tenantId=<tenant-id>

# -----------------------------------------------------------------------
# Microsoft Authentication
# -----------------------------------------------------------------------
# The email address of the test user account
MS_AUTH_EMAIL=user@contoso.com

# Password authentication (simplest for local development):
MS_AUTH_CREDENTIAL_TYPE=password
MS_AUTH_CREDENTIAL_PROVIDER=environment
MS_AUTH_ENV_VARIABLE_NAME=MS_USER_PASSWORD
MS_USER_PASSWORD=your-password-here

# Certificate authentication (recommended for CI/CD — uncomment to use):
# MS_AUTH_CREDENTIAL_TYPE=certificate
# MS_AUTH_CREDENTIAL_PROVIDER=local-file
# MS_AUTH_LOCAL_FILE_PATH=./cert/your-cert.pfx
# MS_AUTH_CERTIFICATE_PASSWORD=your-cert-password

# Run the auth browser headlessly (set to false to watch the sign-in)
MS_AUTH_HEADLESS=true
MS_AUTH_WAIT_FOR_MSAL_TOKENS=true
MS_AUTH_MSAL_TOKEN_TIMEOUT=30000
AUTH_ENDPOINT=https://login.microsoftonline.com

# -----------------------------------------------------------------------
# Test Runner
# -----------------------------------------------------------------------
HEADLESS=true
WORKERS=1
RETRIES=0
TEST_TIMEOUT=120000
OUTPUT_DIRECTORY=./test-results
```

> All variable descriptions and available options are documented in
> [`packages/e2e-tests/.env.example`](packages/e2e-tests/.env.example).

#### Step 3 — Authenticate

Authentication is handled by [`packages/e2e-tests/scripts/authenticate.ts`](packages/e2e-tests/scripts/authenticate.ts), which uses `playwright-ms-auth` to acquire and cache browser storage state (cookies + localStorage tokens). Run it once before your first test run — you only need to re-run it if your session expires.

The script is exposed via these npm scripts from inside `packages/e2e-tests/`:

| Command                    | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `npm run auth:headful`     | Authenticate to the **Maker Portal** (Canvas Apps, Gen UX) — opens a visible browser |
| `npm run auth:mda:headful` | Authenticate to the **Model-Driven App** (CRM domain) — opens a visible browser      |
| `npm run auth`             | Headless Maker Portal auth (for CI or scripted flows)                                |
| `npm run auth:mda`         | Headless MDA auth (for CI or scripted flows)                                         |

For running both MDA and Canvas/Gen UX tests you need to authenticate twice — once for each domain:

```bash
cd packages/e2e-tests

# 1. Authenticate to Maker Portal (Canvas + Gen UX tests)
npm run auth:headful

# 2. Authenticate to the Model-Driven App domain (MDA tests)
npm run auth:mda:headful
```

Storage state files are saved automatically to the path returned by `getStorageStatePath(email)` and picked up by `playwright.config.ts` via the `storageState` option.

> **Tokens expired?** If you see `Authentication tokens have expired!` when running tests, simply re-running `npm run auth:headful` may not resolve it because the old state file is still present and being detected as valid by the script. **Delete the stale state file first**, then re-authenticate:
>
> ```bash
> # Delete the stale state file (path printed in the error message), e.g.:
> rm .playwright-ms-auth/state-<your-email>.json
>
> # For MDA tests, also delete the MDA state file:
> rm .playwright-ms-auth/state-mda-<your-email>.json
>
> # Then re-authenticate
> npm run auth:headful
> npm run auth:mda:headful
> ```

#### Step 4 — Run tests

```bash
# Run all tests
npx playwright test

# Run a specific project
npx playwright test --project=model-driven-app
npx playwright test --project=default        # canvas + maker portal
npx playwright test --project=gen-ux
```

---

## Monorepo Structure

```
power-platform-playwright-samples/
├── packages/
│   ├── power-platform-playwright-toolkit/  # core toolkit (use by cloning this repo)
│   │   ├── src/
│   │   │   ├── core/           # AppProvider, AppLauncherFactory, waiters
│   │   │   ├── components/     # ModelDrivenAppPage, CanvasAppPage, GenUxPage
│   │   │   │   ├── model-driven/   # FormComponent, GridComponent, CommandingComponent
│   │   │   │   ├── canvas/         # CanvasAppPage
│   │   │   │   └── gen-ux/         # GenUxPage
│   │   │   ├── auth/           # Authentication helpers
│   │   │   ├── locators/       # Locator repositories
│   │   │   ├── types/          # TypeScript interfaces & enums
│   │   │   └── utils/          # Helper functions
│   │   └── dist/               # Compiled output
│   ├── e2e-tests/              # Sample test infrastructure
│   │   ├── tests/              # Test files (mda/, canvas/, gen-ux/)
│   │   ├── pages/              # Custom Page Object Models
│   │   ├── utils/              # Test utilities and shared steps
│   │   └── playwright.config.ts
│├── common/                     # Rush configuration
├── rush.json
└── .github/workflows/          # CI/CD pipelines
```

---

## Documentation

The sample tests in [`packages/e2e-tests/`](packages/e2e-tests/) are the best reference for real-world usage patterns. The `CLAUDE.md` file at the repo root contains a full project guide covering setup, environment configuration, authentication, and known flakiness patterns.

---

## Contributing

> [!NOTE]
> For now, we are not accepting external contributions. Our goal is to keep these samples simple, easy to use, and avoid adding extra layers or complexity.
>
> We recommend that individuals fork the repository and customize it to their specific needs. Feedback is always welcome, and we may consider contributions in the future as the project matures.

---

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos is subject to those third-parties' policies.

---

## License

MIT © Microsoft Corporation — see [LICENSE](LICENSE).

---

## Security

Microsoft takes the security of our software products and services seriously.

**Please do not report security vulnerabilities through public GitHub issues.**

See [SECURITY.md](SECURITY.md) or [https://aka.ms/SECURITY.md](https://aka.ms/SECURITY.md) for reporting instructions.

---

## Support

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/microsoft/power-platform-playwright-samples/issues)
- **Security vulnerabilities**: See [SECURITY.md](SECURITY.md) — do not use public issues
- **Microsoft Open Source**: [https://opensource.microsoft.com/](https://opensource.microsoft.com/)
