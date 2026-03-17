[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / PowerAppsPage

# Class: PowerAppsPage

Defined in: pages/power-apps.page.ts:18

## Constructors

### Constructor

> **new PowerAppsPage**(`page`): `PowerAppsPage`

Defined in: pages/power-apps.page.ts:25

#### Parameters

##### page

`Page`

#### Returns

`PowerAppsPage`

## Properties

### page

> `readonly` **page**: `Page`

Defined in: pages/power-apps.page.ts:19

***

### locators

> `readonly` **locators**: [`PowerAppsPageLocators`](PowerAppsPageLocators.md)

Defined in: pages/power-apps.page.ts:20

***

### canvas

> `readonly` **canvas**: [`CanvasAppPage`](CanvasAppPage.md)

Defined in: pages/power-apps.page.ts:21

***

### modelDriven

> `readonly` **modelDriven**: [`ModelDrivenAppPage`](ModelDrivenAppPage.md)

Defined in: pages/power-apps.page.ts:22

## Methods

### navigateToHome()

> **navigateToHome**(`options`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:44

Navigate to Power Apps home page
Delegates to PowerPlatformNavigator for modular navigation

#### Parameters

##### options

`NavigationOptions` = `{}`

Navigation options

#### Returns

`Promise`\<`void`\>

***

### navigateToApps()

> **navigateToApps**(`options`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:54

Navigate to Apps page
Delegates to PowerPlatformNavigator for modular navigation

#### Parameters

##### options

`NavigationOptions` = `{}`

Navigation options

#### Returns

`Promise`\<`void`\>

***

### navigateToSolutions()

> **navigateToSolutions**(`options`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:64

Navigate to Solutions page
Delegates to PowerPlatformNavigator for modular navigation

#### Parameters

##### options

`NavigationOptions` = `{}`

Navigation options

#### Returns

`Promise`\<`void`\>

***

### navigateToAppsViaMenu()

> **navigateToAppsViaMenu**(`options`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:75

Navigate to Apps page via menu
First navigates to home page, then clicks the Apps menu item
Use this when you want to simulate user navigation through the UI

#### Parameters

##### options

`NavigationOptions` = `{}`

Navigation options

#### Returns

`Promise`\<`void`\>

***

### navigateToSolutionsViaMenu()

> **navigateToSolutionsViaMenu**(`options`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:125

Navigate to Solutions page via menu
First navigates to home page, then clicks the Solutions menu item
Use this when you want to simulate user navigation through the UI

#### Parameters

##### options

`NavigationOptions` = `{}`

Navigation options

#### Returns

`Promise`\<`void`\>

***

### navigateToPowerAppsHomePage()

> **navigateToPowerAppsHomePage**(`url?`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:150

Navigate to Power Apps home page (legacy method)
Simpler version without options for backward compatibility

#### Parameters

##### url?

`string`

Base URL to navigate to

#### Returns

`Promise`\<`void`\>

***

### navigateToAppsPage()

> **navigateToAppsPage**(`url?`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:176

Navigate to Apps page (legacy method)
Simpler version without options for backward compatibility

#### Parameters

##### url?

`string`

Base URL to navigate to

#### Returns

`Promise`\<`void`\>

***

### launchApplication()

> **launchApplication**(`appName`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:202

Open/Launch an app by clicking it in the apps list (legacy method)

#### Parameters

##### appName

`string`

Name of the app to launch

#### Returns

`Promise`\<`void`\>

#### Throws

Error if app is not found

***

### waitForCanvasAppLaunch()

> **waitForCanvasAppLaunch**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:232

Wait for Canvas app to launch in studio (legacy method)
Waits for PowerApps logo to disappear and clicks skip button

#### Returns

`Promise`\<`void`\>

***

### waitForHomePageLoad()

> **waitForHomePageLoad**(`timeout`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:256

Wait for home page to fully load
Delegates to HomePageWaiter for modular wait strategy

#### Parameters

##### timeout

`number` = `60000`

Timeout in milliseconds

#### Returns

`Promise`\<`void`\>

***

### waitForAppsPageLoad()

> **waitForAppsPageLoad**(`timeout`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:266

Wait for Apps page to fully load
Delegates to AppsPageWaiter for modular wait strategy

#### Parameters

##### timeout

`number` = `60000`

Timeout in milliseconds

#### Returns

`Promise`\<`void`\>

***

### waitForSolutionsPageLoad()

> **waitForSolutionsPageLoad**(`timeout`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:276

Wait for Solutions page to fully load
Delegates to SolutionsPageWaiter for modular wait strategy

#### Parameters

##### timeout

`number` = `60000`

Timeout in milliseconds

#### Returns

`Promise`\<`void`\>

***

### findApp()

> **findApp**(`appName`, `options`): `Promise`\<`Locator`\>

Defined in: pages/power-apps.page.ts:292

Find an app by name in the apps list
Includes search and wait logic

#### Parameters

##### appName

`string`

Name of the app

##### options

[`SearchOptions`](../interfaces/SearchOptions.md) = `{}`

Search options

#### Returns

`Promise`\<`Locator`\>

Locator for the app

***

### findSolution()

> **findSolution**(`solutionName`, `options`): `Promise`\<`Locator`\>

Defined in: pages/power-apps.page.ts:323

Find a solution by name

#### Parameters

##### solutionName

`string`

Name of the solution

##### options

[`SearchOptions`](../interfaces/SearchOptions.md) = `{}`

Search options

#### Returns

`Promise`\<`Locator`\>

Locator for the solution

***

### openDefaultSolution()

> **openDefaultSolution**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:351

Open the default solution

#### Returns

`Promise`\<`void`\>

***

### createApp()

> **createApp**(`appType`, `appName`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:367

Create a new app of specified type

#### Parameters

##### appType

[`AppType`](../enumerations/AppType.md)

Type of app (Canvas or ModelDriven)

##### appName

`string`

Name for the new app

#### Returns

`Promise`\<`void`\>

***

### deleteApp()

> **deleteApp**(`appType`, `appName`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:393

Delete an app by name

#### Parameters

##### appType

[`AppType`](../enumerations/AppType.md)

Type of app

##### appName

`string`

Name of the app to delete

#### Returns

`Promise`\<`void`\>

***

### openApp()

> **openApp**(`appName`, `appType`, `mode`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:419

Open an app for editing or playing

#### Parameters

##### appName

`string`

Name of the app

##### appType

[`AppType`](../enumerations/AppType.md)

Type of app

##### mode

'edit' or 'play'

`"play"` | `"edit"`

#### Returns

`Promise`\<`void`\>

***

### openModelDrivenAppInNewWindow()

> **openModelDrivenAppInNewWindow**(`appName`): `Promise`\<`Page`\>

Defined in: pages/power-apps.page.ts:478

Open Model Driven app in new window

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`Page`\>

New page object

***

### dismissTeachingBubble()

> **dismissTeachingBubble**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:497

Dismiss teaching bubble if present

#### Returns

`Promise`\<`void`\>

***

### isEnvironmentErrorPage()

> **isEnvironmentErrorPage**(): `Promise`\<`boolean`\>

Defined in: pages/power-apps.page.ts:518

Check if current page is an environment error page

#### Returns

`Promise`\<`boolean`\>

True if error page is detected

***

### isHomePage()

> **isHomePage**(): `Promise`\<`boolean`\>

Defined in: pages/power-apps.page.ts:526

Check if currently on home page

#### Returns

`Promise`\<`boolean`\>

***

### isAppsPage()

> **isAppsPage**(): `Promise`\<`boolean`\>

Defined in: pages/power-apps.page.ts:533

Check if currently on apps page

#### Returns

`Promise`\<`boolean`\>

***

### isSolutionsPage()

> **isSolutionsPage**(): `Promise`\<`boolean`\>

Defined in: pages/power-apps.page.ts:540

Check if currently on solutions page

#### Returns

`Promise`\<`boolean`\>

***

### takeScreenshot()

> **takeScreenshot**(`fileName`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:548

Take screenshot

#### Parameters

##### fileName

`string`

Name for the screenshot file

#### Returns

`Promise`\<`void`\>

***

### signOut()

> **signOut**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:558

Sign out from Power Apps

#### Returns

`Promise`\<`void`\>

***

### searchApps()

> **searchApps**(`query`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:582

Search for apps in the apps list

#### Parameters

##### query

`string`

Search query

#### Returns

`Promise`\<`void`\>

***

### searchSolutions()

> **searchSolutions**(`query`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:596

Search for solutions

#### Parameters

##### query

`string`

Search query

#### Returns

`Promise`\<`void`\>

***

### verifyHomePageLoaded()

> **verifyHomePageLoaded**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:613

Verify home page loaded successfully

#### Returns

`Promise`\<`void`\>

***

### verifyAppsPageLoaded()

> **verifyAppsPageLoaded**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:622

Verify apps page loaded successfully

#### Returns

`Promise`\<`void`\>

***

### verifySolutionsPageLoaded()

> **verifySolutionsPageLoaded**(): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:631

Verify solutions page loaded successfully

#### Returns

`Promise`\<`void`\>

***

### verifyAppExists()

> **verifyAppExists**(`appName`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:641

Verify app exists in the list

#### Parameters

##### appName

`string`

Name of the app

#### Returns

`Promise`\<`void`\>

***

### verifySolutionExists()

> **verifySolutionExists**(`solutionName`): `Promise`\<`void`\>

Defined in: pages/power-apps.page.ts:650

Verify solution exists in the list

#### Parameters

##### solutionName

`string`

Name of the solution

#### Returns

`Promise`\<`void`\>
