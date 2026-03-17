[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / findWithFallback

# Function: findWithFallback()

> **findWithFallback**(`page`, `selectors`, `opts`): `Promise`\<`Locator`\>

Defined in: utils/locator-helpers.ts:28

Find an element using multiple fallback selectors
Tries each selector in order until one is found

## Parameters

### page

`Page`

Playwright page

### selectors

`string`[]

Array of selectors to try in order

### opts

Options including timeout

#### timeout?

`number`

## Returns

`Promise`\<`Locator`\>

The first matching locator

## Throws

Error if none of the selectors match

## Example

```typescript
const login = await findWithFallback(page, [
  '#login',
  'button:has-text("Log In")',
  '[data-test="btn-login"]'
]);
await login.click();
```
