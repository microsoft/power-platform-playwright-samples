[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / LaunchAppConfig

# Interface: LaunchAppConfig

Defined in: core/app-provider.ts:24

Configuration for launching an app

## Properties

### app

> **app**: `string` \| \{ `id`: `string`; \} \| \{ `name`: `string`; \}

Defined in: core/app-provider.ts:26

App identifier - either name or ID

---

### type

> **type**: [`AppType`](../enumerations/AppType.md)

Defined in: core/app-provider.ts:28

Type of app to launch

---

### mode?

> `optional` **mode**: [`AppLaunchMode`](../enumerations/AppLaunchMode.md)

Defined in: core/app-provider.ts:30

Launch mode (play, edit, preview)

---

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: core/app-provider.ts:32

Base URL for maker portal navigation

---

### options?

> `optional` **options**: [`AppPlayerOptions`](AppPlayerOptions.md)

Defined in: core/app-provider.ts:34

Additional launch options

---

### skipMakerPortal?

> `optional` **skipMakerPortal**: `boolean`

Defined in: core/app-provider.ts:36

Skip maker portal navigation and open app directly

---

### directUrl?

> `optional` **directUrl**: `string`

Defined in: core/app-provider.ts:38

Direct URL to the app (requires skipMakerPortal: true)

---

### context?

> `optional` **context**: `BrowserContext`

Defined in: core/app-provider.ts:40

Browser context for handling new tabs (required for Play mode)
