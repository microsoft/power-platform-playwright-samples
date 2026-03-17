[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / AppsPageWaiter

# Class: AppsPageWaiter

Defined in: core/page-waiters/apps-page-waiter.ts:23

Waits for Power Apps maker portal Apps page to fully load
Implements comprehensive wait strategy with error detection and retries

## Example

```typescript
const waiter = new AppsPageWaiter(page, locators);
await waiter.waitForPageLoad(60000);
// Apps page is now ready
```

## Implements

- [`IPageWaiter`](../interfaces/IPageWaiter.md)

## Constructors

### Constructor

> **new AppsPageWaiter**(`page`, `locators`): `AppsPageWaiter`

Defined in: core/page-waiters/apps-page-waiter.ts:29

Creates a new AppsPageWaiter instance

#### Parameters

##### page

`Page`

Playwright page object

##### locators

[`PowerAppsPageLocators`](PowerAppsPageLocators.md)

PowerAppsPageLocators instance

#### Returns

`AppsPageWaiter`

## Methods

### waitForPageLoad()

> **waitForPageLoad**(`timeout`): `Promise`\<`void`\>

Defined in: core/page-waiters/apps-page-waiter.ts:46

Wait for Apps page to fully load
Implements multi-stage wait strategy:

1. Critical elements (sidebar, command bar)
2. VPN error detection
3. Data load error detection and retry
4. Optional elements (page container, grid)
5. Spinner disappearance

#### Parameters

##### timeout

`number` = `60000`

Maximum wait time in milliseconds (default: 60000)

#### Returns

`Promise`\<`void`\>

#### Throws

If VPN connectivity is required or page fails to load

#### Implementation of

[`IPageWaiter`](../interfaces/IPageWaiter.md).[`waitForPageLoad`](../interfaces/IPageWaiter.md#waitforpageload)

---

### isPageLoaded()

> **isPageLoaded**(): `Promise`\<`boolean`\>

Defined in: core/page-waiters/apps-page-waiter.ts:72

Check if Apps page is currently loaded

#### Returns

`Promise`\<`boolean`\>

true if critical elements are visible, false otherwise

#### Implementation of

[`IPageWaiter`](../interfaces/IPageWaiter.md).[`isPageLoaded`](../interfaces/IPageWaiter.md#ispageloaded)
