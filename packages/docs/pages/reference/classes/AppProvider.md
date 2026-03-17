[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / AppProvider

# Class: AppProvider

Defined in: core/app-provider.ts:85

App Provider - High-level API for app testing
Provides simplified interface for customers to launch and test their apps

Handles complex scenarios:
- Apps opening in new tabs (Play mode)
- Direct URL navigation with OAuth redirects
- Proper page tracking and context management
- Cleanup of resources

## Example

```typescript
const provider = new AppProvider(page, context);

// Launch by name (handles new tab automatically)
await provider.launch({
  app: 'My Sales App',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  baseUrl: 'https://make.powerapps.com',
  context: context  // Required for Play mode
});

// Launch by direct URL (fastest, no maker portal)
await provider.launch({
  app: 'My Sales App',
  type: AppType.ModelDriven,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true,
  directUrl: 'https://org.crm.dynamics.com/main.aspx?appid=abc-123'
});

// Get the actual app page (might be different from original page)
const appPage = provider.getAppPage();

// Interact with app
await provider.click({ name: 'Submit' });

// Cleanup
await provider.close();
```

## Constructors

### Constructor

> **new AppProvider**(`page`, `context?`): `AppProvider`

Defined in: core/app-provider.ts:101

#### Parameters

##### page

`Page`

##### context?

`BrowserContext`

#### Returns

`AppProvider`

## Methods

### getAppPage()

> **getAppPage**(): `Page`

Defined in: core/app-provider.ts:115

Get the page where the app is actually running

#### Returns

`Page`

The app page (might be a new tab or the original page)

***

### getModelDrivenAppPage()

> **getModelDrivenAppPage**(): [`ModelDrivenAppPage`](ModelDrivenAppPage.md)

Defined in: core/app-provider.ts:142

Get ModelDrivenAppPage instance
This is the primary way to interact with Model-Driven Apps after launching

#### Returns

[`ModelDrivenAppPage`](ModelDrivenAppPage.md)

ModelDrivenAppPage instance for the launched app

#### Throws

Error if no Model-Driven app has been launched

#### Example

```typescript
const appProvider = new AppProvider(page, context);

await appProvider.launch({
  app: 'Northwind Orders',
  type: AppType.ModelDriven,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true,
  directUrl: 'https://org.crm.dynamics.com/main.aspx?appid=abc-123'
});

const modelDrivenApp = appProvider.getModelDrivenAppPage();
await modelDrivenApp.navigateToGridView('nwind_order');
```

***

### getCanvasAppPage()

> **getCanvasAppPage**(): [`CanvasAppPage`](CanvasAppPage.md)

Defined in: core/app-provider.ts:182

Get CanvasAppPage instance
This is the primary way to interact with Canvas Apps after launching

#### Returns

[`CanvasAppPage`](CanvasAppPage.md)

CanvasAppPage instance for the launched app

#### Throws

Error if no Canvas app has been launched

#### Example

```typescript
const appProvider = new AppProvider(page, context);

await appProvider.launch({
  app: 'Sales Canvas App',
  type: AppType.Canvas,
  mode: AppLaunchMode.Play,
  skipMakerPortal: true,
  directUrl: 'https://apps.powerapps.com/play/e/env-id/a/app-id?tenantId=tenant-id'
});

const canvasApp = appProvider.getCanvasAppPage();
const gallery = await canvasApp.getControl({ name: 'Gallery1' });
```

***

### getPowerAppsPage()

> **getPowerAppsPage**(): [`PowerAppsPage`](PowerAppsPage.md)

Defined in: core/app-provider.ts:214

Get PowerAppsPage instance
This provides access to the Power Apps maker portal (for app management)

#### Returns

[`PowerAppsPage`](PowerAppsPage.md)

PowerAppsPage instance for maker portal operations

#### Example

```typescript
const appProvider = new AppProvider(page);
const powerAppsPage = appProvider.getPowerAppsPage();

await powerAppsPage.navigateToApps();
await powerAppsPage.searchApps('My App');
```

***

### getGenUxPage()

> **getGenUxPage**(): [`GenUxPage`](GenUxPage.md)

Defined in: core/app-provider.ts:243

Get GenUxPage instance for Maker Portal GenUX designer interactions.
Use this to drive app generation (AI prompt workflow) and inspect
generated app DOM / Power Fx code for test generation.

#### Returns

[`GenUxPage`](GenUxPage.md)

GenUxPage instance scoped to the current Maker Portal page

#### Example

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({
  app: 'Power Apps Maker',
  type: AppType.ModelDriven,
  mode: AppLaunchMode.Edit,
  baseUrl: process.env.MAKER_PORTAL_URL,
});
const genUxPage = appProvider.getGenUxPage();
await performGenUxBasicSetup(genUxPage, appName, { aiPrompt: '...' });
```

***

### launch()

> **launch**(`config`): `Promise`\<`void`\>

Defined in: core/app-provider.ts:257

Launch an app
Supports launching by name, ID, or direct URL
Automatically handles new tabs for Play mode

#### Parameters

##### config

[`LaunchAppConfig`](../interfaces/LaunchAppConfig.md)

Launch configuration

#### Returns

`Promise`\<`void`\>

***

### getControl()

> **getControl**(`options`): `Locator`

Defined in: core/app-provider.ts:469

Get a control in the current app

#### Parameters

##### options

[`ControlOptions`](../interfaces/ControlOptions.md)

Control options

#### Returns

`Locator`

Locator for the control

***

### click()

> **click**(`options`): `Promise`\<`void`\>

Defined in: core/app-provider.ts:478

Click a control in the current app

#### Parameters

##### options

[`ControlOptions`](../interfaces/ControlOptions.md)

Control options

#### Returns

`Promise`\<`void`\>

***

### fill()

> **fill**(`options`, `value`): `Promise`\<`void`\>

Defined in: core/app-provider.ts:488

Fill a text input control in the current app

#### Parameters

##### options

[`ControlOptions`](../interfaces/ControlOptions.md)

Control options

##### value

`string`

Value to fill

#### Returns

`Promise`\<`void`\>

***

### fillForm()

> **fillForm**(`formData`): `Promise`\<`void`\>

Defined in: core/app-provider.ts:497

Fill a form in the current app

#### Parameters

##### formData

`Record`\<`string`, `string`\>

Key-value pairs of field names and values

#### Returns

`Promise`\<`void`\>

***

### assertVisible()

> **assertVisible**(`options`): `Promise`\<`void`\>

Defined in: core/app-provider.ts:506

Assert control is visible

#### Parameters

##### options

[`ControlOptions`](../interfaces/ControlOptions.md)

Control options

#### Returns

`Promise`\<`void`\>

***

### assertText()

> **assertText**(`options`, `expectedText`): `Promise`\<`void`\>

Defined in: core/app-provider.ts:516

Assert control text matches

#### Parameters

##### options

[`ControlOptions`](../interfaces/ControlOptions.md)

Control options

##### expectedText

`string`

Expected text

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: core/app-provider.ts:525

Close the current app
Handles cleanup based on launch mode

#### Returns

`Promise`\<`void`\>

***

### isReady()

> **isReady**(): `boolean`

Defined in: core/app-provider.ts:549

Check if an app is currently launched and ready

#### Returns

`boolean`

true if app is ready

***

### getCurrentAppType()

> **getCurrentAppType**(): [`AppType`](../enumerations/AppType.md) \| `null`

Defined in: core/app-provider.ts:557

Get the current app type

#### Returns

[`AppType`](../enumerations/AppType.md) \| `null`

Current app type or null

***

### getCurrentAppId()

> **getCurrentAppId**(): `string` \| `null`

Defined in: core/app-provider.ts:565

Get the current app ID

#### Returns

`string` \| `null`

Current app ID or null

***

### getCurrentAppUrl()

> **getCurrentAppUrl**(): `string` \| `null`

Defined in: core/app-provider.ts:573

Get the current app URL

#### Returns

`string` \| `null`

Current app URL or null

***

### getLaunchedApps()

> **getLaunchedApps**(): [`AppMetadata`](../interfaces/AppMetadata.md)[]

Defined in: core/app-provider.ts:582

Get metadata for all launched apps

#### Returns

[`AppMetadata`](../interfaces/AppMetadata.md)[]

Array of app metadata

***

### reset()

> **reset**(): `void`

Defined in: core/app-provider.ts:590

Reset the provider state
Clears current launcher and app metadata

#### Returns

`void`
