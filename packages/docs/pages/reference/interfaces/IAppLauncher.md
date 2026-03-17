[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / IAppLauncher

# Interface: IAppLauncher

Defined in: core/app-launcher.interface.ts:14

Base interface that all app launchers must implement
Provides a consistent API for launching and testing any Power Platform app type

## Properties

### appType

> `readonly` **appType**: `string`

Defined in: core/app-launcher.interface.ts:18

The app type this launcher handles

## Methods

### launchByName()

> **launchByName**(`appName`, `findAppCallback`, `mode`, `options?`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:28

Launch app by name
Finds the app in the apps list and launches it

#### Parameters

##### appName

`string`

Name of the app to launch

##### findAppCallback

(`appName`) => `Promise`\<`Locator`\>

Callback to find the app in the apps list

##### mode

[`AppLaunchMode`](../enumerations/AppLaunchMode.md)

Launch mode (play, edit, preview)

##### options?

[`AppPlayerOptions`](AppPlayerOptions.md)

Additional launch options

#### Returns

`Promise`\<`void`\>

***

### launchById()

> **launchById**(`appId`, `baseUrl`, `mode`, `options?`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:43

Launch app by ID
Directly navigates to the app using its ID

#### Parameters

##### appId

`string`

ID of the app to launch

##### baseUrl

`string`

Base URL for the environment

##### mode

[`AppLaunchMode`](../enumerations/AppLaunchMode.md)

Launch mode (play, edit, preview)

##### options?

[`AppPlayerOptions`](AppPlayerOptions.md)

Additional launch options

#### Returns

`Promise`\<`void`\>

***

### waitForAppLoad()

> **waitForAppLoad**(`options?`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:54

Wait for app to fully load

#### Parameters

##### options?

[`AppPlayerOptions`](AppPlayerOptions.md)

Wait options

#### Returns

`Promise`\<`void`\>

***

### isAppReady()

> **isAppReady**(): `boolean`

Defined in: core/app-launcher.interface.ts:60

Check if app is ready for interaction

#### Returns

`boolean`

true if app is ready

***

### getAppId()

> **getAppId**(): `string` \| `null`

Defined in: core/app-launcher.interface.ts:66

Get the current app ID

#### Returns

`string` \| `null`

App ID or null if not set

***

### getAppUrl()

> **getAppUrl**(): `string` \| `null`

Defined in: core/app-launcher.interface.ts:72

Get the current app URL

#### Returns

`string` \| `null`

App URL or null if not set

***

### getControl()

> **getControl**(`options`): `Locator`

Defined in: core/app-launcher.interface.ts:79

Get a control by name and type

#### Parameters

##### options

[`ControlOptions`](ControlOptions.md)

Control options

#### Returns

`Locator`

Locator for the control

***

### clickControl()

> **clickControl**(`options`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:85

Click a control

#### Parameters

##### options

[`ControlOptions`](ControlOptions.md)

Control options

#### Returns

`Promise`\<`void`\>

***

### fillControl()

> **fillControl**(`options`, `value`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:92

Fill a text input control

#### Parameters

##### options

[`ControlOptions`](ControlOptions.md)

Control options

##### value

`string`

Value to fill

#### Returns

`Promise`\<`void`\>

***

### fillForm()

> **fillForm**(`formData`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:98

Fill a form with multiple fields

#### Parameters

##### formData

`Record`\<`string`, `string`\>

Key-value pairs of field names and values

#### Returns

`Promise`\<`void`\>

***

### assertControlVisible()

> **assertControlVisible**(`options`, `assertOptions?`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:105

Assert control is visible

#### Parameters

##### options

[`ControlOptions`](ControlOptions.md)

Control options

##### assertOptions?

[`AssertionOptions`](AssertionOptions.md)

Assertion options

#### Returns

`Promise`\<`void`\>

***

### assertControlText()

> **assertControlText**(`options`, `expectedText`, `assertOptions?`): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:113

Assert control text matches

#### Parameters

##### options

[`ControlOptions`](ControlOptions.md)

Control options

##### expectedText

`string`

Expected text

##### assertOptions?

[`AssertionOptions`](AssertionOptions.md)

Assertion options

#### Returns

`Promise`\<`void`\>

***

### closeApp()

> **closeApp**(): `Promise`\<`void`\>

Defined in: core/app-launcher.interface.ts:122

Close the app

#### Returns

`Promise`\<`void`\>

***

### reset()

> **reset**(): `void`

Defined in: core/app-launcher.interface.ts:128

Reset the launcher state
Clears app ID, URL, and ready state

#### Returns

`void`
