[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / generateUniqueTestId

# Function: generateUniqueTestId()

> **generateUniqueTestId**(`prefix`): `string`

Defined in: utils/app-helpers.ts:87

Generate unique test ID with timestamp and random component
Useful for generating unique identifiers in tests

## Parameters

### prefix

`string` = `'TEST'`

Prefix for the ID (default: 'TEST')

## Returns

`string`

Unique test ID

## Example

```typescript
const testId = generateUniqueTestId(); // "TEST-1234567890-123"
const testId = generateUniqueTestId('ORDER'); // "ORDER-1234567890-123"
```
