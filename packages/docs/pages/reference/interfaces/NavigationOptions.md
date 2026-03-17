[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / NavigationOptions

# Interface: NavigationOptions

Defined in: core/power-platform-navigator.ts:32

Options for navigation operations

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: core/power-platform-navigator.ts:37

Maximum wait time in milliseconds

#### Default

```ts
60000;
```

---

### waitForLoad?

> `optional` **waitForLoad**: `boolean`

Defined in: core/power-platform-navigator.ts:43

Whether to wait for page load after navigation

#### Default

```ts
true;
```

---

### waitForNetworkIdle?

> `optional` **waitForNetworkIdle**: `boolean`

Defined in: core/power-platform-navigator.ts:49

Whether to wait for networkidle state

#### Default

```ts
false (not recommended for modern apps that continuously poll)
```
