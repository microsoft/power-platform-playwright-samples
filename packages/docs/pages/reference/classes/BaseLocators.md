[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / BaseLocators

# Abstract Class: BaseLocators

Defined in: locators/base.locators.ts:13

Base class for locator management using the builder pattern
Promotes reusability and maintainability of selectors

## Constructors

### Constructor

> **new BaseLocators**(`page`): `BaseLocators`

Defined in: locators/base.locators.ts:16

#### Parameters

##### page

`Page`

#### Returns

`BaseLocators`

## Properties

### page

> `protected` **page**: `Page`

Defined in: locators/base.locators.ts:14

## Methods

### getByTestId()

> `protected` **getByTestId**(`testId`): `Locator`

Defined in: locators/base.locators.ts:25

Get a locator by data-test-id attribute (preferred method)

#### Parameters

##### testId

`string`

The data-test-id value

#### Returns

`Locator`

Playwright Locator

***

### getByRole()

> `protected` **getByRole**(`role`, `options?`): `Locator`

Defined in: locators/base.locators.ts:35

Get a locator by role (accessible and semantic)

#### Parameters

##### role

ARIA role

`"button"` | `"cell"` | `"checkbox"` | `"combobox"` | `"dialog"` | `"grid"` | `"gridcell"` | `"heading"` | `"link"` | `"listbox"` | `"menubar"` | `"menuitem"` | `"navigation"` | `"option"` | `"radio"` | `"row"` | `"rowheader"` | `"searchbox"` | `"switch"` | `"tab"` | `"tabpanel"` | `"textbox"`

##### options?

Additional options like name, exact, etc.

###### name?

`string` \| `RegExp`

###### exact?

`boolean`

###### includeHidden?

`boolean`

#### Returns

`Locator`

Playwright Locator

***

### getByText()

> `protected` **getByText**(`text`, `options?`): `Locator`

Defined in: locators/base.locators.ts:70

Get a locator by text content

#### Parameters

##### text

Text content or RegExp

`string` | `RegExp`

##### options?

Additional options

###### exact?

`boolean`

#### Returns

`Locator`

Playwright Locator

***

### getByLabel()

> `protected` **getByLabel**(`label`, `options?`): `Locator`

Defined in: locators/base.locators.ts:80

Get a locator by label (for form inputs)

#### Parameters

##### label

Label text

`string` | `RegExp`

##### options?

Additional options

###### exact?

`boolean`

#### Returns

`Locator`

Playwright Locator

***

### getByPlaceholder()

> `protected` **getByPlaceholder**(`placeholder`): `Locator`

Defined in: locators/base.locators.ts:89

Get a locator by placeholder

#### Parameters

##### placeholder

Placeholder text

`string` | `RegExp`

#### Returns

`Locator`

Playwright Locator

***

### getByAriaLabel()

> `protected` **getByAriaLabel**(`label`): `Locator`

Defined in: locators/base.locators.ts:98

Get a locator by aria-label

#### Parameters

##### label

ARIA label text

`string` | `RegExp`

#### Returns

`Locator`

Playwright Locator

***

### locator()

> `protected` **locator**(`selector`): `Locator`

Defined in: locators/base.locators.ts:108

Fallback to CSS selector when semantic locators aren't available
Use sparingly and document why semantic locators can't be used

#### Parameters

##### selector

`string`

CSS selector

#### Returns

`Locator`

Playwright Locator

***

### chain()

> `protected` **chain**(`parent`, `child`): `Locator`

Defined in: locators/base.locators.ts:118

Chain locators for more specific targeting

#### Parameters

##### parent

`Locator`

Parent locator

##### child

Child selector or locator method

`string` | (`loc`) => `Locator`

#### Returns

`Locator`

Chained Playwright Locator
