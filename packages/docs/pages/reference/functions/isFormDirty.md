[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / isFormDirty

# Function: isFormDirty()

> **isFormDirty**(`page`): `Promise`\<`boolean`\>

Defined in: components/model-driven/form.context.ts:261

Check if form is dirty (has unsaved changes)

## Parameters

### page

`Page`

Playwright page object

## Returns

`Promise`\<`boolean`\>

true if form has unsaved changes

## Example

```typescript
const hasChanges = await isFormDirty(page);
if (hasChanges) {
  await saveForm(page);
}
```
