[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / generateRandomNumber

# Function: generateRandomNumber()

> **generateRandomNumber**(`min`, `max`): `number`

Defined in: utils/app-helpers.ts:48

Generate random number within a range

## Parameters

### min

`number`

Minimum value (inclusive)

### max

`number`

Maximum value (inclusive)

## Returns

`number`

Random number between min and max

## Example

```typescript
// Generate number between 1 and 100
const num = generateRandomNumber(1, 100);

// Generate 5-digit number (10000-99999)
const orderNum = generateRandomNumber(10000, 99999);
```
