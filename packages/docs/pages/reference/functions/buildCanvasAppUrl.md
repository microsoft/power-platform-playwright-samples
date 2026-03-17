[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / buildCanvasAppUrl

# Function: buildCanvasAppUrl()

> **buildCanvasAppUrl**(`options`): `string`

Defined in: utils/app-helpers.ts:136

Build Canvas App Play URL from direct URL or component IDs
Supports two modes:
1. Direct URL: Use directUrl if provided
2. Build from IDs: Use environmentId + appId + tenantId

## Parameters

### options

[`CanvasAppUrlOptions`](../interfaces/CanvasAppUrlOptions.md)

Canvas App URL options or environment variable prefix

## Returns

`string`

Canvas App play URL

## Throws

If neither direct URL nor required component IDs are provided

## Example

```typescript
// Option 1: Using direct URL
const url = buildCanvasAppUrl({
  directUrl: 'https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id'
});

// Option 2: Building from component IDs
const url = buildCanvasAppUrl({
  environmentId: 'd413c445-44c5-ed7c-be0f-761eaeee1919',
  appId: '8f6e67b9-93af-4cf4-b1f0-b6b25c20e2dc',
  tenantId: '91bee3d9-0c15-4f17-8624-c92bb8b36ead'
});

// Option 3: From environment variables
const url = buildCanvasAppUrlFromEnv();
// Reads from: CANVAS_APP_URL, POWER_APPS_ENVIRONMENT_ID, CANVAS_APP_ID, CANVAS_APP_TENANT_ID
```
