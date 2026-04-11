# Sample E2E Tests

Sample Playwright tests for Microsoft Power Platform applications, demonstrating how to use
`power-platform-playwright-toolkit` to test Canvas Apps, Model-Driven Apps, and Gen UX.

## Prerequisites

- Node.js 20+
- A Microsoft 365 tenant with Power Apps access
- [Northwind Traders solution](https://learn.microsoft.com/power-apps/maker/canvas-apps/northwind-install)
  installed in your environment (for Northwind tests)

## Setup

### 1. Install dependencies

From the repo root:

```bash
rush install
rush build
```

Or from this directory:

```bash
npm install
```

### 2. Configure environment

```bash
cp .envcopy .env
```

Edit `.env` with your values:

```bash
# Authentication
MS_AUTH_EMAIL=user@contoso.com

# Power Apps
POWER_APPS_BASE_URL=https://make.powerapps.com
POWER_APPS_ENVIRONMENT_ID=Default-00000000-0000-0000-0000-000000000000

# Canvas App (Option A: component IDs)
CANVAS_APP_ID=your-canvas-app-id
CANVAS_APP_TENANT_ID=your-tenant-id

# Canvas App (Option B: full play URL — takes precedence over IDs)
# CANVAS_APP_URL=https://apps.powerapps.com/play/e/<env-id>/a/<app-id>?tenantId=<tenant-id>

# Model-Driven App
MODEL_DRIVEN_APP_URL=https://your-org.crm.dynamics.com/main.aspx?appid=your-app-id

# Gen UX (optional — defaults to POWER_APPS_BASE_URL)
# MAKER_PORTAL_URL=https://make.preview.powerapps.com
```

### 3. Authenticate

**Canvas Apps and Maker Portal:**

```bash
npm run auth:headful
```

**Model-Driven Apps** (separate storage state for the Dynamics domain):

```bash
npm run auth:mda:headful
```

Authentication tokens are saved under `.playwright-ms-auth/`. Storage state is valid for **24 hours** — re-run authentication when tests fail with auth errors.

## Project Structure

```
e2e-tests/
├── globals/
│   ├── global-setup.ts          # Validates auth state before all tests
│   └── global-teardown.ts
├── pages/northwind/
│   ├── NorthwindCanvasAppPage.ts    # Custom POM for Northwind Canvas App
│   ├── NorthwindModelDrivenAppPage.ts # Custom POM for Northwind MDA
│   └── CustomPage.page.ts
├── tests/
│   ├── northwind/
│   │   ├── canvas/
│   │   │   └── canvas-app-crud.test.ts          # Canvas CRUD
│   │   └── mda/
│   │       ├── model-driven-crud.test.ts         # MDA CRUD
│   │       ├── model-driven-direct-url.test.ts   # Direct URL navigation
│   │       ├── form-context.test.ts              # FormContext API
│   │       ├── custom-page.test.ts               # Custom Pages
│   │       └── custom-page-crud.test.ts
│   └── gen-ux/
│       └── basic-form/
│           └── basic-form.test.ts                # Gen UX form generation
├── utils/
│   ├── common.ts                # Shared utilities
│   ├── test-fixtures.ts         # Playwright fixture extensions
│   ├── validate-auth-state.ts   # Auth token validation
│   ├── northwind/constants.ts   # Northwind-specific constants
│   └── gen-ux/
│       ├── gen-ux-utils.ts      # findFormInput helper
│       └── shared-test-steps.ts # Reusable Gen UX setup/teardown
├── examples/
│   └── form-context-example.ts  # Standalone FormContext examples
├── scripts/
│   └── authenticate.ts          # Auth script (--mda, --headful flags)
├── playwright.config.ts
└── .envcopy                     # Environment variable template
```

## Running Tests

```bash
# All tests
npx playwright test

# By project
npx playwright test --project=model-driven-app
npx playwright test --project=canvas-app
npx playwright test --project=gen-ux

# Specific file
npx playwright test tests/northwind/mda/model-driven-crud.test.ts

# With visible browser
npx playwright test --headed --project=mda

# Debug mode
npx playwright test --debug tests/northwind/mda/form-context.test.ts

# UI mode
npx playwright test --ui
```

## Test Projects

Defined in `playwright.config.ts`:

| Project            | Test directory            | Auth storage state       |
| ------------------ | ------------------------- | ------------------------ |
| `model-driven-app` | `tests/northwind/mda/`    | `state-mda-{email}.json` |
| `canvas-app`       | `tests/northwind/canvas/` | `state-{email}.json`     |
| `gen-ux`           | `tests/gen-ux/`           | `state-{email}.json`     |

## What the Tests Cover

### Model-Driven App (`tests/northwind/mda/`)

- **CRUD** — create, read, update, delete Northwind order records
- **Direct URL navigation** — `navigateToGridView`, `navigateToFormView` patterns
- **FormContext API** — read/write entity attributes, save form, check dirty/valid state
- **Custom Pages** — test pages embedded in Model-Driven Apps

### Canvas App (`tests/northwind/canvas/`)

- **CRUD** — create, read, update, delete orders in Northwind Canvas App
- Gallery interaction, form fill, iframe (`fullscreen-app-host`) scoping

### Gen UX (`tests/gen-ux/`)

- Generate a Canvas App from an AI prompt via the Maker Portal
- Verify generated form fields in the UCI Preview iframe
- Submit form and assert success

## Troubleshooting

| Problem                                                  | Fix                                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Auth errors / token expired                              | Delete `state-*.json` and re-run `npm run auth:headful`                      |
| MDA tests fail auth                                      | Run `npm run auth:mda:headful`                                               |
| `MODEL_DRIVEN_APP_URL` not set                           | Set it in `.env`                                                             |
| Canvas app not loading                                   | Increase `timeout` in `playwright.config.ts`; Canvas apps take 5–10s to load |
| `Cannot find module 'power-platform-playwright-toolkit'` | Run `rush build` from repo root                                              |
| Gen UX tests slow / timeout                              | AI generation takes up to 120s — this is expected                            |

## Learn More

- [Setup Guide](https://microsoft.github.io/power-platform-playwright-samples/guide/setup)
- [Authentication Guide](https://microsoft.github.io/power-platform-playwright-samples/guide/authentication)
- [Model-Driven Apps Guide](https://microsoft.github.io/power-platform-playwright-samples/guide/model-driven-apps)
- [Canvas Apps Guide](https://microsoft.github.io/power-platform-playwright-samples/guide/canvas-apps)
- [Gen UX Guide](https://microsoft.github.io/power-platform-playwright-samples/guide/gen-ux)
