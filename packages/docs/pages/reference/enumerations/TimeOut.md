[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / TimeOut

# Enumeration: TimeOut

Defined in: utils/config.ts:23

Timeout constants (in milliseconds)

## Example

```typescript
import { TimeOut } from '@playwright-power-platform/toolkit';

await page.waitForSelector('.my-element', { timeout: TimeOut.DefaultWaitTime });
```

## Enumeration Members

### DefaultLoopWaitTime

> **DefaultLoopWaitTime**: `5000`

Defined in: utils/config.ts:25

5 seconds - Default loop wait time

---

### DefaultWaitTime

> **DefaultWaitTime**: `30000`

Defined in: utils/config.ts:27

30 seconds - Default wait time

---

### DefaultMaxWaitTime

> **DefaultMaxWaitTime**: `180000`

Defined in: utils/config.ts:29

3 minutes - Default maximum wait time

---

### DefaultWaitTimeForValidation

> **DefaultWaitTimeForValidation**: `30000`

Defined in: utils/config.ts:31

30 seconds - Default wait time for validation

---

### ElementWaitTime

> **ElementWaitTime**: `2000`

Defined in: utils/config.ts:33

2 seconds - Element wait time

---

### FiveMinutesTimeout

> **FiveMinutesTimeout**: `300000`

Defined in: utils/config.ts:35

5 minutes - Five minutes timeout

---

### LoadTimeOut

> **LoadTimeOut**: `60000`

Defined in: utils/config.ts:37

1 minute - Load timeout

---

### NavigationTimeout

> **NavigationTimeout**: `60000`

Defined in: utils/config.ts:39

1 minute - Navigation timeout

---

### OneMinuteTimeOut

> **OneMinuteTimeOut**: `60000`

Defined in: utils/config.ts:41

1 minute - One minute timeout

---

### OptionalElementTimeout

> **OptionalElementTimeout**: `5000`

Defined in: utils/config.ts:43

5 seconds - Optional element timeout

---

### PageLoadTimeOut

> **PageLoadTimeOut**: `30000`

Defined in: utils/config.ts:45

30 seconds - Page load timeout

---

### TestTimeout

> **TestTimeout**: `360000`

Defined in: utils/config.ts:47

6 minutes - Test timeout

---

### TestTimeoutMax

> **TestTimeoutMax**: `600000`

Defined in: utils/config.ts:49

10 minutes - Maximum test timeout

---

### TwoMinutesTimeout

> **TwoMinutesTimeout**: `120000`

Defined in: utils/config.ts:51

2 minutes - Two minutes timeout

---

### FifteenMinutesTimeout

> **FifteenMinutesTimeout**: `900000`

Defined in: utils/config.ts:53

15 minutes - Fifteen minutes timeout
