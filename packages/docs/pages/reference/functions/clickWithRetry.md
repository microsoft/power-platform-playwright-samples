[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / clickWithRetry

# Function: clickWithRetry()

> **clickWithRetry**(`page`, `selector`, `retries`): `Promise`\<`void`\>

Defined in: utils/app-helpers.ts:249

Click element with retry logic

## Parameters

### page

`Page`

Playwright page object

### selector

`string`

Element selector

### retries

`number` = `3`

Number of retries (default: 3)

## Returns

`Promise`\<`void`\>
