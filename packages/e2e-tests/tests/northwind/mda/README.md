# Northwind MDA Tests

End-to-end tests for the **Northwind Orders Model-Driven App**.

## Test Files

| File | What it tests |
|------|--------------|
| `model-driven-crud.test.ts` | Full CRUD lifecycle — create, read, update, delete order records |
| `model-driven-direct-url.test.ts` | Direct URL navigation to grid/form views |
| `form-context.test.ts` | FormContext API — read/write entity attributes, save, dirty/valid state |
| `custom-page.test.ts` | Custom Page embedded in the MDA |
| `custom-page-crud.test.ts` | CRUD operations on a Custom Page |

## Environment Variables

```bash
MODEL_DRIVEN_APP_URL=https://your-org.crm.dynamics.com/main.aspx?appid=your-app-id
MS_AUTH_EMAIL=user@contoso.com
```

## Authentication

MDA tests use a separate storage state for the `*.crm.dynamics.com` domain:

```bash
cd packages/e2e-tests
npm run auth:mda:headful
```

## Running

```bash
# All MDA tests
npx playwright test --project=mda

# Single file
npx playwright test tests/northwind/mda/form-context.test.ts

# Headed (see browser)
npx playwright test --project=mda --headed
```

## Key Patterns

### AppProvider launch

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({
  app: 'Northwind Orders',
  type: AppType.ModelDriven,
  directUrl: process.env.MODEL_DRIVEN_APP_URL!,
  skipMakerPortal: true,
});
const app = appProvider.getModelDrivenAppPage();
```

### GridComponent

```typescript
await app.grid.navigateToGridView();
await app.grid.waitForGridLoad();
const count = await app.grid.getRowCount();
await app.grid.openRecord({ rowNumber: 0 });
```

### FormContext API

```typescript
import { getFormContext, getEntityAttribute, setEntityAttribute, saveForm } from 'power-platform-playwright-toolkit';

const ctx = await getFormContext(page);
const value = await getEntityAttribute(page, 'nwind_ordernumber');
await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-001');
await saveForm(page);
```

See the [Model-Driven Apps guide](https://microsoft.github.io/power-platform-playwright-samples/guide/model-driven-apps)
for full documentation.
