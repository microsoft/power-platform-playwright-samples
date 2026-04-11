# GitHub Copilot Instructions — Power Platform Playwright Samples

This file gives GitHub Copilot context about the repository so that suggestions,
completions, and chat answers are accurate for this codebase.

---

## What This Repository Is

A **Rush monorepo** with three packages:

- `packages/power-platform-playwright-toolkit/` — Core TypeScript library, published to npm as `power-platform-playwright-toolkit`. Contains the Page Object Model, authentication helpers, locators, waiters, and utilities.
- `packages/e2e-tests/` — Sample Playwright tests targeting Canvas Apps, Model-Driven Apps, and Gen UX in a real Power Platform environment.
- `packages/docs/` — Nextra/Next.js documentation site.

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

| Project name       | Test directory            | Storage state            |
| ------------------ | ------------------------- | ------------------------ |
| `canvas-app`       | `tests/northwind/canvas/` | `state-<email>.json`     |
| `model-driven-app` | `tests/northwind/mda/`    | `state-mda-<email>.json` |
| `gen-ux`           | `tests/gen-ux/`           | `state-<email>.json`     |
| `default`          | `tests/` (all)            | `state-<email>.json`     |

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
npx playwright test --project=gen-ux
npx playwright test --ui                    # interactive UI mode
```

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
