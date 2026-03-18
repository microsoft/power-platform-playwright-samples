[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / ModelDrivenAppPage

# Class: ModelDrivenAppPage

Defined in: pages/model-driven-app.page.ts:15

## Constructors

### Constructor

> **new ModelDrivenAppPage**(`page`, `baseAppUrl?`): `ModelDrivenAppPage`

Defined in: pages/model-driven-app.page.ts:33

#### Parameters

##### page

`Page`

##### baseAppUrl?

`string`

#### Returns

`ModelDrivenAppPage`

## Properties

### page

> `readonly` **page**: `Page`

Defined in: pages/model-driven-app.page.ts:16

---

### appType

> `readonly` **appType**: `"ModelDriven"` = `'ModelDriven'`

Defined in: pages/model-driven-app.page.ts:987

## Accessors

### grid

#### Get Signature

> **get** **grid**(): [`GridComponent`](GridComponent.md)

Defined in: pages/model-driven-app.page.ts:136

Get GridComponent for advanced grid operations
Lazily initialized on first access

##### Example

```typescript
// Use grid component directly
await modelDrivenApp.grid.openRecord({ rowNumber: 0 });
await modelDrivenApp.grid.selectRow(1);
const value = await modelDrivenApp.grid.getCellValue(0, 'Order Number');
```

##### Returns

[`GridComponent`](GridComponent.md)

---

### form

#### Get Signature

> **get** **form**(): [`FormComponent`](FormComponent.md)

Defined in: pages/model-driven-app.page.ts:158

Get FormComponent for advanced form operations
Lazily initialized on first access

##### Example

```typescript
// Use form component directly
const context = await modelDrivenApp.form.getContext();
console.log('Entity:', context.entityName);

const orderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
await modelDrivenApp.form.setAttribute('nwind_ordernumber', 'TEST-12345');
await modelDrivenApp.form.save();
```

##### Returns

[`FormComponent`](FormComponent.md)

---

### commanding

#### Get Signature

> **get** **commanding**(): [`CommandingComponent`](CommandingComponent.md)

Defined in: pages/model-driven-app.page.ts:177

Get CommandingComponent for command bar operations
Lazily initialized on first access

##### Example

```typescript
// Use commanding component directly
await modelDrivenApp.commanding.clickButton('New');
await modelDrivenApp.commanding.refresh();
await modelDrivenApp.commanding.save();
```

##### Returns

[`CommandingComponent`](CommandingComponent.md)

## Methods

### setBaseAppUrl()

> **setBaseAppUrl**(`url`): `void`

Defined in: pages/model-driven-app.page.ts:89

Set the base app URL for navigation

#### Parameters

##### url

`string`

Base URL of the Model-Driven App (e.g., 'https://org.crm.dynamics.com/main.aspx?appid=abc-123')

#### Returns

`void`

---

### getBaseAppUrl()

> **getBaseAppUrl**(): `string`

Defined in: pages/model-driven-app.page.ts:97

Get the base app URL
Falls back to current page URL origin if not set

#### Returns

`string`

---

### navigateToHome()

> **navigateToHome**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:191

Navigate to Power Apps home page

#### Returns

`Promise`\<`void`\>

---

### navigateToGridView()

> **navigateToGridView**(`entityName`, `options?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:215

Navigate to grid/list view for a specific entity
Constructs URL to navigate directly to entity grid view

#### Parameters

##### entityName

`string`

Logical name of the entity (e.g., 'account', 'contact', 'nwind_order')

##### options?

Navigation options

###### appId?

`string`

Optional app ID to include in URL

###### viewId?

`string`

Optional view ID to load specific view

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Navigate to accounts grid
await modelDrivenApp.navigateToGridView('account');

// Navigate to custom entity grid
await modelDrivenApp.navigateToGridView('nwind_order');

// Navigate to specific view
await modelDrivenApp.navigateToGridView('account', { viewId: 'view-guid' });
```

---

### navigateToFormView()

> **navigateToFormView**(`entityName`, `options?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:289

Navigate to form view for a specific entity
Can navigate to create new record or edit existing record

#### Parameters

##### entityName

`string`

Logical name of the entity (e.g., 'account', 'contact', 'nwind_order')

##### options?

Navigation options

###### recordId?

`string`

Optional record ID to edit existing record (if omitted, opens new record form)

###### appId?

`string`

Optional app ID to include in URL

###### formId?

`string`

Optional form ID to load specific form

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Navigate to new record form
await modelDrivenApp.navigateToFormView('account');

// Navigate to existing record form
await modelDrivenApp.navigateToFormView('account', { recordId: 'record-guid' });

// Navigate to specific form
await modelDrivenApp.navigateToFormView('contact', { formId: 'form-guid' });
```

---

### waitForHomePageLoad()

> **waitForHomePageLoad**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:354

Wait for home page to load

#### Returns

`Promise`\<`void`\>

---

### waitForDesignerLoad()

> **waitForDesignerLoad**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:364

Wait for App Designer to load

#### Returns

`Promise`\<`void`\>

---

### waitForLoadingComplete()

> **waitForLoadingComplete**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:374

Wait for loading spinner to disappear

#### Returns

`Promise`\<`void`\>

---

### waitForRuntimeLoad()

> **waitForRuntimeLoad**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:384

Wait for app runtime to load

#### Returns

`Promise`\<`void`\>

---

### openRecordFromGrid()

> **openRecordFromGrid**(`options`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:412

Open a record from the grid view
Convenience method that delegates to GridComponent

#### Parameters

##### options

[`GridRecordOptions`](../interfaces/GridRecordOptions.md)

Record selection options

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Open first record
await modelDrivenApp.openRecordFromGrid({ rowNumber: 0 });

// Open record by column value
await modelDrivenApp.openRecordFromGrid({
  columnValue: 'TEST-123',
  columnName: 'Order Number',
});
```

---

### selectGridRow()

> **selectGridRow**(`rowNumber`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:422

Select a row in the grid
Convenience method that delegates to GridComponent

#### Parameters

##### rowNumber

`number`

Row index (0-based)

#### Returns

`Promise`\<`void`\>

---

### getGridCellValue()

> **getGridCellValue**(`row`, `column`): `Promise`\<`string`\>

Defined in: pages/model-driven-app.page.ts:434

Get cell value from grid
Convenience method that delegates to GridComponent

#### Parameters

##### row

`number`

Row index (0-based)

##### column

`string`

Column name

#### Returns

`Promise`\<`string`\>

Cell text content

---

### createBlankModelDrivenApp()

> **createBlankModelDrivenApp**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:446

Create a blank Model Driven app

#### Parameters

##### appName

`string`

Name for the app

#### Returns

`Promise`\<`void`\>

---

### createFromSolution()

> **createFromSolution**(`solutionName`, `appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:458

Create Model Driven app from solution

#### Parameters

##### solutionName

`string`

Name of the solution

##### appName

`string`

Name for the app

#### Returns

`Promise`\<`void`\>

---

### filterByModelDrivenApps()

> **filterByModelDrivenApps**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:469

Filter apps by Model Driven type

#### Returns

`Promise`\<`void`\>

---

### setAppName()

> **setAppName**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:482

Set app name

#### Parameters

##### appName

`string`

Name for the app

#### Returns

`Promise`\<`void`\>

---

### saveApp()

> **saveApp**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:492

Save the Model Driven app

#### Returns

`Promise`\<`void`\>

---

### publishApp()

> **publishApp**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:500

Publish the Model Driven app

#### Returns

`Promise`\<`void`\>

---

### waitForPublishComplete()

> **waitForPublishComplete**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:512

Wait for publish operation to complete

#### Returns

`Promise`\<`void`\>

---

### playApp()

> **playApp**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:522

Play/Open the app in runtime

#### Returns

`Promise`\<`void`\>

---

### validateApp()

> **validateApp**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:536

Validate the app

#### Returns

`Promise`\<`void`\>

---

### addTableBasedPage()

> **addTableBasedPage**(`tableName`, `forms`, `views`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:553

Add a table-based page

#### Parameters

##### tableName

`string`

Name of the table

##### forms

`string`[] = `[]`

Array of form names to include

##### views

`string`[] = `[]`

Array of view names to include

#### Returns

`Promise`\<`void`\>

---

### addDashboardPage()

> **addDashboardPage**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:595

Add a dashboard page

#### Returns

`Promise`\<`void`\>

---

### addCustomPage()

> **addCustomPage**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:605

Add a custom page

#### Returns

`Promise`\<`void`\>

---

### deletePage()

> **deletePage**(`pageName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:616

Delete a page

#### Parameters

##### pageName

`string`

Name of the page to delete

#### Returns

`Promise`\<`void`\>

---

### addNavigationGroup()

> **addNavigationGroup**(`groupName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:631

Add navigation group

#### Parameters

##### groupName

`string`

Name for the group

#### Returns

`Promise`\<`void`\>

---

### addNavigationSubArea()

> **addNavigationSubArea**(`groupName`, `subAreaTitle`, `tableName?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:644

Add navigation subarea

#### Parameters

##### groupName

`string`

Parent group name

##### subAreaTitle

`string`

Title for the subarea

##### tableName?

`string`

Optional table to link to

#### Returns

`Promise`\<`void`\>

---

### addTable()

> **addTable**(`tableName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:679

Add table to the app

#### Parameters

##### tableName

`string`

Name of the table

#### Returns

`Promise`\<`void`\>

---

### createNewTable()

> **createNewTable**(`displayName`, `pluralName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:692

Create a new table

#### Parameters

##### displayName

`string`

Display name for the table

##### pluralName

`string`

Plural name for the table

#### Returns

`Promise`\<`void`\>

---

### openSettings()

> **openSettings**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:717

Open app settings

#### Returns

`Promise`\<`void`\>

---

### setAppDescription()

> **setAppDescription**(`description`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:726

Set app description

#### Parameters

##### description

`string`

Description for the app

#### Returns

`Promise`\<`void`\>

---

### enableMobile()

> **enableMobile**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:735

Enable mobile for the app

#### Returns

`Promise`\<`void`\>

---

### enableOfflineMode()

> **enableOfflineMode**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:745

Enable offline mode

#### Returns

`Promise`\<`void`\>

---

### navigateToRuntimeItem()

> **navigateToRuntimeItem**(`itemName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:760

Navigate to a navigation item in runtime

#### Parameters

##### itemName

`string`

Name of the navigation item

#### Returns

`Promise`\<`void`\>

---

### expandNavigationGroup()

> **expandNavigationGroup**(`groupName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:769

Expand navigation group in runtime

#### Parameters

##### groupName

`string`

Name of the group

#### Returns

`Promise`\<`void`\>

---

### createNewRecord()

> **createNewRecord**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:776

Create new record in runtime

#### Returns

`Promise`\<`void`\>

---

### saveRecord()

> **saveRecord**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:786

Save record in runtime

#### Returns

`Promise`\<`void`\>

---

### fillFormField()

> **fillFormField**(`fieldName`, `value`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:796

Fill form field in runtime

#### Parameters

##### fieldName

`string`

Name of the field

##### value

`string`

Value to fill

#### Returns

`Promise`\<`void`\>

---

### clickCommandButton()

> **clickCommandButton**(`buttonLabel`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:807

Click command bar button in runtime

#### Parameters

##### buttonLabel

`string`

Label of the button

#### Returns

`Promise`\<`void`\>

---

### switchFormTab()

> **switchFormTab**(`tabName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:815

Switch form tab in runtime

#### Parameters

##### tabName

`string`

Name of the tab

#### Returns

`Promise`\<`void`\>

---

### shareApp()

> **shareApp**(`userEmail`, `securityRole`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:828

Share app with a user

#### Parameters

##### userEmail

`string`

Email of the user

##### securityRole

`string`

Security role to assign

#### Returns

`Promise`\<`void`\>

---

### searchApp()

> **searchApp**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:855

Search for an app by name

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`void`\>

---

### openAppForEdit()

> **openAppForEdit**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:865

Open an existing app for editing

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`void`\>

---

### openAppForPlay()

> **openAppForPlay**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:878

Open an existing app in play mode

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`void`\>

---

### deleteApp()

> **deleteApp**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:889

Delete an app

#### Parameters

##### appName

`string`

Name of the app to delete

#### Returns

`Promise`\<`void`\>

---

### verifyAppExists()

> **verifyAppExists**(`appName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:909

Verify app exists in the list

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`void`\>

---

### verifyAppPublished()

> **verifyAppPublished**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:917

Verify app is published

#### Returns

`Promise`\<`void`\>

---

### verifyPageExists()

> **verifyPageExists**(`pageName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:927

Verify page exists in designer

#### Parameters

##### pageName

`string`

Name of the page

#### Returns

`Promise`\<`void`\>

---

### verifyNavigationItemExists()

> **verifyNavigationItemExists**(`itemName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:937

Verify navigation item exists

#### Parameters

##### itemName

`string`

Name of the navigation item

#### Returns

`Promise`\<`void`\>

---

### verifyTableAdded()

> **verifyTableAdded**(`tableName`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:947

Verify table is added to app

#### Parameters

##### tableName

`string`

Name of the table

#### Returns

`Promise`\<`void`\>

---

### verifyNoValidationErrors()

> **verifyNoValidationErrors**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:957

Verify validation has no errors

#### Returns

`Promise`\<`void`\>

---

### verifyRuntimeLoaded()

> **verifyRuntimeLoaded**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:965

Verify runtime loaded successfully

#### Returns

`Promise`\<`void`\>

---

### verifyRecordSaved()

> **verifyRecordSaved**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:977

Verify record saved in runtime

#### Returns

`Promise`\<`void`\>

---

### launchById()

> **launchById**(`appId`, `baseUrl`, `_mode`, `_options?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:995

Launch app by ID (IAppLauncher interface)

#### Parameters

##### appId

`string`

##### baseUrl

`string`

##### \_mode

`any`

##### \_options?

`any`

#### Returns

`Promise`\<`void`\>

---

### launchByName()

> **launchByName**(`_appName`, `_findAppCallback`, `_mode`, `_options?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1011

Launch app by name (IAppLauncher interface)
Note: Navigation is handled by AppProvider, this just marks the launcher as ready

#### Parameters

##### \_appName

`string`

##### \_findAppCallback

(`appName`) => `Promise`\<`any`\>

##### \_mode

`any`

##### \_options?

`any`

#### Returns

`Promise`\<`void`\>

---

### waitForAppLoad()

> **waitForAppLoad**(`_options?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1025

Wait for app to load (IAppLauncher interface)

#### Parameters

##### \_options?

`any`

#### Returns

`Promise`\<`void`\>

---

### isAppReady()

> **isAppReady**(): `boolean`

Defined in: pages/model-driven-app.page.ts:1033

Check if app is ready (IAppLauncher interface)

#### Returns

`boolean`

---

### getAppId()

> **getAppId**(): `string` \| `null`

Defined in: pages/model-driven-app.page.ts:1040

Get app ID (IAppLauncher interface)

#### Returns

`string` \| `null`

---

### getAppUrl()

> **getAppUrl**(): `string` \| `null`

Defined in: pages/model-driven-app.page.ts:1047

Get app URL (IAppLauncher interface)

#### Returns

`string` \| `null`

---

### getControl()

> **getControl**(`options`): `any`

Defined in: pages/model-driven-app.page.ts:1054

Get control (IAppLauncher interface)

#### Parameters

##### options

`any`

#### Returns

`any`

---

### clickControl()

> **clickControl**(`options`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1064

Click control (IAppLauncher interface)

#### Parameters

##### options

`any`

#### Returns

`Promise`\<`void`\>

---

### fillControl()

> **fillControl**(`options`, `value`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1072

Fill control (IAppLauncher interface)

#### Parameters

##### options

`any`

##### value

`string`

#### Returns

`Promise`\<`void`\>

---

### fillForm()

> **fillForm**(`formData`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1080

Fill form (IAppLauncher interface)

#### Parameters

##### formData

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>

---

### assertControlVisible()

> **assertControlVisible**(`options`, `_assertOptions?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1089

Assert control visible (IAppLauncher interface)

#### Parameters

##### options

`any`

##### \_assertOptions?

`any`

#### Returns

`Promise`\<`void`\>

---

### assertControlText()

> **assertControlText**(`options`, `expectedText`, `_assertOptions?`): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1097

Assert control text (IAppLauncher interface)

#### Parameters

##### options

`any`

##### expectedText

`string`

##### \_assertOptions?

`any`

#### Returns

`Promise`\<`void`\>

---

### closeApp()

> **closeApp**(): `Promise`\<`void`\>

Defined in: pages/model-driven-app.page.ts:1105

Close app (IAppLauncher interface)

#### Returns

`Promise`\<`void`\>

---

### reset()

> **reset**(): `void`

Defined in: pages/model-driven-app.page.ts:1114

Reset launcher state (IAppLauncher interface)

#### Returns

`void`
