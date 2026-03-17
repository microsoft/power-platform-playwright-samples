[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / buildCanvasAppUrlFromEnv

# Function: buildCanvasAppUrlFromEnv()

> **buildCanvasAppUrlFromEnv**(): `string`

Defined in: utils/app-helpers.ts:184

Build Canvas App Play URL from environment variables
Reads from process.env:

- CANVAS_APP_URL (direct URL), OR
- POWER_APPS_ENVIRONMENT_ID + CANVAS_APP_ID + CANVAS_APP_TENANT_ID

## Returns

`string`

Canvas App play URL

## Throws

If required environment variables are not set

## Example

```typescript
// Set environment variables in .env file:
// CANVAS_APP_URL=https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id
// OR
// POWER_APPS_ENVIRONMENT_ID=d413c445-44c5-ed7c-be0f-761eaeee1919
// CANVAS_APP_ID=8f6e67b9-93af-4cf4-b1f0-b6b25c20e2dc
// CANVAS_APP_TENANT_ID=91bee3d9-0c15-4f17-8624-c92bb8b36ead

const url = buildCanvasAppUrlFromEnv();
```
