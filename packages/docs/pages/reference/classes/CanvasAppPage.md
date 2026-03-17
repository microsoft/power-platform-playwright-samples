[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / CanvasAppPage

# Class: CanvasAppPage

Defined in: pages/canvas-app.page.ts:9

## Constructors

### Constructor

> **new CanvasAppPage**(`page`): `CanvasAppPage`

Defined in: pages/canvas-app.page.ts:13

#### Parameters

##### page

`Page`

#### Returns

`CanvasAppPage`

## Properties

### page

> `readonly` **page**: `Page`

Defined in: pages/canvas-app.page.ts:10

***

### appType

> `readonly` **appType**: `"Canvas"` = `'Canvas'`

Defined in: pages/canvas-app.page.ts:522

## Methods

### navigateToHome()

> **navigateToHome**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:35

Navigate to Power Apps home page

#### Returns

`Promise`\<`void`\>

***

### waitForHomePageLoad()

> **waitForHomePageLoad**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:43

Wait for home page to load

#### Returns

`Promise`\<`void`\>

***

### waitForStudioLoad()

> **waitForStudioLoad**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:53

Wait for Canvas Studio to load

#### Returns

`Promise`\<`void`\>

***

### waitForLoadingComplete()

> **waitForLoadingComplete**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:96

Wait for loading spinner to disappear

#### Returns

`Promise`\<`void`\>

***

### createBlankCanvasApp()

> **createBlankCanvasApp**(`appName?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:111

Create a blank Canvas app

#### Parameters

##### appName?

`string`

Optional name for the app

#### Returns

`Promise`\<`void`\>

***

### createFromTemplate()

> **createFromTemplate**(`_templateName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:125

Create Canvas app from template

#### Parameters

##### \_templateName

`string`

Name of the template

#### Returns

`Promise`\<`void`\>

***

### createFromData()

> **createFromData**(`_dataSourceName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:136

Create Canvas app from data

#### Parameters

##### \_dataSourceName

`string`

Name of the data source

#### Returns

`Promise`\<`void`\>

***

### setAppName()

> **setAppName**(`appName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:151

Set app name

#### Parameters

##### appName

`string`

Name for the app

#### Returns

`Promise`\<`void`\>

***

### saveApp()

> **saveApp**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:162

Save the Canvas app

#### Returns

`Promise`\<`void`\>

***

### saveAppWithName()

> **saveAppWithName**(`appName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:174

Save app with specific name

#### Parameters

##### appName

`string`

Name to save the app as

#### Returns

`Promise`\<`void`\>

***

### waitForSaveComplete()

> **waitForSaveComplete**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:186

Wait for save operation to complete

#### Returns

`Promise`\<`void`\>

***

### publishApp()

> **publishApp**(`comments?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:197

Publish the Canvas app

#### Parameters

##### comments?

`string`

Optional version comments

#### Returns

`Promise`\<`void`\>

***

### waitForPublishComplete()

> **waitForPublishComplete**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:213

Wait for publish operation to complete

#### Returns

`Promise`\<`void`\>

***

### playApp()

> **playApp**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:223

Play/Preview the app

#### Returns

`Promise`\<`void`\>

***

### stopPlayingApp()

> **stopPlayingApp**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:235

Stop playing the app

#### Returns

`Promise`\<`void`\>

***

### addControl()

> **addControl**(`controlType`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:247

Add a control to the canvas

#### Parameters

##### controlType

Type of control (e.g., 'Button', 'Label', 'TextInput')

`"SearchControl"` | `"LayoutSection"` | `"InputSection"` | `"DisplaySection"` | `"IconsSection"` | `"MediaSection"` | `"ChartsSection"` | `"AISection"` | `"ButtonControl"` | `"TextLabelControl"` | `"TextInputControl"` | `"DropdownControl"` | `"ComboboxControl"` | `"DatePickerControl"` | `"GalleryControl"` | `"FormControl"` | `"DataTableControl"` | `"IconControl"` | `"ImageControl"` | `"ShapeControl"` | `"ChartControl"`

#### Returns

`Promise`\<`void`\>

***

### addButton()

> **addButton**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:265

Add a button control

#### Returns

`Promise`\<`void`\>

***

### addTextLabel()

> **addTextLabel**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:272

Add a text label control

#### Returns

`Promise`\<`void`\>

***

### addTextInput()

> **addTextInput**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:279

Add a text input control

#### Returns

`Promise`\<`void`\>

***

### addGallery()

> **addGallery**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:286

Add a gallery control

#### Returns

`Promise`\<`void`\>

***

### selectControl()

> **selectControl**(`controlName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:294

Select a control by name

#### Parameters

##### controlName

`string`

Name of the control

#### Returns

`Promise`\<`void`\>

***

### deleteSelectedControl()

> **deleteSelectedControl**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:302

Delete selected control

#### Returns

`Promise`\<`void`\>

***

### setControlProperty()

> **setControlProperty**(`propertyName`, `value`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:315

Set control property

#### Parameters

##### propertyName

`string`

Name of the property

##### value

`string`

Value to set

#### Returns

`Promise`\<`void`\>

***

### setControlText()

> **setControlText**(`text`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:328

Set control text property

#### Parameters

##### text

`string`

Text value

#### Returns

`Promise`\<`void`\>

***

### setFormula()

> **setFormula**(`propertyName`, `formula`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:339

Set formula for a property

#### Parameters

##### propertyName

`string`

Name of the property

##### formula

`string`

Formula to set

#### Returns

`Promise`\<`void`\>

***

### addDataSource()

> **addDataSource**(`dataSourceName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:359

Add data source to the app

#### Parameters

##### dataSourceName

`string`

Name of the data source

#### Returns

`Promise`\<`void`\>

***

### addScreen()

> **addScreen**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:385

Add a new screen

#### Returns

`Promise`\<`void`\>

***

### selectScreen()

> **selectScreen**(`screenName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:394

Select a screen by name

#### Parameters

##### screenName

`string`

Name of the screen

#### Returns

`Promise`\<`void`\>

***

### deleteScreen()

> **deleteScreen**(`screenName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:403

Delete a screen

#### Parameters

##### screenName

`string`

Name of the screen to delete

#### Returns

`Promise`\<`void`\>

***

### searchApp()

> **searchApp**(`appName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:418

Search for an app by name

#### Parameters

##### appName

`string`

Name of the app to search for

#### Returns

`Promise`\<`void`\>

***

### openApp()

> **openApp**(`appName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:428

Open an existing app

#### Parameters

##### appName

`string`

Name of the app to open

#### Returns

`Promise`\<`void`\>

***

### deleteApp()

> **deleteApp**(`appName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:438

Delete an app

#### Parameters

##### appName

`string`

Name of the app to delete

#### Returns

`Promise`\<`void`\>

***

### shareApp()

> **shareApp**(`userEmail`, `permission`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:457

Share app with a user

#### Parameters

##### userEmail

`string`

Email of the user to share with

##### permission

Permission level ('CanEdit' or 'CanView')

`"CanEdit"` | `"CanView"`

#### Returns

`Promise`\<`void`\>

***

### verifyAppExists()

> **verifyAppExists**(`appName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:483

Verify app exists in the list

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`void`\>

***

### verifyAppSaved()

> **verifyAppSaved**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:491

Verify app is saved

#### Returns

`Promise`\<`void`\>

***

### verifyAppPublished()

> **verifyAppPublished**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:498

Verify app is published

#### Returns

`Promise`\<`void`\>

***

### verifyControlExists()

> **verifyControlExists**(`controlName`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:506

Verify control exists on canvas

#### Parameters

##### controlName

`string`

Name of the control

#### Returns

`Promise`\<`void`\>

***

### verifyErrorDisplayed()

> **verifyErrorDisplayed**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:514

Verify error message is displayed

#### Returns

`Promise`\<`void`\>

***

### launchById()

> **launchById**(`appId`, `baseUrl`, `_mode`, `_options?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:530

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

***

### launchByName()

> **launchByName**(`_appName`, `_findAppCallback`, `_mode`, `_options?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:543

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

***

### waitForAppLoad()

> **waitForAppLoad**(`_options?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:557

Wait for app to load (IAppLauncher interface)

#### Parameters

##### \_options?

`any`

#### Returns

`Promise`\<`void`\>

***

### isAppReady()

> **isAppReady**(): `boolean`

Defined in: pages/canvas-app.page.ts:565

Check if app is ready (IAppLauncher interface)

#### Returns

`boolean`

***

### getAppId()

> **getAppId**(): `string` \| `null`

Defined in: pages/canvas-app.page.ts:572

Get app ID (IAppLauncher interface)

#### Returns

`string` \| `null`

***

### getAppUrl()

> **getAppUrl**(): `string` \| `null`

Defined in: pages/canvas-app.page.ts:579

Get app URL (IAppLauncher interface)

#### Returns

`string` \| `null`

***

### getControl()

> **getControl**(`options`): `any`

Defined in: pages/canvas-app.page.ts:586

Get control (IAppLauncher interface)

#### Parameters

##### options

`any`

#### Returns

`any`

***

### clickControl()

> **clickControl**(`options`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:596

Click control (IAppLauncher interface)

#### Parameters

##### options

`any`

#### Returns

`Promise`\<`void`\>

***

### fillControl()

> **fillControl**(`options`, `value`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:604

Fill control (IAppLauncher interface)

#### Parameters

##### options

`any`

##### value

`string`

#### Returns

`Promise`\<`void`\>

***

### fillForm()

> **fillForm**(`formData`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:612

Fill form (IAppLauncher interface)

#### Parameters

##### formData

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>

***

### assertControlVisible()

> **assertControlVisible**(`options`, `_assertOptions?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:621

Assert control visible (IAppLauncher interface)

#### Parameters

##### options

`any`

##### \_assertOptions?

`any`

#### Returns

`Promise`\<`void`\>

***

### assertControlText()

> **assertControlText**(`options`, `expectedText`, `_assertOptions?`): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:629

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

***

### closeApp()

> **closeApp**(): `Promise`\<`void`\>

Defined in: pages/canvas-app.page.ts:637

Close app (IAppLauncher interface)

#### Returns

`Promise`\<`void`\>

***

### reset()

> **reset**(): `void`

Defined in: pages/canvas-app.page.ts:646

Reset launcher state (IAppLauncher interface)

#### Returns

`void`
