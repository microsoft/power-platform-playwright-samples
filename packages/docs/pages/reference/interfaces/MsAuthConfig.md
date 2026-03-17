[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / MsAuthConfig

# Interface: MsAuthConfig

Defined in: auth/MsAuthHelper.ts:24

Microsoft Authentication configuration

## Remarks

This interface extends the playwright-ms-auth configuration with additional
MSAL token waiting options specific to Power Platform SPAs.

## Properties

### email

> **email**: `string`

Defined in: auth/MsAuthHelper.ts:25

***

### credentialType?

> `optional` **credentialType**: `"password"` \| `"token"` \| `"certificate"`

Defined in: auth/MsAuthHelper.ts:26

***

### credentialProvider?

> `optional` **credentialProvider**: `"environment"` \| `"azure-keyvault"` \| `"local-file"` \| `"github-secrets"`

Defined in: auth/MsAuthHelper.ts:27

***

### providerConfig?

> `optional` **providerConfig**: `any`

Defined in: auth/MsAuthHelper.ts:28

***

### envVariableName?

> `optional` **envVariableName**: `string`

Defined in: auth/MsAuthHelper.ts:29

***

### localFilePath?

> `optional` **localFilePath**: `string`

Defined in: auth/MsAuthHelper.ts:30

***

### certificatePassword?

> `optional` **certificatePassword**: `string`

Defined in: auth/MsAuthHelper.ts:31

***

### headless?

> `optional` **headless**: `boolean`

Defined in: auth/MsAuthHelper.ts:32

***

### timeout?

> `optional` **timeout**: `number`

Defined in: auth/MsAuthHelper.ts:33

***

### waitForMsalTokens?

> `optional` **waitForMsalTokens**: `boolean`

Defined in: auth/MsAuthHelper.ts:35

Wait for MSAL tokens to be stored in localStorage (default: true)

***

### msalTokenTimeout?

> `optional` **msalTokenTimeout**: `number`

Defined in: auth/MsAuthHelper.ts:37

Timeout for waiting for MSAL tokens in milliseconds (default: 30000)
