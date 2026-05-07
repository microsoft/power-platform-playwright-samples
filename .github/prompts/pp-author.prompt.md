---
mode: agent
description: Scaffold a new Power Platform Playwright test using the toolkit Page Objects + the Playwright MCP server for live selector capture. Always honors CLAUDE.md anti-patterns.
---

# Scaffold a new Power Platform Playwright test

You are an assistant for the [microsoft/power-platform-playwright-samples](https://github.com/microsoft/power-platform-playwright-samples) repo. Your job in this prompt is to scaffold a new Playwright test for a Canvas / MDA / Custom Page / Gen UX flow.

You **do not** run the suite — switch to `pp-validate.prompt.md` for that. You **do not** debug failures — switch to `pp-diagnose.prompt.md`.

You must read [CLAUDE.md](../../CLAUDE.md) — specifically the **AI Agent Reference: Anti-Patterns** section — before generating any selector or wait.

## Required inputs

Ask in **one message** if any are missing:

1. App type: `canvas-app` / `model-driven-app` / `custom-page` / `studio-authoring` / `gen-ux-runtime`
2. What the test should do (1–3 sentences)
3. The pass condition (a value, URL, or element that proves success)
4. Confirm `packages/e2e-tests/.playwright-ms-auth/` has fresh state files (run `npm run auth:headful` and/or `auth:mda:headful` if not)

## Step 1 — Find the right toolkit Page Object

Read `packages/power-platform-playwright-toolkit/src/`. **Never use raw `page.locator()` for things the toolkit handles.**

| App type          | Page Object                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Canvas            | `CanvasAppPage` via `appProvider.getCanvasAppPage()`                                             |
| Model-Driven      | `ModelDrivenAppPage` (`.form`, `.grid`, `.commanding`) via `appProvider.getModelDrivenAppPage()` |
| Custom Page       | `ModelDrivenAppPage` + custom POM under `packages/e2e-tests/pages/northwind/`                    |
| Gen UX (designer) | `GenUxPage` via `appProvider.getGenUxPage()`                                                     |
| Maker Portal      | `PowerAppsPage` + `PowerPlatformNavigator`                                                       |

Always launch via `AppProvider`:

```typescript
import { AppProvider, AppType, AppLaunchMode } from 'power-platform-playwright-toolkit';

const appProvider = new AppProvider(page, context);
await appProvider.launch({
  app: 'Northwind Orders',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  directUrl: process.env.CANVAS_APP_URL,
  skipMakerPortal: true,
});
```

## Step 2 — Capture selectors via MCP

The Playwright MCP server is registered at `.mcp.json`. Use it to navigate the user's real app and read live DOM rather than guessing.

For each new selector you need:

1. Navigate the MCP browser to the page where the element lives
2. Take a snapshot of the DOM
3. Pick the most stable selector in this priority order:
   - `data-control-name` (Canvas) / `data-id` (MDA)
   - `role` + accessible name
   - `aria-label` exact match
   - `getByText` (only if stable copy)
   - CSS class (last resort)
4. Verify uniqueness (`count() === 1`)
5. Wrap with `findWithFallback` if multiple Studio versions exist (§7)

## Step 3 — Anti-patterns checklist (walk before writing code)

- [ ] §1 `waitForFunction` — options in third position (`fn, undefined, { timeout }`)
- [ ] §2 / §2a — for MDA attribute reads/writes, find an editable record in `beforeEach`
- [ ] §3 — `[role="row"][row-index]` for grid row counts
- [ ] §4 — `waitForURL` not `waitForTimeout` after navigation
- [ ] §5 — multi-selector fallback for MDA sidebar `[role="presentation"][title], a[title], a[aria-label]`
- [ ] §6 — Studio data source pane `[class*="ms-Callout-main"]`
- [ ] §7 — `findWithFallback` / `findWithFallbackRole` for versioned UI
- [ ] §8 — Gen UX `addNewPage` is a 3-step flow with `findWithFallback` on step 1
- [ ] §9 — `attribute.setValue()` (NOT `setEntityAttribute` — fires onChange)
- [ ] §10 — Canvas Edit fields: `el.evaluate(e => e.select())` then `pressSequentially`
- [ ] §11 — toolkit changes need `rush build --to power-platform-playwright-toolkit`

## Step 4 — File layout

| App type          | Test directory                                    |
| ----------------- | ------------------------------------------------- |
| Canvas            | `packages/e2e-tests/tests/northwind/canvas/`      |
| Model-Driven      | `packages/e2e-tests/tests/northwind/mda/`         |
| Custom Page       | `packages/e2e-tests/tests/northwind/custom-page/` |
| Gen UX (designer) | `packages/e2e-tests/tests/gen-ux/basic-form/`     |
| Gen UX (runtime)  | `packages/e2e-tests/tests/gen-ux/runtime/`        |

Test file naming: `<feature>-<verb>.test.ts`.

## Step 5 — Skeleton

```typescript
import { test, expect } from '@playwright/test';
import {
  AppProvider,
  AppType,
  AppLaunchMode,
  getStorageStatePath,
} from 'power-platform-playwright-toolkit';

test.use({
  storageState: getStorageStatePath(process.env.MS_AUTH_EMAIL!),
});

test.describe('{Feature name}', () => {
  test.beforeEach(async ({ page, context }) => {
    const appProvider = new AppProvider(page, context);
    await appProvider.launch({
      app: 'Northwind Orders',
      type: AppType.Canvas,
      mode: AppLaunchMode.Play,
      directUrl: process.env.CANVAS_APP_URL,
      skipMakerPortal: true,
    });
  });

  test('{flow description}', async ({ page }) => {
    // Step 1: setup — find an editable record / open the right view
    // Step 2: action — drive the toolkit Page Object
    // Step 3: assertion — wait + assert the pass condition
    await page.waitForURL(/order=\d+/, { timeout: 30_000 });
    await expect(page.getByText('Order created')).toBeVisible();
  });
});
```

## Step 6 — Hand-off

When the test is written:

1. Tell the user the file path you created
2. Give the run command:
   ```
   cd packages/e2e-tests
   npx playwright test --project=<project> --grep "<describe>" --headed
   ```
3. If a captured selector contradicts an existing toolkit method, flag it as **toolkit drift** and propose updating the Page Object instead of inlining the selector
4. Remind them which anti-patterns the new test relies on

## Notes

- **Do NOT write authentication code.** `playwright-ms-auth` handles MSAL; the test imports `getStorageStatePath` and Playwright resumes the saved session.
- **Confirm the env GUID before driving MCP** — the test will run on the user's real environment.
- **Prefer extending an existing Page Object over inline selectors.** Shared controls belong in `packages/power-platform-playwright-toolkit/src/components/` or `packages/e2e-tests/pages/northwind/`.
- **Always read CLAUDE.md anti-patterns before generating selectors or waits** — it is the single most important file in the repo for AI authoring.
