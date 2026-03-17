[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / loadAuthConfig

# Function: loadAuthConfig()

> **loadAuthConfig**(): [`MsAuthConfig`](../interfaces/MsAuthConfig.md)

Defined in: auth/MsAuthHelper.ts:50

Load MS Auth configuration from environment variables

## Returns

[`MsAuthConfig`](../interfaces/MsAuthConfig.md)

## Remarks

Reads configuration from environment variables including:

- MS_AUTH_EMAIL: Email address
- MS_AUTH_CREDENTIAL_TYPE: password, token, or certificate
- MS_AUTH_WAIT_FOR_MSAL_TOKENS: Wait for MSAL tokens (default: true)
- MS_AUTH_MSAL_TOKEN_TIMEOUT: MSAL token timeout in ms (default: 30000)
