# Northwind Canvas App Tests

End-to-end tests for the **Northwind Orders Canvas App**.

## Test Files

| File                      | What it tests                                                         |
| ------------------------- | --------------------------------------------------------------------- |
| `canvas-app-crud.test.ts` | Full CRUD — create, read, update, delete order records in the gallery |

## Environment Variables

```bash
# Option A: component IDs (recommended)
CANVAS_APP_ID=your-canvas-app-id
CANVAS_APP_TENANT_ID=your-tenant-id
POWER_APPS_ENVIRONMENT_ID=Default-00000000-0000-0000-0000-000000000000

# Option B: full play URL (takes precedence)
# CANVAS_APP_URL=https://apps.powerapps.com/play/e/<env-id>/a/<app-id>?tenantId=<tenant-id>

MS_AUTH_EMAIL=user@contoso.com
```

**Get your Canvas App ID:** Open the app in Maker Portal → click **Details** → copy **App ID**.

## Authentication

```bash
cd packages/e2e-tests
npm run auth:headful
```

## Running

```bash
# All canvas tests
npx playwright test --project=canvas

# Single file
npx playwright test tests/northwind/canvas/canvas-app-crud.test.ts

# Headed
npx playwright test --project=canvas --headed
```

## Key Patterns

### AppProvider launch

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({
  app: 'Northwind Orders',
  type: AppType.Canvas,
  directUrl: process.env.CANVAS_APP_URL!,
  skipMakerPortal: true,
});
const canvasApp = appProvider.getCanvasAppPage();
```

### Canvas controls (inside iframe)

Canvas controls live inside `iframe[name="fullscreen-app-host"]`. The toolkit handles this
automatically through `CanvasAppPage` methods:

```typescript
await canvasApp.clickControl('IconNewItem1');
await canvasApp.fillTextInput('OrderNumber_DataCard1', 'TEST-001');
const count = await canvasApp.getGalleryItemCount('Gallery1');
```

### Finding control names

Inspect your app in play mode (F12) and look for `data-control-name` attributes.

See the [Canvas Apps guide](https://microsoft.github.io/power-platform-playwright-samples/guide/canvas-apps)
for full documentation.
