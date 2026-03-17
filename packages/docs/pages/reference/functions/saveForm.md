[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / saveForm

# Function: saveForm()

> **saveForm**(`page`, `options?`): `Promise`\<`void`\>

Defined in: components/model-driven/form.context.ts:223

Save the form

## Parameters

### page

`Page`

Playwright page object

### options?

Save options

#### saveMode?

`"saveandclose"` \| `"saveandnew"`

Save mode: 'saveandclose' or 'saveandnew'

## Returns

`Promise`\<`void`\>

## Example

```typescript
// Save and stay on form
await saveForm(page);

// Save and close
await saveForm(page, { saveMode: 'saveandclose' });

// Save and create new
await saveForm(page, { saveMode: 'saveandnew' });
```
