[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / checkEnvironmentVariables

# Function: checkEnvironmentVariables()

> **checkEnvironmentVariables**(): `void`

Defined in: utils/auth-helpers.ts:238

Validate that required authentication environment variables are set

Checks for the presence of required environment variables for authentication.
Supports both password and certificate-based authentication.

## Returns

`void`

## Throws

If required environment variables are missing

## Example

```typescript
try {
  checkEnvironmentVariables();
  console.log('All required environment variables are set');
} catch (error) {
  console.error('Missing environment variables:', error.message);
}
```
