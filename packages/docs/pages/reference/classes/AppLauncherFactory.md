[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / AppLauncherFactory

# Class: AppLauncherFactory

Defined in: core/app-launcher.factory.ts:18

Factory class to create app launchers
Supports Canvas Apps, Model Driven Apps, and extensible for future app types

## Constructors

### Constructor

> **new AppLauncherFactory**(): `AppLauncherFactory`

#### Returns

`AppLauncherFactory`

## Methods

### createLauncher()

> `static` **createLauncher**(`page`, `appType`): [`IAppLauncher`](../interfaces/IAppLauncher.md)

Defined in: core/app-launcher.factory.ts:28

Create an app launcher for the specified app type
Returns a singleton instance for each page-appType combination

#### Parameters

##### page

`Page`

Playwright page

##### appType

[`AppType`](../enumerations/AppType.md)

Type of app to launch

#### Returns

[`IAppLauncher`](../interfaces/IAppLauncher.md)

App launcher instance

***

### getCanvasLauncher()

> `static` **getCanvasLauncher**(`page`): [`IAppLauncher`](../interfaces/IAppLauncher.md)

Defined in: core/app-launcher.factory.ts:71

Get launcher for Canvas Apps

#### Parameters

##### page

`Page`

Playwright page

#### Returns

[`IAppLauncher`](../interfaces/IAppLauncher.md)

Canvas app launcher

***

### getModelDrivenLauncher()

> `static` **getModelDrivenLauncher**(`page`): [`IAppLauncher`](../interfaces/IAppLauncher.md)

Defined in: core/app-launcher.factory.ts:80

Get launcher for Model Driven Apps

#### Parameters

##### page

`Page`

Playwright page

#### Returns

[`IAppLauncher`](../interfaces/IAppLauncher.md)

Model driven app launcher

***

### clearCache()

> `static` **clearCache**(): `void`

Defined in: core/app-launcher.factory.ts:88

Clear all cached launcher instances
Use this when you need to reset state between tests

#### Returns

`void`

***

### clearCacheForPage()

> `static` **clearCacheForPage**(`page`): `void`

Defined in: core/app-launcher.factory.ts:96

Clear launcher cache for a specific page

#### Parameters

##### page

`Page`

Playwright page

#### Returns

`void`

***

### hasLauncher()

> `static` **hasLauncher**(`page`, `appType`): `boolean`

Defined in: core/app-launcher.factory.ts:125

Check if a launcher exists for the given page and app type

#### Parameters

##### page

`Page`

Playwright page

##### appType

[`AppType`](../enumerations/AppType.md)

Type of app

#### Returns

`boolean`

true if launcher exists in cache
