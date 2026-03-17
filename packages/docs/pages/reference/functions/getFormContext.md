[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / getFormContext

# Function: getFormContext()

> **getFormContext**(`page`): `Promise`\<[`FormContextData`](../interfaces/FormContextData.md)\>

Defined in: components/model-driven/form.context.ts:68

Get formContext information from Model-Driven App

This method extracts key information from the formContext object available
in the Model-Driven App client-side context.

## Parameters

### page

`Page`

Playwright page object

## Returns

`Promise`\<[`FormContextData`](../interfaces/FormContextData.md)\>

FormContext data including entity name, ID, and attributes

## Example

```typescript
const formContext = await getFormContext(page);
console.log('Editing:', formContext.entityName);
console.log('Record ID:', formContext.entityId);
console.log('Form dirty:', formContext.isDirty);
```
