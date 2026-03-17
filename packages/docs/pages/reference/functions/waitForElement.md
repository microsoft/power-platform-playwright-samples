[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / waitForElement

# Function: waitForElement()

> **waitForElement**(`page`, `selector`, `timeout`): `Promise`\<`Locator`\>

Defined in: utils/app-helpers.ts:199

Wait for element to be visible with custom timeout

## Parameters

### page

`Page`

Playwright page object

### selector

`string`

Element selector

### timeout

`number` = `30000`

Timeout in milliseconds (default: 30000)

## Returns

`Promise`\<`Locator`\>
