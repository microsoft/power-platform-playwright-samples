[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / getEntityAttribute

# Function: getEntityAttribute()

> **getEntityAttribute**(`page`, `attributeName`): `Promise`\<`any`\>

Defined in: components/model-driven/form.context.ts:108

Get attribute value from form

## Parameters

### page

`Page`

Playwright page object

### attributeName

`string`

Logical name of the attribute (e.g., 'nwind_ordernumber')

## Returns

`Promise`\<`any`\>

Attribute value (can be string, number, boolean, Date, lookup object, etc.)

## Example

```typescript
const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
const status = await getEntityAttribute(page, 'statuscode');
const customer = await getEntityAttribute(page, 'customerid'); // Returns lookup object
```
