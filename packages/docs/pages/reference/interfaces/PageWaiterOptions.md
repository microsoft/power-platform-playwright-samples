[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / PageWaiterOptions

# Interface: PageWaiterOptions

Defined in: core/page-waiters/page-waiter.interface.ts:61

Options for configuring page waiter behavior

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: core/page-waiters/page-waiter.interface.ts:66

Maximum wait time in milliseconds

#### Default

```ts
60000
```

***

### retryOnError?

> `optional` **retryOnError**: `boolean`

Defined in: core/page-waiters/page-waiter.interface.ts:72

Whether to retry on error

#### Default

```ts
true
```

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: core/page-waiters/page-waiter.interface.ts:78

Maximum number of retries

#### Default

```ts
3
```

***

### throwOnTimeout?

> `optional` **throwOnTimeout**: `boolean`

Defined in: core/page-waiters/page-waiter.interface.ts:85

Whether to throw on timeout
If false, will log warning and continue

#### Default

```ts
true
```
