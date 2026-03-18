[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / generateUniqueOrderNumber

# Function: generateUniqueOrderNumber()

> **generateUniqueOrderNumber**(`digits`): `string`

Defined in: utils/app-helpers.ts:68

Generate unique order number (5-digit random number)
Useful for test data generation in Model-Driven Apps and Canvas Apps

## Parameters

### digits

`number` = `5`

Number of digits (default: 5)

## Returns

`string`

Random number as string with specified digits

## Example

```typescript
// Generate 5-digit order number
const orderNumber = generateUniqueOrderNumber(); // "12345"

// Generate 6-digit order number
const orderNumber = generateUniqueOrderNumber(6); // "123456"
```
