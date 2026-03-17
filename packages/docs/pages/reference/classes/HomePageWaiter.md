[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / HomePageWaiter

# Class: HomePageWaiter

Defined in: core/page-waiters/home-page-waiter.ts:23

Waits for Power Apps maker portal Home page to fully load
Implements flexible wait strategy with optional elements and fallbacks

## Example

```typescript
const waiter = new HomePageWaiter(page, locators);
await waiter.waitForPageLoad();
// Home page is now ready
```

## Implements

- [`IPageWaiter`](../interfaces/IPageWaiter.md)

## Constructors

### Constructor

> **new HomePageWaiter**(`page`, `locators`): `HomePageWaiter`

Defined in: core/page-waiters/home-page-waiter.ts:29

Creates a new HomePageWaiter instance

#### Parameters

##### page

`Page`

Playwright page object

##### locators

[`PowerAppsPageLocators`](PowerAppsPageLocators.md)

PowerAppsPageLocators instance

#### Returns

`HomePageWaiter`

## Methods

### waitForPageLoad()

> **waitForPageLoad**(`timeout`): `Promise`\<`void`\>

Defined in: core/page-waiters/home-page-waiter.ts:46

Wait for Home page to fully load
Flexible wait strategy:
1. Root element (required)
2. Page header (required)
3. Main navigation (optional - tries multiple selectors)
4. Main content (optional - may not exist on error pages)
5. Spinner disappearance

#### Parameters

##### timeout

`number` = `60000`

Maximum wait time in milliseconds (default: 60000)

#### Returns

`Promise`\<`void`\>

#### Throws

If critical elements fail to load within timeout

#### Implementation of

[`IPageWaiter`](../interfaces/IPageWaiter.md).[`waitForPageLoad`](../interfaces/IPageWaiter.md#waitforpageload)

***

### isPageLoaded()

> **isPageLoaded**(): `Promise`\<`boolean`\>

Defined in: core/page-waiters/home-page-waiter.ts:71

Check if Home page is currently loaded

#### Returns

`Promise`\<`boolean`\>

true if critical elements are visible, false otherwise

#### Implementation of

[`IPageWaiter`](../interfaces/IPageWaiter.md).[`isPageLoaded`](../interfaces/IPageWaiter.md#ispageloaded)
