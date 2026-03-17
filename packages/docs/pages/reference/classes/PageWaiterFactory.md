[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / PageWaiterFactory

# Class: PageWaiterFactory

Defined in: core/page-waiters/page-waiter-factory.ts:55

Factory for creating page waiter instances
Uses singleton pattern to reuse waiter instances per page type

## Example

```typescript
const factory = new PageWaiterFactory(page, locators);
const appsWaiter = factory.getWaiter('apps');
await appsWaiter.waitForPageLoad();

const solutionsWaiter = factory.getWaiter('solutions');
await solutionsWaiter.waitForPageLoad();
```

## Constructors

### Constructor

> **new PageWaiterFactory**(`page`, `locators`): `PageWaiterFactory`

Defined in: core/page-waiters/page-waiter-factory.ts:63

Creates a new PageWaiterFactory instance

#### Parameters

##### page

`Page`

Playwright page object

##### locators

[`PowerAppsPageLocators`](PowerAppsPageLocators.md)

PowerAppsPageLocators instance

#### Returns

`PageWaiterFactory`

## Methods

### getWaiter()

> **getWaiter**(`pageType`): [`IPageWaiter`](../interfaces/IPageWaiter.md)

Defined in: core/page-waiters/page-waiter-factory.ts:81

Get a waiter for the specified page type
Returns cached instance if available, creates new one otherwise

#### Parameters

##### pageType

[`PageType`](../type-aliases/PageType.md)

Type of page ('apps', 'solutions', 'home', etc.)

#### Returns

[`IPageWaiter`](../interfaces/IPageWaiter.md)

IPageWaiter instance for the specified page type

#### Example

```typescript
const waiter = factory.getWaiter('apps');
await waiter.waitForPageLoad(30000);
```

***

### clearCache()

> **clearCache**(): `void`

Defined in: core/page-waiters/page-waiter-factory.ts:114

Clear all cached waiter instances
Useful when page context changes

#### Returns

`void`

***

### hasWaiter()

> **hasWaiter**(`pageType`): `boolean`

Defined in: core/page-waiters/page-waiter-factory.ts:123

Check if a waiter exists for the specified page type

#### Parameters

##### pageType

[`PageType`](../type-aliases/PageType.md)

Type of page

#### Returns

`boolean`

true if waiter instance is cached, false otherwise
