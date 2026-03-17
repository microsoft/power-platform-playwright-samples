[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / ControlOptions

# Interface: ControlOptions

Defined in: types/index.ts:87

Control Locator Options

## Properties

### name

> **name**: `string`

Defined in: types/index.ts:89

Control name (aria-label or name attribute)

---

### type?

> `optional` **type**: [`CanvasControlType`](../enumerations/CanvasControlType.md)

Defined in: types/index.ts:91

Control type (Button, TextInput, etc.)

---

### timeout?

> `optional` **timeout**: `number`

Defined in: types/index.ts:93

Timeout in milliseconds (default: 10000)

---

### exact?

> `optional` **exact**: `boolean`

Defined in: types/index.ts:95

Exact text match (default: false)
