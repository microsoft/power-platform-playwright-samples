[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / PowerPlatformNavigator

# Class: PowerPlatformNavigator

Defined in: core/power-platform-navigator.ts:70

Orchestrates navigation to Power Platform maker portal pages
Provides modular, reusable navigation logic with proper separation of concerns

## Example

```typescript
const navigator = new PowerPlatformNavigator(page, locators);

// Navigate to Apps page
await navigator.navigateToApps();

// Navigate to Solutions page with custom timeout
await navigator.navigateToSolutions({ timeout: 30000 });

// Navigate to Home page without waiting
await navigator.navigateToHome({ waitForLoad: false });
```

## Constructors

### Constructor

> **new PowerPlatformNavigator**(`page`, `locators`, `options?`): `PowerPlatformNavigator`

Defined in: core/power-platform-navigator.ts:80

Creates a new PowerPlatformNavigator instance

#### Parameters

##### page

`Page`

Playwright page object

##### locators

[`PowerAppsPageLocators`](PowerAppsPageLocators.md)

PowerAppsPageLocators instance

##### options?

[`NavigatorOptions`](../interfaces/NavigatorOptions.md)

Navigator configuration options

#### Returns

`PowerPlatformNavigator`

## Methods

### navigateToApps()

> **navigateToApps**(`options?`): `Promise`\<`void`\>

Defined in: core/power-platform-navigator.ts:100

Navigate to Apps page

#### Parameters

##### options?

[`NavigationOptions`](../interfaces/NavigationOptions.md)

Navigation options

#### Returns

`Promise`\<`void`\>

#### Throws

If navigation fails

#### Example

```typescript
await navigator.navigateToApps();
// Apps page is now loaded and ready
```

***

### navigateToSolutions()

> **navigateToSolutions**(`options?`): `Promise`\<`void`\>

Defined in: core/power-platform-navigator.ts:116

Navigate to Solutions page

#### Parameters

##### options?

[`NavigationOptions`](../interfaces/NavigationOptions.md)

Navigation options

#### Returns

`Promise`\<`void`\>

#### Throws

If navigation fails

#### Example

```typescript
await navigator.navigateToSolutions({ timeout: 30000 });
// Solutions page is now loaded
```

***

### navigateToHome()

> **navigateToHome**(`options?`): `Promise`\<`void`\>

Defined in: core/power-platform-navigator.ts:132

Navigate to Home page

#### Parameters

##### options?

[`NavigationOptions`](../interfaces/NavigationOptions.md)

Navigation options

#### Returns

`Promise`\<`void`\>

#### Throws

If navigation fails

#### Example

```typescript
await navigator.navigateToHome();
// Home page is now loaded
```

***

### navigateToFlows()

> **navigateToFlows**(`options?`): `Promise`\<`void`\>

Defined in: core/power-platform-navigator.ts:142

Navigate to Flows page

#### Parameters

##### options?

[`NavigationOptions`](../interfaces/NavigationOptions.md)

Navigation options

#### Returns

`Promise`\<`void`\>

#### Throws

If navigation fails

***

### navigateToTables()

> **navigateToTables**(`options?`): `Promise`\<`void`\>

Defined in: core/power-platform-navigator.ts:152

Navigate to Tables page

#### Parameters

##### options?

[`NavigationOptions`](../interfaces/NavigationOptions.md)

Navigation options

#### Returns

`Promise`\<`void`\>

#### Throws

If navigation fails

***

### navigateToConnections()

> **navigateToConnections**(`options?`): `Promise`\<`void`\>

Defined in: core/power-platform-navigator.ts:162

Navigate to Connections page

#### Parameters

##### options?

[`NavigationOptions`](../interfaces/NavigationOptions.md)

Navigation options

#### Returns

`Promise`\<`void`\>

#### Throws

If navigation fails

***

### getURLBuilder()

> **getURLBuilder**(): [`URLBuilder`](URLBuilder.md)

Defined in: core/power-platform-navigator.ts:218

Get the URLBuilder instance
Useful for getting URLs without navigating

#### Returns

[`URLBuilder`](URLBuilder.md)

URLBuilder instance

#### Example

```typescript
const urlBuilder = navigator.getURLBuilder();
const appsUrl = urlBuilder.buildAppsPageUrl();
console.log('Apps URL:', appsUrl);
```

***

### getWaiterFactory()

> **getWaiterFactory**(): [`PageWaiterFactory`](PageWaiterFactory.md)

Defined in: core/power-platform-navigator.ts:228

Get the PageWaiterFactory instance
Useful for accessing waiters directly

#### Returns

[`PageWaiterFactory`](PageWaiterFactory.md)

PageWaiterFactory instance

***

### setEnvironment()

> **setEnvironment**(`environmentId`): `void`

Defined in: core/power-platform-navigator.ts:242

Update environment ID for subsequent navigations

#### Parameters

##### environmentId

`string`

New environment ID

#### Returns

`void`

#### Example

```typescript
navigator.setEnvironment('env-123');
await navigator.navigateToApps(); // Will use env-123
```

***

### isOnPage()

> **isOnPage**(`pageType`): `Promise`\<`boolean`\>

Defined in: core/power-platform-navigator.ts:251

Check if currently on a specific page type

#### Parameters

##### pageType

[`PageType`](../type-aliases/PageType.md)

Type of page to check

#### Returns

`Promise`\<`boolean`\>

true if on the specified page type, false otherwise
