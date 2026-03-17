[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / CommandingComponent

# Class: CommandingComponent

Defined in: components/model-driven/commanding.component.ts:57

CommandingComponent for Model-Driven Apps
Provides methods for interacting with command bars

## Constructors

### Constructor

> **new CommandingComponent**(`page`): `CommandingComponent`

Defined in: components/model-driven/commanding.component.ts:58

#### Parameters

##### page

`Page`

#### Returns

`CommandingComponent`

## Methods

### clickButton()

> **clickButton**(`buttonName`, `options`): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:78

Click a command bar button by its name or aria-label

#### Parameters

##### buttonName

`string`

Button name or aria-label (e.g., 'New', 'Delete', 'Save', 'Refresh')

##### options

[`CommandBarButtonOptions`](../interfaces/CommandBarButtonOptions.md) = `{}`

Button click options

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Click New button
await commanding.clickButton('New');

// Click Delete button with overflow check
await commanding.clickButton('Delete', { checkOverflow: true });

// Click Save button and wait for it to be enabled
await commanding.clickButton('Save', { waitForEnabled: true });
```

---

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:125

Click the Refresh button to reload the page

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.refresh();
```

---

### clickNew()

> **clickNew**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:141

Click the New button to create a new record

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.clickNew();
// Wait for form to load
await page.waitForTimeout(3000);
```

---

### save()

> **save**(`waitForSave`): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:157

Click the Save button to save the current form

#### Parameters

##### waitForSave

`boolean` = `true`

Wait for save operation to complete

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.save();
await commanding.save({ waitForSave: true });
```

---

### saveAndClose()

> **saveAndClose**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:176

Click the Save & Close button

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.saveAndClose();
```

---

### clickDelete()

> **clickDelete**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:193

Click the Delete button
Note: This does not confirm the deletion dialog

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.clickDelete();
// Confirm deletion in dialog
await page.getByRole('button', { name: 'Delete' }).click();
```

---

### share()

> **share**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:207

Click the Share button

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.share();
// Handle share dialog
```

---

### assign()

> **assign**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:221

Click the Assign button

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.assign();
// Handle assign dialog
```

---

### deactivate()

> **deactivate**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:235

Click the Deactivate button

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.deactivate();
// Confirm in dialog if needed
```

---

### activate()

> **activate**(): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:248

Click the Activate button

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.activate();
```

---

### openOverflowMenu()

> **openOverflowMenu**(`context`): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:263

Open the overflow menu (... more commands)

#### Parameters

##### context

[`CommandBarContext`](../enumerations/CommandBarContext.md) = `CommandBarContext.Form`

Command bar context

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.openOverflowMenu();
```

---

### isButtonVisible()

> **isButtonVisible**(`buttonName`, `options`): `Promise`\<`boolean`\>

Defined in: components/model-driven/commanding.component.ts:293

Check if a command bar button is visible

#### Parameters

##### buttonName

`string`

Button name or aria-label

##### options

[`CommandBarButtonOptions`](../interfaces/CommandBarButtonOptions.md) = `{}`

Button options

#### Returns

`Promise`\<`boolean`\>

true if button is visible, false otherwise

#### Example

```typescript
const isDeleteVisible = await commanding.isButtonVisible('Delete');
if (isDeleteVisible) {
  await commanding.clickButton('Delete');
}
```

---

### isButtonEnabled()

> **isButtonEnabled**(`buttonName`, `options`): `Promise`\<`boolean`\>

Defined in: components/model-driven/commanding.component.ts:329

Check if a command bar button is enabled

#### Parameters

##### buttonName

`string`

Button name or aria-label

##### options

[`CommandBarButtonOptions`](../interfaces/CommandBarButtonOptions.md) = `{}`

Button options

#### Returns

`Promise`\<`boolean`\>

true if button is enabled, false otherwise

#### Example

```typescript
const isSaveEnabled = await commanding.isButtonEnabled('Save');
```

---

### waitForButton()

> **waitForButton**(`buttonName`, `timeout`): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:364

Wait for a command bar button to be visible

#### Parameters

##### buttonName

`string`

Button name or aria-label

##### timeout

[`TimeOut`](../enumerations/TimeOut.md) = `TimeOut.DefaultWaitTime`

Timeout in milliseconds

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await commanding.waitForButton('Save', 10000);
```

---

### executeCommand()

> **executeCommand**(`dataId`): `Promise`\<`void`\>

Defined in: components/model-driven/commanding.component.ts:381

Execute a custom command by clicking a button with specific data-id

#### Parameters

##### dataId

`string`

The data-id attribute of the command button

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Click a custom button
await commanding.executeCommand('mycompany.custombutton');
```

---

### getCommandBar()

> **getCommandBar**(): `Promise`\<`Locator`\>

Defined in: components/model-driven/commanding.component.ts:399

Get the main command bar locator

#### Returns

`Promise`\<`Locator`\>

Command bar container locator

#### Example

```typescript
const commandBar = await commanding.getCommandBar();
const buttons = await commandBar.locator('button').all();
```
