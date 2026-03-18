[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / LocatorUtils

# Class: LocatorUtils

Defined in: locators/base.locators.ts:129

Locator utility functions

## Constructors

### Constructor

> **new LocatorUtils**(): `LocatorUtils`

#### Returns

`LocatorUtils`

## Methods

### formatSelector()

> `static` **formatSelector**(`template`, ...`args`): `string`

Defined in: locators/base.locators.ts:138

Format a selector string with parameters

#### Parameters

##### template

`string`

Template string with {0}, {1}, etc. placeholders

##### args

...`string`[]

Arguments to replace placeholders

#### Returns

`string`

Formatted string

#### Example

```ts
LocatorUtils.formatSelector('[data-id="{0}"]', 'myId'); // => '[data-id="myId"]'
```

---

### dataTestId()

> `static` **dataTestId**(`testId`): `string`

Defined in: locators/base.locators.ts:149

Create a data-test-id selector

#### Parameters

##### testId

`string`

Test ID value

#### Returns

`string`

CSS selector string

---

### id()

> `static` **id**(`id`): `string`

Defined in: locators/base.locators.ts:158

Create an ID selector

#### Parameters

##### id

`string`

Element ID

#### Returns

`string`

CSS selector string

---

### className()

> `static` **className**(`className`): `string`

Defined in: locators/base.locators.ts:170

Create a class selector

#### Parameters

##### className

`string`

Class name (can contain wildcards for partial match)

#### Returns

`string`

CSS selector string

#### Example

```ts
LocatorUtils.className('my-class'); // => '.my-class'
LocatorUtils.className('*-button'); // => '[class*="-button"]'
```

---

### automationId()

> `static` **automationId**(`automationId`): `string`

Defined in: locators/base.locators.ts:182

Create an automation ID selector (for Microsoft Fluent UI)

#### Parameters

##### automationId

`string`

Automation ID value

#### Returns

`string`

CSS selector string

---

### automationKey()

> `static` **automationKey**(`automationKey`): `string`

Defined in: locators/base.locators.ts:191

Create a data-automation-key selector

#### Parameters

##### automationKey

`string`

Automation key value

#### Returns

`string`

CSS selector string

---

### ariaLabel()

> `static` **ariaLabel**(`label`): `string`

Defined in: locators/base.locators.ts:200

Create an aria-label selector

#### Parameters

##### label

`string`

ARIA label value

#### Returns

`string`

CSS selector string
