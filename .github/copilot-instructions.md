# GitHub Copilot Instructions — Power Platform Playwright Samples

This file gives GitHub Copilot context about the repository so that suggestions,
completions, and chat answers are accurate for this codebase.

---

## What This Repository Is

A **Rush monorepo** with two packages:

- `packages/power-platform-playwright-toolkit/` — Core TypeScript library, published to npm as `power-platform-playwright-toolkit`. Contains the Page Object Model, authentication helpers, locators, waiters, and utilities.
- `packages/e2e-tests/` — Sample Playwright tests targeting Canvas Apps, Model-Driven Apps, and Gen UX in a real Power Platform environment.

---

## Architecture Conventions

### Entry point for all tests

Always use `AppProvider` to launch apps and obtain page objects:

```typescript
import { AppProvider, AppType, AppLaunchMode } from 'power-platform-playwright-toolkit';

const appProvider = new AppProvider(page, context);
await appProvider.launch({
  app: 'My App',
  type: AppType.Canvas, // or ModelDriven, PowerApps
  mode: AppLaunchMode.Play,
  directUrl: process.env.CANVAS_APP_URL,
  skipMakerPortal: true,
});

const canvasApp = appProvider.getCanvasAppPage();
const mdaApp = appProvider.getModelDrivenAppPage();
const genUx = appProvider.getGenUxPage();
```

### Storage state (auth)

- Canvas / Gen UX / Maker Portal: `getStorageStatePath(email)` → `.playwright-ms-auth/state-<email>.json`
- Model-Driven App (CRM domain): `.playwright-ms-auth/state-mda-<email>.json`
- Auth state is valid for **24 hours** (file modification time), configurable via `MS_AUTH_STORAGE_STATE_EXPIRATION`.

### Environment variables

All config comes from `packages/e2e-tests/.env` (gitignored). Use `.env.example` as the template. Key variables:

```
POWER_APPS_ENVIRONMENT_ID   — environment GUID (find in Maker Portal URL)
CANVAS_APP_ID               — Canvas App ID (Maker Portal → app → Details)
CANVAS_APP_TENANT_ID        — Azure AD tenant ID
MODEL_DRIVEN_APP_URL        — full MDA URL including ?appid=
MS_AUTH_EMAIL               — test user email
MS_AUTH_CREDENTIAL_TYPE     — password | certificate
MS_AUTH_STORAGE_STATE_EXPIRATION — hours (default: 24)
```

### Playwright projects (playwright.config.ts)

| Project name       | Test directory / match                                      | Storage state            |
| ------------------ | ----------------------------------------------------------- | ------------------------ |
| `canvas-app`       | `tests/northwind/canvas/`                                   | `state-<email>.json`     |
| `model-driven-app` | `tests/northwind/mda/`                                      | `state-mda-<email>.json` |
| `custom-page`      | `tests/northwind/custom-page/custom-page-crud.test.ts`      | `state-mda-<email>.json` |
| `studio-authoring` | `**/custom-page.test.ts` + `**/gen-ux/basic-form/*.test.ts` | `state-<email>.json`     |
| `gen-ux-runtime`   | `**/gen-ux/runtime/*.test.ts`                               | `state-<email>.json`     |
| `default`          | `tests/` (all)                                              | `state-<email>.json`     |

---

## Coding Patterns to Follow

### Canvas App tests — always scope to the iframe

```typescript
const canvasFrame = page.frameLocator('iframe[name="fullscreen-app-host"]');
await canvasFrame
  .locator('[data-control-name="Gallery1"]')
  .first()
  .waitFor({ state: 'visible', timeout: 60000 });
```

### Model-Driven App tests — use toolkit components

```typescript
const mda = appProvider.getModelDrivenAppPage();
await mda.grid.navigateToGridView();
await mda.grid.openRow(0);
const value = await mda.form.getEntityAttribute('name');
await mda.form.setEntityAttribute('description', 'Updated');
await mda.form.saveForm();
```

### Auth validation

`validateAuthState()` in `utils/validate-auth-state.ts` is called in `playwright.config.ts`
before tests run. It checks file age (24h) and, for MDA, that CRM cookies exist.
Do not bypass this — if auth is stale, re-run the auth scripts.

### Custom Page Objects

Extend toolkit page objects for app-specific methods. See:

- `packages/e2e-tests/pages/northwind/NorthwindCanvasAppPage.ts`
- `packages/e2e-tests/pages/northwind/NorthwindModelDrivenAppPage.ts`

---

## Build & Test Commands

```bash
# Monorepo (from repo root)
rush install              # install dependencies
rush build                # build all packages

# Tests (from packages/e2e-tests/)
npm run auth:headful                        # authenticate Canvas / Maker Portal
npm run auth:mda:headful                    # authenticate MDA / CRM domain
npx playwright test --project=canvas-app
npx playwright test --project=model-driven-app
npx playwright test --project=custom-page
npx playwright test --project=studio-authoring
npx playwright test --project=gen-ux-runtime
npx playwright test --ui                    # interactive UI mode
```

---

## AI Tooling Available in This Repo

The repo ships an `.mcp.json` at the root that registers the official **Playwright MCP
server** (`@playwright/mcp`). Copilot Chat (with the Playwright MCP extension), Claude
Code, and Cursor will pick this up automatically. Use it when generating new tests or
diagnosing selectors that have drifted across Power Platform versions.

### Suggested prompts

When a developer asks for a new test, Copilot should:

1. Read [CLAUDE.md](../CLAUDE.md) — especially the **AI Agent Reference: Anti-Patterns**
   section — before writing any selector or wait.
2. Use `AppProvider` and the toolkit's page-object methods, not raw `page.locator()`,
   for anything that has a toolkit equivalent.
3. Pull values from `process.env` — never hardcode env IDs, app IDs, or URLs.

Example prompts that work well in this repo:

- _"Generate a Playwright test under tests/northwind/canvas/ that creates an order, edits the customer field, and verifies the gallery row updates. Follow the patterns in canvas-app-crud.test.ts."_
- _"Convert this raw `page.locator()`-based test to use `ModelDrivenAppPage` from the toolkit."_
- _"The 'Save' selector for the Custom Page form just changed. Use the Playwright MCP server to drive the page and tell me the current selector."_
- _"This MDA test fails with 'Attribute not found' when the record is closed. Read CLAUDE.md § 2 and fix the test to skip read-only records."_

---

## What NOT to Suggest

- Do not suggest `npm install` at the repo root — this is a Rush monorepo; use `rush install`.
- Do not suggest using `page.locator()` directly on canvas app content — it must be scoped via `page.frameLocator('iframe[name="fullscreen-app-host"]')`.
- Do not suggest checking MSAL access token expiry (1h) to validate auth state — the project uses **file modification time (24h)** instead.
- Do not suggest hardcoding environment IDs, app IDs, or URLs — all values must come from `.env` / environment variables.
- Do not suggest committing `.env` — it is gitignored and contains credentials.
- Do not suggest `rush build --to e2e-tests` — the e2e-tests package has `build: tsc --noEmit` only; build the toolkit with `rush build --to power-platform-playwright-toolkit`.

---

## Customer Setup Checklist

When helping a customer set up this project for their environment:

1. `rush install` + `rush build` from repo root
2. `npx playwright install msedge --with-deps` inside `packages/e2e-tests/`
3. Copy `.env.example` to `.env` inside `packages/e2e-tests/`
4. Fill in: `POWER_APPS_ENVIRONMENT_ID`, `CANVAS_APP_ID`, `CANVAS_APP_TENANT_ID`, `MODEL_DRIVEN_APP_URL`, `MS_AUTH_EMAIL`, and credentials
5. Install Northwind Traders solution: https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/northwind-install
6. `npm run auth:headful` — authenticate Canvas / Maker Portal
7. `npm run auth:mda:headful` — authenticate MDA
8. `npx playwright test --project=canvas-app` — verify canvas tests pass
9. `npx playwright test --project=model-driven-app` — verify MDA tests pass
10. Update `.azure-pipelines/e2e-tests.yml` pipeline variables to match the new environment
