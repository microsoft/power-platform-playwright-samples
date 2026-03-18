[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / refreshForm

# Function: refreshForm()

> **refreshForm**(`page`, `save`): `Promise`\<`void`\>

Defined in: components/model-driven/form.context.ts:310

Refresh form data without reloading the page

## Parameters

### page

`Page`

Playwright page object

### save

`boolean` = `false`

Whether to save before refreshing

## Returns

`Promise`\<`void`\>

## Example

```typescript
// Refresh without saving
await refreshForm(page);

// Save and refresh
await refreshForm(page, true);
```
