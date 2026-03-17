[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / FormComponent

# Class: FormComponent

Defined in: components/model-driven/form.component.ts:98

## Constructors

### Constructor

> **new FormComponent**(`page`): `FormComponent`

Defined in: components/model-driven/form.component.ts:99

#### Parameters

##### page

`Page`

#### Returns

`FormComponent`

## Methods

### getContext()

> **getContext**(): `Promise`\<[`FormContextData`](../interfaces/FormContextData.md)\>

Defined in: components/model-driven/form.component.ts:115

Get form context information
Returns entity name, ID, attributes, and form state

#### Returns

`Promise`\<[`FormContextData`](../interfaces/FormContextData.md)\>

FormContext data

#### Example

```typescript
const context = await form.getContext();
console.log('Entity:', context.entityName);
console.log('Record ID:', context.entityId);
console.log('Is Dirty:', context.isDirty);
```

***

### getAttribute()

> **getAttribute**(`attributeName`): `Promise`\<`any`\>

Defined in: components/model-driven/form.component.ts:132

Get attribute value from form

#### Parameters

##### attributeName

`string`

Logical name of the attribute

#### Returns

`Promise`\<`any`\>

Attribute value

#### Example

```typescript
const orderNumber = await form.getAttribute('nwind_ordernumber');
const status = await form.getAttribute('statuscode');
const customer = await form.getAttribute('customerid'); // Returns lookup object
```

***

### setAttribute()

> **setAttribute**(`attributeName`, `value`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:161

Set attribute value on form

#### Parameters

##### attributeName

`string`

Logical name of the attribute

##### value

`any`

Value to set

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Set text field
await form.setAttribute('nwind_ordernumber', 'TEST-12345');

// Set number field
await form.setAttribute('nwind_orderamount', 1500.50);

// Set date field
await form.setAttribute('nwind_orderdate', new Date());

// Set lookup field
await form.setAttribute('customerid', [{
  id: 'guid-here',
  name: 'Customer Name',
  entityType: 'account'
}]);
```

***

### getAllAttributes()

> **getAllAttributes**(): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: components/model-driven/form.component.ts:177

Get all attribute values from form

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

Object with all attribute names and values

#### Example

```typescript
const allData = await form.getAllAttributes();
console.log('Order Number:', allData.nwind_ordernumber);
console.log('Status:', allData.statuscode);
```

***

### save()

> **save**(`options?`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:198

Save the form

#### Parameters

##### options?

[`FormSaveOptions`](../interfaces/FormSaveOptions.md)

Save options

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Save and stay on form
await form.save();

// Save and close
await form.save({ saveMode: 'saveandclose' });

// Save and create new
await form.save({ saveMode: 'saveandnew' });
```

***

### isDirty()

> **isDirty**(): `Promise`\<`boolean`\>

Defined in: components/model-driven/form.component.ts:215

Check if form has unsaved changes

#### Returns

`Promise`\<`boolean`\>

true if form has unsaved changes

#### Example

```typescript
const hasChanges = await form.isDirty();
if (hasChanges) {
  await form.save();
}
```

***

### isValid()

> **isValid**(): `Promise`\<`boolean`\>

Defined in: components/model-driven/form.component.ts:232

Check if form data is valid

#### Returns

`Promise`\<`boolean`\>

true if all form data is valid

#### Example

```typescript
const valid = await form.isValid();
if (!valid) {
  console.log('Form has validation errors');
}
```

***

### refresh()

> **refresh**(`save`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:250

Refresh form data without reloading the page

#### Parameters

##### save

`boolean` = `false`

Whether to save before refreshing

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Refresh without saving
await form.refresh();

// Save and refresh
await form.refresh(true);
```

***

### execute()

> **execute**\<`T`\>(`fn`): `Promise`\<`T`\>

Defined in: components/model-driven/form.component.ts:276

Execute JavaScript in Model-Driven App context with access to Xrm

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

(`Xrm`) => `T`

Function to execute in browser context (receives Xrm object)

#### Returns

`Promise`\<`T`\>

Result from the executed function

#### Example

```typescript
// Get current user info
const userInfo = await form.execute((Xrm) => {
  return {
    userId: Xrm.Utility.getGlobalContext().userSettings.userId,
    userName: Xrm.Utility.getGlobalContext().userSettings.userName,
  };
});

// Show notification
await form.execute((Xrm) => {
  Xrm.Page.ui.setFormNotification('Record updated', 'INFO', 'test-notification');
});
```

***

### navigateToTab()

> **navigateToTab**(`options`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:294

Navigate to a specific tab on the form

#### Parameters

##### options

[`FormTabOptions`](../interfaces/FormTabOptions.md)

Tab navigation options

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Navigate to Details tab
await form.navigateToTab({ tab: 'DETAILS_TAB' });

// Navigate to tab by label
await form.navigateToTab({ tab: 'Details' });
```

***

### navigateToSection()

> **navigateToSection**(`options`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:325

Navigate to a specific section on the form

#### Parameters

##### options

[`FormSectionOptions`](../interfaces/FormSectionOptions.md)

Section navigation options

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Navigate to section
await form.navigateToSection({ section: 'ACCOUNT_INFORMATION' });
```

***

### waitForLoad()

> **waitForLoad**(`timeout`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:368

Wait for form to be fully loaded

#### Parameters

##### timeout

`number` = `30000`

Maximum wait time in milliseconds (default: 30000)

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await form.waitForLoad();
```

***

### getFieldControlType()

> **getFieldControlType**(`attributeName`): `Promise`\<`string`\>

Defined in: components/model-driven/form.component.ts:401

Get field control type

#### Parameters

##### attributeName

`string`

Logical name of the attribute

#### Returns

`Promise`\<`string`\>

Field control type

#### Example

```typescript
const controlType = await form.getFieldControlType('nwind_ordernumber');
console.log('Control type:', controlType);
```

***

### getFieldRequiredLevel()

> **getFieldRequiredLevel**(`attributeName`): `Promise`\<`string`\>

Defined in: components/model-driven/form.component.ts:426

Get field required level

#### Parameters

##### attributeName

`string`

Logical name of the attribute

#### Returns

`Promise`\<`string`\>

Required level: 'none', 'required', or 'recommended'

#### Example

```typescript
const requiredLevel = await form.getFieldRequiredLevel('nwind_ordernumber');
console.log('Required level:', requiredLevel);
```

***

### setFieldRequiredLevel()

> **setFieldRequiredLevel**(`attributeName`, `level`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:450

Set field required level

#### Parameters

##### attributeName

`string`

Logical name of the attribute

##### level

Required level: 'none', 'required', or 'recommended'

`"none"` | `"required"` | `"recommended"`

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await form.setFieldRequiredLevel('nwind_ordernumber', 'required');
```

***

### setFieldVisibility()

> **setFieldVisibility**(`attributeName`, `visible`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:479

Show/hide field on form

#### Parameters

##### attributeName

`string`

Logical name of the attribute

##### visible

`boolean`

true to show, false to hide

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await form.setFieldVisibility('nwind_ordernumber', false);
```

***

### setFieldDisabled()

> **setFieldDisabled**(`attributeName`, `disabled`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:505

Enable/disable field on form

#### Parameters

##### attributeName

`string`

Logical name of the attribute

##### disabled

`boolean`

true to disable, false to enable

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await form.setFieldDisabled('nwind_ordernumber', true);
```

***

### showNotification()

> **showNotification**(`message`, `level`, `uniqueId`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:532

Show form notification

#### Parameters

##### message

`string`

Notification message

##### level

Notification level: 'INFO', 'WARNING', 'ERROR'

`"INFO"` | `"WARNING"` | `"ERROR"`

##### uniqueId

`string`

Unique identifier for the notification

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await form.showNotification('Record updated successfully', 'INFO', 'update-notification');
```

***

### clearNotification()

> **clearNotification**(`uniqueId`): `Promise`\<`void`\>

Defined in: components/model-driven/form.component.ts:554

Clear form notification

#### Parameters

##### uniqueId

`string`

Unique identifier of the notification to clear

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await form.clearNotification('update-notification');
```

***

### getFormType()

> **getFormType**(): `Promise`\<`number`\>

Defined in: components/model-driven/form.component.ts:573

Get form type

#### Returns

`Promise`\<`number`\>

Form type: 0=Undefined, 1=Create, 2=Update, 3=Read Only, 4=Disabled, 6=Bulk Edit

#### Example

```typescript
const formType = await form.getFormType();
console.log('Form type:', formType);
```
