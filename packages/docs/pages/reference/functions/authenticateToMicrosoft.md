[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / authenticateToMicrosoft

# Function: authenticateToMicrosoft()

> **authenticateToMicrosoft**(`url`, `headless`): `Promise`\<`void`\>

Defined in: auth/MsAuthHelper.ts:128

Authenticate to Microsoft using playwright-ms-auth

## Parameters

### url

`string`

URL to authenticate to (e.g., Power Apps maker portal)

### headless

`boolean` = `true`

Whether to run browser in headless mode

## Returns

`Promise`\<`void`\>

## Remarks

This function uses playwright-ms-auth v0.0.16+ which automatically waits for
MSAL tokens to be stored in localStorage before saving the storage state.

Configuration options:

- MS_AUTH_WAIT_FOR_MSAL_TOKENS: Enable/disable MSAL token waiting (default: true)
- MS_AUTH_MSAL_TOKEN_TIMEOUT: Timeout in milliseconds (default: 30000)

## Example

```typescript
// Basic authentication
await authenticateToMicrosoft('https://make.powerapps.com/home', false);

// With custom MSAL timeout (via environment)
process.env.MS_AUTH_MSAL_TOKEN_TIMEOUT = '60000'; // 60 seconds
await authenticateToMicrosoft('https://make.powerapps.com/home', true);
```
