[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / URLBuilder

# Class: URLBuilder

Defined in: core/url-builder.ts:21

Builds URLs for Power Platform maker portal pages
Automatically includes environment ID when available

## Example

```typescript
const builder = new URLBuilder();
const appsUrl = builder.buildAppsPageUrl();
// Result: https://make.powerapps.com/environments/{envId}/apps
```

## Constructors

### Constructor

> **new URLBuilder**(`baseUrl?`, `environmentId?`): `URLBuilder`

Defined in: core/url-builder.ts:30

Creates a new URLBuilder instance

#### Parameters

##### baseUrl?

`string`

Base URL for Power Apps maker portal (defaults to ConfigHelper.getBaseUrl())

##### environmentId?

`string`

Environment ID to include in URLs (defaults to ConfigHelper.getEnvironmentId())

#### Returns

`URLBuilder`

## Methods

### buildAppsPageUrl()

> **buildAppsPageUrl**(): `string`

Defined in: core/url-builder.ts:44

Build URL for Apps page

#### Returns

`string`

URL for the Apps page

#### Example

```typescript
const url = builder.buildAppsPageUrl();
// https://make.powerapps.com/environments/{envId}/apps
```

***

### buildSolutionsPageUrl()

> **buildSolutionsPageUrl**(): `string`

Defined in: core/url-builder.ts:57

Build URL for Solutions page

#### Returns

`string`

URL for the Solutions page

#### Example

```typescript
const url = builder.buildSolutionsPageUrl();
// https://make.powerapps.com/environments/{envId}/solutions
```

***

### buildHomePageUrl()

> **buildHomePageUrl**(): `string`

Defined in: core/url-builder.ts:70

Build URL for Home page

#### Returns

`string`

URL for the Home page

#### Example

```typescript
const url = builder.buildHomePageUrl();
// https://make.powerapps.com/environments/{envId}/home
```

***

### buildFlowsPageUrl()

> **buildFlowsPageUrl**(): `string`

Defined in: core/url-builder.ts:81

Build URL for Flows page

#### Returns

`string`

URL for the Flows page

***

### buildTablesPageUrl()

> **buildTablesPageUrl**(): `string`

Defined in: core/url-builder.ts:89

Build URL for Tables page

#### Returns

`string`

URL for the Tables page

***

### buildConnectionsPageUrl()

> **buildConnectionsPageUrl**(): `string`

Defined in: core/url-builder.ts:97

Build URL for Connections page

#### Returns

`string`

URL for the Connections page

***

### setEnvironment()

> **setEnvironment**(`environmentId`): `void`

Defined in: core/url-builder.ts:122

Set or update the environment ID

#### Parameters

##### environmentId

`string`

New environment ID

#### Returns

`void`

#### Example

```typescript
builder.setEnvironment('env-123');
const url = builder.buildAppsPageUrl(); // Will include env-123
```

***

### getBaseUrl()

> **getBaseUrl**(): `string`

Defined in: core/url-builder.ts:130

Get current base URL

#### Returns

`string`

Current base URL

***

### getEnvironmentId()

> **getEnvironmentId**(): `string` \| `undefined`

Defined in: core/url-builder.ts:138

Get current environment ID

#### Returns

`string` \| `undefined`

Current environment ID or undefined
