[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / SolutionsPageWaiter

# Class: SolutionsPageWaiter

Defined in: core/page-waiters/solutions-page-waiter.ts:22

Waits for Power Apps maker portal Solutions page to fully load
Implements simple 3-element wait strategy

## Example

```typescript
const waiter = new SolutionsPageWaiter(page, locators);
await waiter.waitForPageLoad();
// Solutions page is now ready
```

## Implements

- [`IPageWaiter`](../interfaces/IPageWaiter.md)

## Constructors

### Constructor

> **new SolutionsPageWaiter**(`page`, `locators`): `SolutionsPageWaiter`

Defined in: core/page-waiters/solutions-page-waiter.ts:28

Creates a new SolutionsPageWaiter instance

#### Parameters

##### page

`Page`

Playwright page object

##### locators

[`PowerAppsPageLocators`](PowerAppsPageLocators.md)

PowerAppsPageLocators instance

#### Returns

`SolutionsPageWaiter`

## Methods

### waitForPageLoad()

> **waitForPageLoad**(`timeout`): `Promise`\<`void`\>

Defined in: core/page-waiters/solutions-page-waiter.ts:44

Wait for Solutions page to fully load
Simple wait strategy:
1. Solutions sidebar
2. Command bar
3. Solutions list container
4. Spinner disappearance

#### Parameters

##### timeout

`number` = `60000`

Maximum wait time in milliseconds (default: 60000)

#### Returns

`Promise`\<`void`\>

#### Throws

If page fails to load within timeout

#### Implementation of

[`IPageWaiter`](../interfaces/IPageWaiter.md).[`waitForPageLoad`](../interfaces/IPageWaiter.md#waitforpageload)

***

### isPageLoaded()

> **isPageLoaded**(): `Promise`\<`boolean`\>

Defined in: core/page-waiters/solutions-page-waiter.ts:66

Check if Solutions page is currently loaded

#### Returns

`Promise`\<`boolean`\>

true if critical elements are visible, false otherwise

#### Implementation of

[`IPageWaiter`](../interfaces/IPageWaiter.md).[`isPageLoaded`](../interfaces/IPageWaiter.md#ispageloaded)
