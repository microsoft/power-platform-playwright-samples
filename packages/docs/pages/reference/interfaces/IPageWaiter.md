[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / IPageWaiter

# Interface: IPageWaiter

Defined in: core/page-waiters/page-waiter.interface.ts:25

Interface for page wait strategies
Each Power Platform page (Apps, Solutions, Home, etc.) implements this interface
to provide page-specific wait logic

## Example

```typescript
class AppsPageWaiter implements IPageWaiter {
  async waitForPageLoad(timeout?: number): Promise<void> {
    // Wait for apps page specific elements
  }

  async isPageLoaded(): Promise<boolean> {
    // Check if apps page is loaded
    return true;
  }
}
```

## Methods

### waitForPageLoad()

> **waitForPageLoad**(`timeout?`): `Promise`\<`void`\>

Defined in: core/page-waiters/page-waiter.interface.ts:39

Wait for page to fully load
Implements page-specific wait strategy (elements, error detection, spinner, etc.)

#### Parameters

##### timeout?

`number`

Maximum wait time in milliseconds (default: 60000)

#### Returns

`Promise`\<`void`\>

#### Throws

If page load fails or timeout is reached

#### Example

```typescript
const waiter = new AppsPageWaiter(page, locators);
await waiter.waitForPageLoad(30000);
```

---

### isPageLoaded()

> **isPageLoaded**(): `Promise`\<`boolean`\>

Defined in: core/page-waiters/page-waiter.interface.ts:55

Check if page is currently loaded
Returns immediately without waiting

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if page is loaded, false otherwise

#### Example

```typescript
const isLoaded = await waiter.isPageLoaded();
if (!isLoaded) {
  console.log('Page not ready yet');
}
```
