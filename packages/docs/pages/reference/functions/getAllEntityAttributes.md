[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / getAllEntityAttributes

# Function: getAllEntityAttributes()

> **getAllEntityAttributes**(`page`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: components/model-driven/form.context.ts:186

Get all attribute values from form

## Parameters

### page

`Page`

Playwright page object

## Returns

`Promise`\<`Record`\<`string`, `any`\>\>

Object with all attribute names and values

## Example

```typescript
const allData = await getAllEntityAttributes(page);
console.log('Order Number:', allData.nwind_ordernumber);
console.log('Status:', allData.statuscode);
```
