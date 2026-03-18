[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / ConfigHelper

# Class: ConfigHelper

Defined in: utils/config.ts:67

Configuration helper for Power Platform testing

## Example

```typescript
import { ConfigHelper } from '@playwright-power-platform/toolkit';

const baseUrl = ConfigHelper.getBaseUrl();
const tenantId = ConfigHelper.getTenantId();
```

## Constructors

### Constructor

> **new ConfigHelper**(): `ConfigHelper`

#### Returns

`ConfigHelper`

## Methods

### getBaseUrl()

> `static` **getBaseUrl**(): `string`

Defined in: utils/config.ts:74

Get base URL for Power Apps

#### Returns

`string`

Base URL from environment variable or default

#### Default

```ts
'https://make.powerapps.com';
```

---

### getBapApiUrl()

> `static` **getBapApiUrl**(): `string`

Defined in: utils/config.ts:85

Get Business Application Platform (BAP) API base URL
Used for environment, tenant, and settings management

#### Returns

`string`

BAP API URL from environment variable or default

#### Default

```ts
'https://api.bap.microsoft.com';
```

---

### getCanvasDesignerUrl()

> `static` **getCanvasDesignerUrl**(): `string`

Defined in: utils/config.ts:95

Get canvas designer URL

#### Returns

`string`

Canvas designer URL from environment variable or default

#### Default

```ts
'https://apps.powerapps.com/';
```

---

### getCanvasAppId()

> `static` **getCanvasAppId**(): `string` \| `undefined`

Defined in: utils/config.ts:102

Get Canvas app ID from environment

#### Returns

`string` \| `undefined`

---

### getModelAppId()

> `static` **getModelAppId**(): `string` \| `undefined`

Defined in: utils/config.ts:109

Get Model-Driven app ID from environment

#### Returns

`string` \| `undefined`

---

### getAuthEndpoint()

> `static` **getAuthEndpoint**(): `string`

Defined in: utils/config.ts:119

Get authentication endpoint

#### Returns

`string`

Auth endpoint from environment variable or default

#### Default

```ts
'https://login.microsoftonline.com';
```

---

### getEnvironmentId()

> `static` **getEnvironmentId**(): `string` \| `undefined`

Defined in: utils/config.ts:128

Get environment ID from environment variable

#### Returns

`string` \| `undefined`

Environment ID or undefined if not set

---

### getTenantId()

> `static` **getTenantId**(): `string`

Defined in: utils/config.ts:138

Get tenant ID from environment variable

#### Returns

`string`

Tenant ID

#### Throws

If AZURE_TENANT_ID is not set

---

### extractEnvironmentId()

> `static` **extractEnvironmentId**(`url`): `string` \| `null`

Defined in: utils/config.ts:160

Extract environment ID from a Power Apps URL

#### Parameters

##### url

`string`

Power Apps URL containing environment ID

#### Returns

`string` \| `null`

Environment ID or null if not found

#### Example

```typescript
const envId = ConfigHelper.extractEnvironmentId(
  'https://make.powerapps.com/environments/abc-123/apps'
);
// Returns: 'abc-123'
```

---

### buildUrl()

> `static` **buildUrl**(`path`, `environmentId?`): `string`

Defined in: utils/config.ts:178

Build full URL with optional environment ID

#### Parameters

##### path

`string`

Path to append (e.g., '/apps', '/solutions')

##### environmentId?

`string`

Optional environment ID to include in URL

#### Returns

`string`

Full URL with environment and path

#### Example

```typescript
const url = ConfigHelper.buildUrl('/apps', 'env-123');
// Returns: 'https://make.powerapps.com/environments/env-123/apps'
```

---

### getAuthToken()

> `static` **getAuthToken**(`storagePath?`, `apiUrl?`): `string` \| `undefined`

Defined in: utils/config.ts:204

Get authentication token from storage state

Retrieves the Bearer token from the stored authentication state.
Optionally filters by API URL to get a token with the correct audience.

#### Parameters

##### storagePath?

`string`

Optional custom path to storage state file

##### apiUrl?

`string`

Optional API URL to match token audience

#### Returns

`string` \| `undefined`

Bearer token string or undefined if not found

#### Example

```typescript
const token = ConfigHelper.getAuthToken();
const bapToken = ConfigHelper.getAuthToken(undefined, 'https://api.bap.microsoft.com');
```

---

### checkStorageStateExpiration()

> `static` **checkStorageStateExpiration**(`storagePath?`): [`TokenExpirationCheck`](../interfaces/TokenExpirationCheck.md)

Defined in: utils/config.ts:225

Check storage state token expiration

Reads the storage state file and checks if authentication tokens have expired.

#### Parameters

##### storagePath?

`string`

Optional custom path to storage state file

#### Returns

[`TokenExpirationCheck`](../interfaces/TokenExpirationCheck.md)

Token expiration check result

#### Example

```typescript
const check = ConfigHelper.checkStorageStateExpiration();

if (check.expired) {
  console.log('Token expired, please re-authenticate');
}
```

---

### getDefaultUrl()

> `static` **getDefaultUrl**(): `string`

Defined in: utils/config.ts:235

Get default URL path (home page)

#### Returns

`string`

Default path string

#### Default

```ts
'/home';
```
