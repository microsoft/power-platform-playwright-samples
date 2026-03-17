[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / AppRuntimeWaiter

# Class: AppRuntimeWaiter

Defined in: core/page-waiters/app-runtime-waiter.ts:22

Waits for Power Platform apps to fully load in runtime mode
Handles OAuth redirects and domain transitions for Model-Driven apps

## Example

```typescript
const waiter = new AppRuntimeWaiter(page, AppType.ModelDriven);
await waiter.waitForAppLoad();
// App is now ready for interactions
```

## Constructors

### Constructor

> **new AppRuntimeWaiter**(`page`, `appType`): `AppRuntimeWaiter`

Defined in: core/page-waiters/app-runtime-waiter.ts:28

Creates a new AppRuntimeWaiter instance

#### Parameters

##### page

`Page`

Playwright page object

##### appType

[`AppType`](../enumerations/AppType.md)

Type of app (Canvas or ModelDriven)

#### Returns

`AppRuntimeWaiter`

## Methods

### waitForAppLoad()

> **waitForAppLoad**(`timeout`): `Promise`\<`void`\>

Defined in: core/page-waiters/app-runtime-waiter.ts:52

Wait for app to fully load in runtime mode
Handles OAuth redirects for Model-Driven apps
Waits for app initialization and ready indicators

#### Parameters

##### timeout

`number` = `60000`

Maximum wait time in milliseconds (default: 60000)

#### Returns

`Promise`\<`void`\>

#### Throws

If app fails to load within timeout

#### Example

```typescript
// For Model-Driven app
const waiter = new AppRuntimeWaiter(page, AppType.ModelDriven);
await waiter.waitForAppLoad();

// For Canvas app
const waiter = new AppRuntimeWaiter(page, AppType.Canvas);
await waiter.waitForAppLoad(30000);
```

***

### isAppLoaded()

> **isAppLoaded**(): `Promise`\<`boolean`\>

Defined in: core/page-waiters/app-runtime-waiter.ts:167

Check if app is currently loaded and ready

#### Returns

`Promise`\<`boolean`\>

true if app appears to be loaded, false otherwise
