# Power Platform Playwright Samples — Project Guide

This file gives AI assistants (Claude Code) and new contributors a complete picture of
the repository so that setup, test runs, and code changes go smoothly from the first
conversation.

---

## What This Repo Is

A **monorepo** containing:

| Package                                       | Purpose                                                               |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `packages/power-platform-playwright-toolkit/` | Core npm library — published as `power-platform-playwright-toolkit`   |
| `packages/e2e-tests/`                         | Sample Playwright tests that target a real Power Platform environment |

The sample tests demonstrate Canvas App, Model-Driven App (MDA), and Gen UX testing
patterns against a **Northwind Traders** Power Apps solution.

---

## Prerequisites

- **Node.js 20+**
- **Microsoft Edge** (the tests use `channel: 'msedge'`)
- **Rush** monorepo manager (`npm install -g @microsoft/rush`)
- **pnpm** (managed by corepack — `corepack enable`)
- A **Microsoft 365 / Power Platform tenant** with:
  - A test user account (`MS_AUTH_EMAIL`)
  - The **Northwind Traders** solution installed (Canvas + MDA + Custom Page)
  - For Gen UX tests: an environment with the **Gen UX AI feature enabled**

---

## First-Time Setup

```bash
# 1. Clone
git clone https://github.com/microsoft/power-platform-playwright-samples.git
cd power-platform-playwright-samples

# 2. Install Rush globally (if not already installed)
npm install -g @microsoft/rush

# 3. Install all package dependencies
rush install

# 4. Build all packages (toolkit must be built before e2e-tests can import it)
rush build

# 5. Install Playwright browser (msedge channel is required)
cd packages/e2e-tests
npx playwright install msedge --with-deps
```

---

## Environment Configuration — CHANGE THESE FOR YOUR ENVIRONMENT

Copy the template and fill in your values:

```bash
cd packages/e2e-tests
cp .env.example .env
```

Open `packages/e2e-tests/.env` and update **every value** marked below:

### Power Apps / Maker Portal

```bash
POWER_APPS_BASE_URL=https://make.powerapps.com   # or make.preview.powerapps.com

# YOUR environment GUID — find it in the Maker Portal URL:
#   make.powerapps.com/environments/<GUID>/home
# Can be "Default-<tenantId>" for the default environment, or a specific GUID.
POWER_APPS_ENVIRONMENT_ID=Default-00000000-0000-0000-0000-000000000000   # CHANGE THIS
```

### Model-Driven App (Northwind MDA)

```bash
# Full URL of your MDA — open the app in the browser and copy the URL including ?appid=
# Example: https://orgXXXXXXXX.crm.dynamics.com/main.aspx?appid=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
MODEL_DRIVEN_APP_URL=https://your-org.crm.dynamics.com/main.aspx?appid=00000000-0000-0000-0000-000000000000  # CHANGE THIS
```

### Canvas App (Northwind Canvas)

```bash
# Option A — component IDs (recommended):
#   App ID:    Maker Portal → select app → Details → App ID
#   Tenant ID: Azure Portal → Azure Active Directory → Overview → Tenant ID
CANVAS_APP_ID=00000000-0000-0000-0000-000000000000      # CHANGE THIS
CANVAS_APP_TENANT_ID=00000000-0000-0000-0000-000000000000  # CHANGE THIS

# Option B — full play URL (takes precedence over IDs if set):
# CANVAS_APP_URL=https://apps.powerapps.com/play/e/<env-id>/a/<app-id>?tenantId=<tenant-id>
```

### Microsoft Authentication

```bash
MS_AUTH_EMAIL=user@contoso.com   # CHANGE THIS — your test user's email

# --- Password auth (simplest for local dev) ---
MS_AUTH_CREDENTIAL_TYPE=password
MS_AUTH_CREDENTIAL_PROVIDER=environment
MS_USER_PASSWORD=your-password   # CHANGE THIS

# --- Certificate auth (recommended for CI/CD) ---
# MS_AUTH_CREDENTIAL_TYPE=certificate
# MS_AUTH_CREDENTIAL_PROVIDER=local-file
# MS_AUTH_LOCAL_FILE_PATH=../../cert/your-cert.pfx   # CHANGE THIS
# MS_AUTH_CERTIFICATE_PASSWORD=                       # CHANGE THIS if cert is password-protected

MS_AUTH_HEADLESS=false             # Set to true for CI; false lets you see the browser sign-in
MS_AUTH_WAIT_FOR_MSAL_TOKENS=true
MS_AUTH_MSAL_TOKEN_TIMEOUT=30000
MS_AUTH_STORAGE_STATE_EXPIRATION=24  # Hours before saved auth state is considered stale

AZURE_TENANT_ID=contoso.onmicrosoft.com   # CHANGE THIS
AUTH_ENDPOINT=https://login.microsoftonline.com
```

> All variables are documented with descriptions in `packages/e2e-tests/.env.example`.

---

## Authentication Setup

The tests use `playwright-ms-auth` to save browser storage state (cookies + localStorage)
once, so subsequent runs skip the sign-in flow.  
**Storage state lives for 24 hours** — re-run auth if you see auth errors.

Two separate sessions are needed because Canvas and MDA run on different domains:

```bash
cd packages/e2e-tests

# Canvas Apps + Gen UX + Maker Portal (saves to .playwright-ms-auth/state-<email>.json)
npm run auth:headful

# Model-Driven App / Dynamics CRM (saves to .playwright-ms-auth/state-mda-<email>.json)
npm run auth:mda:headful
```

If auth fails or tokens expire:

```bash
# Delete the stale state file(s) first, then re-run
rm .playwright-ms-auth/state-<email>.json
rm .playwright-ms-auth/state-mda-<email>.json
npm run auth:headful
npm run auth:mda:headful
```

---

## Running Tests

All commands run from `packages/e2e-tests/`.

```bash
# Run a specific project (recommended)
npx playwright test --project=canvas-app
npx playwright test --project=model-driven-app
npx playwright test --project=gen-ux

# Run all projects
npx playwright test

# Headed mode (visible browser)
npx playwright test --project=canvas-app --headed

# Debug mode
npx playwright test --debug tests/northwind/canvas/canvas-app-crud.test.ts

# UI mode (interactive)
npx playwright test --ui
```

---

## Test Projects

Defined in `playwright.config.ts`:

| Project            | Test directory            | Auth state               | What it tests                                                                      |
| ------------------ | ------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `canvas-app`       | `tests/northwind/canvas/` | `state-<email>.json`     | Northwind Canvas App CRUD (gallery, add, save, reload)                             |
| `model-driven-app` | `tests/northwind/mda/`    | `state-mda-<email>.json` | Northwind MDA CRUD, FormContext API, Custom Pages                                  |
| `gen-ux`           | `tests/gen-ux/`           | `state-<email>.json`     | AI-generated app via Maker Portal (requires Gen UX feature enabled in environment) |
| `default`          | `tests/` (all)            | `state-<email>.json`     | Catch-all project running everything                                               |

> **Gen UX note**: The `gen-ux` project requires an environment where the
> **"Describe a page"** AI button is present in the Maker Portal app designer.
> If that button is missing, the test will time out at `addNewPage()`. Use a different
> `POWER_APPS_ENVIRONMENT_ID` that has Gen UX enabled — this may be different from the
> environment used by your Canvas / MDA tests.

---

## Project Structure

```
power-platform-playwright-samples/
├── packages/
│   ├── power-platform-playwright-toolkit/   # Core library (publish to npm)
│   │   └── src/
│   │       ├── core/           # AppProvider, AppLauncherFactory, page waiters
│   │       ├── components/     # ModelDrivenAppPage, CanvasAppPage, GenUxPage
│   │       ├── auth/           # MsAuthHelper
│   │       ├── locators/       # Locator repositories
│   │       ├── types/          # TypeScript interfaces & enums
│   │       └── utils/          # auth-helpers, config, locator-helpers
│   ├── e2e-tests/               # Sample tests
│   │   ├── tests/
│   │   │   ├── northwind/canvas/    # Canvas App tests
│   │   │   ├── northwind/mda/       # Model-Driven App tests
│   │   │   └── gen-ux/basic-form/   # Gen UX AI tests
│   │   ├── pages/northwind/         # Custom Page Object Models
│   │   ├── utils/
│   │   │   ├── validate-auth-state.ts   # 24h file-age auth validation
│   │   │   ├── common.ts
│   │   │   └── gen-ux/
│   │   ├── scripts/authenticate.ts  # Auth script (--headful, --mda flags)
│   │   ├── globals/global-setup.ts
│   │   ├── playwright.config.ts
│   │   └── .env.example             # Template — copy to .env and fill in
├── .azure-pipelines/
│   ├── e2e-tests.yml                # Scheduled E2E pipeline (weekdays 06:00 UTC)
│   └── steps/e2e-setup.yml          # Reusable auth + install setup steps
├── rush.json
└── CLAUDE.md                        # This file
```

---

## Key Files to Know

| File                                                                  | Purpose                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/e2e-tests/.env`                                             | Local config — **never commit**, gitignored                |
| `packages/e2e-tests/.env.example`                                     | Template with all variables documented                     |
| `packages/e2e-tests/playwright.config.ts`                             | Playwright projects, timeouts, reporters                   |
| `packages/e2e-tests/utils/validate-auth-state.ts`                     | Checks auth state file age before tests run                |
| `packages/e2e-tests/scripts/authenticate.ts`                          | Runs headful/headless auth, saves storage state            |
| `packages/power-platform-playwright-toolkit/src/core/app-provider.ts` | Main entry point for launching any app type                |
| `.azure-pipelines/e2e-tests.yml`                                      | CI pipeline variables — **update env/app IDs here for CI** |

---

## Northwind Traders Solution

The sample tests target the **Northwind Traders** solution. Install it in your environment
before running tests:

[Install Northwind Traders database and apps](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/northwind-install)

After installation you will have:

- **Northwind Orders (Canvas App)** — tested by `canvas-app` project
- **Northwind Orders (Model-Driven App)** — tested by `model-driven-app` project
- **Custom Pages** — tested by MDA custom page tests

To find the correct IDs after installation:

1. **Canvas App ID**: Maker Portal → Apps → select "Northwind Orders" → Details → App ID
2. **Environment ID**: Maker Portal URL → `make.powerapps.com/environments/<GUID>/...`
3. **MDA URL**: Open the Northwind MDA in browser → copy full URL including `?appid=`

---

## CI/CD — Azure Pipelines

The scheduled pipeline is in `.azure-pipelines/e2e-tests.yml`. It runs **weekdays at
06:00 UTC** against a live Power Platform environment.

**When you change your environment, update these pipeline variables too:**

```yaml
# .azure-pipelines/e2e-tests.yml — variables section
- name: POWER_APPS_ENVIRONMENT_ID
  value: 'your-environment-guid' # CHANGE THIS
- name: CANVAS_APP_ID
  value: 'your-canvas-app-id' # CHANGE THIS
- name: CANVAS_APP_TENANT_ID
  value: 'your-tenant-id' # CHANGE THIS
- name: MODEL_DRIVEN_APP_URL
  value: 'https://your-org.crm.dynamics.com/main.aspx?appid=...' # CHANGE THIS
- name: msAuthEmail
  value: 'your-test-user@contoso.com' # CHANGE THIS
- name: MS_AUTH_STORAGE_STATE_EXPIRATION
  value: '24' # Hours — keep in sync with .env
```

Certificate-based auth in CI uses **Azure Key Vault** via `UCIPlaywrightServiceConnection`.
The setup template (`e2e-setup.yml`) fetches the cert, decodes it to disk, and passes it
to the auth scripts via `MS_AUTH_LOCAL_FILE_PATH`.

---

## Common Commands (from repo root)

```bash
# Install / build
rush install                          # Install all dependencies
rush build                            # Build all packages
rush build --to power-platform-playwright-toolkit  # Build toolkit only

# From packages/e2e-tests/
npm run auth:headful                  # Authenticate (Canvas + Gen UX)
npm run auth:mda:headful              # Authenticate (MDA / CRM domain)
npx playwright test --project=canvas-app
npx playwright test --project=model-driven-app
npx playwright test --project=gen-ux
npx playwright test --ui              # Interactive UI mode
npx playwright show-report            # Open last HTML report
```

---

## Troubleshooting

| Problem                                                  | Cause                                                | Fix                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| `Authentication tokens have expired!`                    | State file is stale                                  | Delete `state-*.json`, re-run `npm run auth:headful`                  |
| `Storage state file does not exist`                      | Never authenticated                                  | Run `npm run auth:headful` (and `auth:mda:headful` for MDA)           |
| `Sorry, we didn't find that app`                         | Wrong `CANVAS_APP_ID` or `POWER_APPS_ENVIRONMENT_ID` | Check app IDs in Maker Portal; verify env ID in URL                   |
| `Describe a page` button missing                         | Gen UX not enabled in this environment               | Use a different `POWER_APPS_ENVIRONMENT_ID` with Gen UX feature       |
| `Cannot find module 'power-platform-playwright-toolkit'` | Toolkit not built                                    | Run `rush build` from repo root                                       |
| MDA tests fail with cert error                           | Cert path wrong or missing                           | Check `MS_AUTH_LOCAL_FILE_PATH` and `MS_AUTH_CERTIFICATE_PASSWORD`    |
| Canvas app stuck loading                                 | App takes 10–30s to initialize                       | Already handled in `beforeEach`; increase `waitFor` timeout if needed |
| Gen UX tests time out (120s+)                            | AI generation is slow by design                      | This is expected — do not reduce `timeout` below 120s                 |
| form-context tests time out (`Timeout 60000ms exceeded`) | `page.waitForFunction` arg placement bug             | See **Known Flakiness Patterns** section below                        |
| `AccountsCustomPage` not found in sidebar                | Custom page not deployed to environment              | Deploy the Northwind AccountsCustomPage via the MDA app designer      |

---

## Known Flakiness Patterns and Anti-Patterns

This section documents recurring test instability root causes found in this repo.
**Read this before modifying any test or toolkit file.**

### 1. `page.waitForFunction` — Options Must Be the Third Argument

**Anti-pattern (broken — timeout is silently ignored):**

```typescript
await page.waitForFunction(() => { ... }, { timeout: 30000 });
//                                         ↑ treated as 'arg', NOT options
```

**Correct pattern:**

```typescript
await page.waitForFunction(() => { ... }, undefined, { timeout: 30000 });
//                                         ↑ arg      ↑ options (3rd position)
```

Playwright's signature is `page.waitForFunction(fn, arg, options)`. Passing `{ timeout }` in the
second (arg) position means Playwright uses the page's default timeout instead. This is silent and
very hard to diagnose. Always pass `undefined` as `arg` when the function needs no argument.

> **File affected:** `packages/power-platform-playwright-toolkit/src/components/model-driven/form.context.ts`

---

### 2. Xrm Collection API vs Plain Arrays (Dynamics 365 v9.2+)

`Xrm.Page.data.entity.attributes` is an **Xrm Collection**, not a plain JS array.

| API                             | Behaviour in D365 v9.2+                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `entity.attributes.get()`       | Returns **empty array** — do NOT use to enumerate all attrs                                        |
| `entity.attributes.getLength()` | Returns **0** via the `Xrm.Page` legacy shim                                                       |
| `Array.isArray(attrs)`          | Returns `false` — Xrm Collections are not plain arrays                                             |
| `entity.attributes.forEach(cb)` | **Works in one-shot `page.evaluate`** — DO NOT use in `waitForFunction` polling (always returns 0) |
| `entity.attributes.get(name)`   | **Works** — direct name lookup resolves (if form is editable)                                      |
| `entity.getEntityName()`        | **Works everywhere** — use as the "form is ready" readiness check                                  |

**Rule:** Use `forEach()` only inside one-shot `page.evaluate()` calls. For attribute binding wait,
use the `waitForEntityAttributes` helper (which polls via `page.evaluate`, not `waitForFunction`).

**Inactive / read-only records:** For deactivated or closed records, `attributes.forEach()` returns
**0 items by design** — D365 does not bind attributes in read-only form mode. `waitForEntityAttributes`
waits up to 10 s for attributes, then proceeds silently. `setEntityAttribute`/`getEntityAttribute`
will throw "Attribute not found" fast — this is the correct signal.

> **File affected:** `packages/power-platform-playwright-toolkit/src/components/model-driven/form.context.ts`

### 2a. Finding an Editable Record in Tests (Northwind Orders Pattern)

Some Northwind Order records have `Order Status = Closed`. For **system-inactive** records D365
renders a read-only form where `attributes.forEach()` always returns 0. Tests that need to read
or modify attributes must ensure they open an **active / editable** record.

**Pattern (beforeEach in form-context tests):**

```typescript
// Try up to 5 rows to find one whose Xrm attributes collection is populated
for (let row = 0; row < 5; row++) {
  await modelDrivenApp.grid.openRecord({ rowNumber: row });
  await page.waitForURL(/pagetype=entityrecord/, { timeout: 15_000 });
  await page.waitForTimeout(2_000);

  const hasAttributes = await page.evaluate(() => {
    const entity = (window as any).Xrm?.Page?.data?.entity;
    if (!entity) return false;
    let count = 0;
    try {
      entity.attributes.forEach(() => {
        count++;
      });
    } catch {
      /* ignore */
    }
    return count > 0;
  });

  if (hasAttributes) break;

  await modelDrivenApp.navigateToGridView(ENTITY_NAME);
  await page.waitForTimeout(2_000);
}
```

This prevents the test from silently running on a read-only record and failing at assertions.

> **File affected:** `packages/e2e-tests/tests/northwind/mda/form-context.test.ts`

---

### 3. MDA Grid Row Count — Use `row-index` Attribute

The MDA grid uses **ag-Grid**. All rows have `role="row"`, but only data rows carry a `row-index`
attribute. Header rows do not.

**Anti-pattern (returns -1 when grid is empty):**

```typescript
const count = await this.page.locator('[role="row"]').count();
return count - 1; // ← subtracts 1 header row, gives -1 on empty grid
```

**Correct pattern:**

```typescript
return await this.page.locator('[role="row"][row-index]').count();
// Only counts data rows — returns 0 on empty grid, never negative
```

> **File affected:** `packages/power-platform-playwright-toolkit/src/components/model-driven/grid.component.ts`

---

### 4. MDA Navigation — Wait for URL, Not Timeout

After clicking a record link or navigating between views, use `waitForURL` not `waitForTimeout`.

**Anti-pattern (flaky — fixed wait may expire before navigation completes):**

```typescript
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
await page.waitForTimeout(3000); // ← arbitrary, can be too short
```

**Correct pattern:**

```typescript
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
await page.waitForURL(/pagetype=entityrecord/, { timeout: 30000 });
```

---

### 5. MDA Sidebar Selectors — Use Multi-Selector Fallback

MDA renders sidebar navigation items differently across versions (`[role="presentation"][title]` vs
`<a title>` vs `<a aria-label>`). Always use a combined selector:

```typescript
page
  .locator(`[role="presentation"][title="${name}"], a[title="${name}"], a[aria-label="${name}"]`)
  .first();
```

---

### 6. Power Apps Studio Data Source Dialog — Search Before Select

In Power Apps Studio v3+, the "Start from data" button opens a **"Select a data source"** dialog
with a search box — not the old `.ms-Callout-main` callout flyout.

**Pattern:**

```typescript
// 1. Click "Start from data"
// 2. Wait for search box in the dialog
const searchInput = studioFrame.locator('input[placeholder="Search"]');
await searchInput.waitFor({ state: 'visible', timeout: 30000 });
// 3. Type to filter
await searchInput.fill(dataSourceName);
await page.waitForTimeout(1000);
// 4. Click the filtered result
await studioFrame
  .locator(
    `[data-item-id*="datasourceItem"] [aria-label="${dataSourceName}"], [role="option"][aria-label="${dataSourceName}"]`
  )
  .first()
  .click();
```

> **File affected:** `packages/e2e-tests/pages/northwind/CustomPage.page.ts`

---

### 7. Use `findWithFallback` and `findWithFallbackRole` for Versioned UI

When a selector might differ across Power Platform versions, use the toolkit utilities:

```typescript
import { findWithFallback, findWithFallbackRole } from 'power-platform-playwright-toolkit';

// Try multiple selectors — returns the first visible one
const btn = await findWithFallback(
  page,
  [
    '#add-new-page-in-canvas-placeholder', // v3 Studio
    '#add-new-page-in-command-bar', // v2 Studio
  ],
  { timeout: 5000 }
);
await btn.click();

// Role-based fallback
const link = await findWithFallbackRole(page, [
  { role: 'menuitem', name: 'Apps' },
  { role: 'link', name: 'Apps' },
]);
await link.click();
```

These utilities probe each selector with a 1-second timeout and silently move to the next. Use them
whenever a UI element has been renamed or restructured across versions.

> **Source:** `packages/power-platform-playwright-toolkit/src/utils/locator-helpers.ts`

---

### 8. Gen UX `addNewPage()` — 3-Step Flow with `findWithFallback`

The "Describe a new page" flow in Power Apps Studio requires three sequential clicks.
The step-1 ID has changed across Studio versions — use `findWithFallback` so the method
adapts automatically rather than hard-coding a single ID:

```typescript
const addPageBtn = await findWithFallback(
  page,
  [
    '#add-new-page-in-canvas-placeholder', // Studio v2: canvas placeholder
    '#add-new-page-in-command-bar', // Studio v3: command bar button
    '[id*="add-new-page"]', // Partial — forward compatibility
  ],
  { timeout: 5_000 }
);
await addPageBtn.click();

// Step 2 — "Generative page" option
await page.getByRole('button', { name: 'Generative page' }).click();

// Step 3 — opens the AI prompt panel
await page.getByText('Describe a new page').click();
```

If any step times out: open the trace (`npx playwright show-trace`) and check the DOM for
the current IDs/labels — then add the new variant to the selector array above.

> **File affected:** `packages/power-platform-playwright-toolkit/src/components/gen-ux/gen-ux.page.ts`

---

### 10. DOM Input vs Xrm Model — Always Use `setEntityAttribute` to Commit

**Anti-pattern (broken — value typed into DOM but not committed to Xrm model):**

```typescript
await orderNumberInput.fill('');
await orderNumberInput.pressSequentially(testOrderNumber, { delay: 50 });
// ↑ D365 saves what the Xrm attribute model knows — not what's in the DOM.
// attribute.getValue() will return null after save/reload.
```

**Correct pattern:**

```typescript
await orderNumberInput.fill('');
await orderNumberInput.pressSequentially(testOrderNumber, { delay: 50 });
// Commit value to Xrm model so D365 actually saves it:
await setEntityAttribute(page, 'nwind_ordernumber', testOrderNumber);
```

**Why this fails silently:** Playwright's `fill`, `pressSequentially`, and `type` all
update the HTML `<input>` value but do NOT fire the D365 field `onchange` handler that
updates `attribute.setValue()` in the Xrm data model. When the Save button is clicked,
D365 serialises the Xrm model — not the DOM — so the field is saved as `null`. The save
succeeds (the record GUID appears in the URL), but reading back via `getEntityAttribute`
returns `null`.

**Rule:** Any time you fill a text/number field on a D365 MDA form, follow `fill()` /
`pressSequentially()` with `await setEntityAttribute(page, attributeName, value)`.

> **Files affected:** `packages/e2e-tests/tests/northwind/mda/model-driven-crud.test.ts`

---

### 9. Rebuild After Any Toolkit Change

The `e2e-tests` package imports the **compiled** toolkit (`dist/`). Editing TypeScript source files
in `packages/power-platform-playwright-toolkit/src/` has NO effect on tests until rebuilt.

```bash
# After any change to the toolkit source:
rush build --to power-platform-playwright-toolkit
```

Forgetting this is the most common source of "my fix didn't work" confusion.
