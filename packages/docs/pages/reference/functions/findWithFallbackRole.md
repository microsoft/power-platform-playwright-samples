[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / findWithFallbackRole

# Function: findWithFallbackRole()

> **findWithFallbackRole**(`page`, `roleQueries`, `opts`): `Promise`\<`Locator`\>

Defined in: utils/locator-helpers.ts:71

Find an element using multiple fallback role-based selectors
Similar to findWithFallback but for role-based queries

## Parameters

### page

`Page`

Playwright page

### roleQueries

`object`[]

Array of role query objects to try

### opts

Options including timeout

#### timeout?

`number`

## Returns

`Promise`\<`Locator`\>

The first matching locator

## Throws

Error if none of the role queries match

## Example

```typescript
const apps = await findWithFallbackRole(page, [
  { role: 'menuitem', name: 'Apps' },
  { role: 'link', name: 'Apps' },
]);
await apps.click();
```
