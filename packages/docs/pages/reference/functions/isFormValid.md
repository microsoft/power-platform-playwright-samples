[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / isFormValid

# Function: isFormValid()

> **isFormValid**(`page`): `Promise`\<`boolean`\>

Defined in: components/model-driven/form.context.ts:285

Check if form data is valid

## Parameters

### page

`Page`

Playwright page object

## Returns

`Promise`\<`boolean`\>

true if all form data is valid

## Example

```typescript
const valid = await isFormValid(page);
if (!valid) {
  console.log('Form has validation errors');
}
```
