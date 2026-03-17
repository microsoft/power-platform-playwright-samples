[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / GenUxConstants

# Variable: GenUxConstants

> `const` **GenUxConstants**: `object`

Defined in: components/gen-ux/gen-ux.constants.ts:4

GenUX constants — test data and field detection patterns for generated Power Apps

## Type Declaration

### FIELD\_PATTERNS

> `readonly` **FIELD\_PATTERNS**: `object`

Regex patterns for detecting common form field names in generated apps

#### FIELD\_PATTERNS.FIRSTNAME

> `readonly` **FIRSTNAME**: `RegExp`

#### FIELD\_PATTERNS.LASTNAME

> `readonly` **LASTNAME**: `RegExp`

#### FIELD\_PATTERNS.EMAIL

> `readonly` **EMAIL**: `RegExp`

#### FIELD\_PATTERNS.PHONE

> `readonly` **PHONE**: `RegExp`

#### FIELD\_PATTERNS.ADDRESS

> `readonly` **ADDRESS**: `RegExp`

### VALID\_FORM\_DATA

> `readonly` **VALID\_FORM\_DATA**: `object`

Standard valid test data for form filling

#### VALID\_FORM\_DATA.firstName

> `readonly` **firstName**: `"John"` = `'John'`

#### VALID\_FORM\_DATA.lastName

> `readonly` **lastName**: `"Doe"` = `'Doe'`

#### VALID\_FORM\_DATA.email

> `readonly` **email**: `"john.doe@example.com"` = `'john.doe@example.com'`

### EDGE\_CASE\_DATA

> `readonly` **EDGE\_CASE\_DATA**: `object`

Edge case data: unicode, apostrophes, plus-addressing

#### EDGE\_CASE\_DATA.firstName

> `readonly` **firstName**: `"José María"` = `'José María'`

#### EDGE\_CASE\_DATA.lastName

> `readonly` **lastName**: `"O'Connor-Smith"` = `"O'Connor-Smith"`

#### EDGE\_CASE\_DATA.email

> `readonly` **email**: `"test.email+tag@example.co.uk"` = `'test.email+tag@example.co.uk'`
