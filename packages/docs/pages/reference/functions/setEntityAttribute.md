[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / setEntityAttribute

# Function: setEntityAttribute()

> **setEntityAttribute**(`page`, `attributeName`, `value`): `Promise`\<`void`\>

Defined in: components/model-driven/form.context.ts:150

Set attribute value on form

## Parameters

### page

`Page`

Playwright page object

### attributeName

`string`

Logical name of the attribute

### value

`any`

Value to set (type depends on attribute type)

## Returns

`Promise`\<`void`\>

## Example

```typescript
// Set text field
await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-12345');

// Set number field
await setEntityAttribute(page, 'nwind_orderamount', 1500.5);

// Set date field
await setEntityAttribute(page, 'nwind_orderdate', new Date());

// Set lookup field
await setEntityAttribute(page, 'customerid', [
  {
    id: 'guid-here',
    name: 'Customer Name',
    entityType: 'account',
  },
]);
```
