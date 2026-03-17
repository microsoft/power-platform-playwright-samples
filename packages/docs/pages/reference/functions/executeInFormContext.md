[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / executeInFormContext

# Function: executeInFormContext()

> **executeInFormContext**\<`T`\>(`page`, `fn`): `Promise`\<`T`\>

Defined in: components/model-driven/form.context.ts:349

Execute JavaScript in Model-Driven App context with access to Xrm

This is a low-level method that allows running arbitrary JavaScript
in the Model-Driven App context where Xrm and formContext are available.

## Type Parameters

### T

`T`

## Parameters

### page

`Page`

Playwright page object

### fn

(`Xrm`) => `T`

Function to execute in browser context (receives Xrm object)

## Returns

`Promise`\<`T`\>

Result from the executed function

## Example

```typescript
// Get current user info
const userInfo = await executeInFormContext(page, (Xrm) => {
  return {
    userId: Xrm.Utility.getGlobalContext().userSettings.userId,
    userName: Xrm.Utility.getGlobalContext().userSettings.userName,
  };
});

// Show notification
await executeInFormContext(page, (Xrm) => {
  Xrm.Page.ui.setFormNotification('Record updated', 'INFO', 'test-notification');
});
```
