<div align="center">
  <h1><strong>Power Platform Playwright Samples</strong></h1>

[![Build Status](https://github.com/microsoft/power-platform-playwright-samples/actions/workflows/ci.yml/badge.svg)](https://github.com/microsoft/power-platform-playwright-samples/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/power-platform-playwright-toolkit.svg)](https://www.npmjs.com/package/power-platform-playwright-toolkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%2B-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57%2B-green)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)

  <p><strong>Official Playwright automation toolkit and sample tests for Microsoft Power Platform</strong></p>
  <p>A production-ready testing framework for Canvas Apps, Model-Driven Apps, Custom Pages, and Gen UX — with built-in Microsoft authentication, intelligent waiters, and a composable Page Object Model.</p>
</div>

---

## Packages

This monorepo contains three packages:

| Package                                                                                      | Description                                                          |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`packages/power-platform-playwright-toolkit/`](packages/power-platform-playwright-toolkit/) | Core library — publish to npm as `power-platform-playwright-toolkit` |
| [`packages/e2e-tests/`](packages/e2e-tests/)                                                 | Sample tests demonstrating real-world usage patterns                 |
| [`packages/docs/`](packages/docs/)                                                           | Documentation site (Nextra/Next.js)                                  |

---

## Architecture

```
Your Test Project
      │
      │  npm install power-platform-playwright-toolkit
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

## Quick Start

### Install

```bash
npm install power-platform-playwright-toolkit playwright-ms-auth @playwright/test --save-dev
```

### Write a test

```typescript
import { test, expect } from '@playwright/test';
import { AppProvider, AppType } from 'power-platform-playwright-toolkit';

test('open account record', async ({ page, context }) => {
  const appProvider = new AppProvider(page, context);

  await appProvider.launch({
    app: 'Accounts',
    type: AppType.ModelDriven,
    directUrl: process.env.MODEL_DRIVEN_APP_URL!,
    skipMakerPortal: true,
  });

  const app = appProvider.getModelDrivenAppPage();
  await app.grid.navigateToGridView();

  const count = await app.grid.getRowCount();
  expect(count).toBeGreaterThan(0);
});
```

### Supported app types

| `AppType`             | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `AppType.ModelDriven` | Dynamics 365 / Model-Driven Apps                           |
| `AppType.Canvas`      | Power Apps Canvas Apps                                     |
| `AppType.PowerApps`   | Maker Portal (`make.powerapps.com`) — also used for Gen UX |

---

## Key Features

- **AppProvider pattern** — single entry point for all app types, handles launch, auth, and navigation
- **ModelDrivenAppPage** — grid navigation, form interactions, FormContext API, commanding
- **CanvasAppPage** — control interactions, screen navigation, gallery helpers
- **GenUxPage** — test AI-generated apps in-designer (UCI Preview iframe) or as played Canvas Apps
- **Microsoft auth** — storage state management via `playwright-ms-auth`, MSAL token validation
- **Page waiters** — `AppRuntimeWaiter`, `HomePageWaiter`, `SolutionsPageWaiter`, etc.
- **FormContext API** — `getEntityAttribute`, `setEntityAttribute`, `saveForm`, `isFormDirty`, `executeInFormContext`
- **URL builders** — `buildCanvasAppUrl`, `buildCanvasAppUrlFromEnv`, `URLBuilder` for Maker Portal

---

## Getting Started from Source

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

```bash
cd packages/e2e-tests

# Authenticate (first time — opens browser)
npm run auth:headful

# Run all tests
npx playwright test

# Run a specific project
npx playwright test --project=mda
npx playwright test --project=canvas
npx playwright test --project=gen-ux
```

---

## Monorepo Structure

```
power-platform-playwright-samples/
├── packages/
│   ├── power-platform-playwright-toolkit/  # npm library
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
│   └── docs/                   # Documentation site (Nextra)
├── common/                     # Rush configuration
├── rush.json
└── .github/workflows/          # CI/CD pipelines
```

---

## Documentation

Full documentation: **https://microsoft.github.io/power-platform-playwright-samples/**

Key guides:

- [Getting Started](https://microsoft.github.io/power-platform-playwright-samples/guide/getting-started)
- [Project Setup](https://microsoft.github.io/power-platform-playwright-samples/guide/setup)
- [Authentication](https://microsoft.github.io/power-platform-playwright-samples/guide/authentication)
- [Model-Driven Apps](https://microsoft.github.io/power-platform-playwright-samples/guide/model-driven-apps)
- [Canvas Apps](https://microsoft.github.io/power-platform-playwright-samples/guide/canvas-apps)
- [Gen UX Testing](https://microsoft.github.io/power-platform-playwright-samples/guide/gen-ux)
- [API Reference](https://microsoft.github.io/power-platform-playwright-samples/reference)

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and follow the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make changes in `packages/power-platform-playwright-toolkit/src/`
4. Build: `rush build`
5. Test: `cd packages/e2e-tests && npx playwright test`
6. Submit a pull request to `main`

---

## License

MIT © Microsoft Corporation — see [LICENSE](LICENSE).

---

## Support

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/microsoft/power-platform-playwright-samples/issues)
- **Documentation**: [https://microsoft.github.io/power-platform-playwright-samples/](https://microsoft.github.io/power-platform-playwright-samples/)
- **Microsoft Open Source**: [https://opensource.microsoft.com/](https://opensource.microsoft.com/)
