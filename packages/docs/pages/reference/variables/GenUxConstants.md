[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / GenUxConstants

# Variable: GenUxConstants

> `const` **GenUxConstants**: `object`

Defined in: components/gen-ux/gen-ux.constants.ts:4

GenUX constants — test data and field detection patterns for generated Power Apps

## Type Declaration

### FIELD_PATTERNS

> `readonly` **FIELD_PATTERNS**: `object`

Regex patterns for detecting common form field names in generated apps

#### FIELD_PATTERNS.FIRSTNAME

> `readonly` **FIRSTNAME**: `RegExp`

#### FIELD_PATTERNS.LASTNAME

> `readonly` **LASTNAME**: `RegExp`

#### FIELD_PATTERNS.EMAIL

> `readonly` **EMAIL**: `RegExp`

#### FIELD_PATTERNS.PHONE

> `readonly` **PHONE**: `RegExp`

#### FIELD_PATTERNS.ADDRESS

> `readonly` **ADDRESS**: `RegExp`

### VALID_FORM_DATA

> `readonly` **VALID_FORM_DATA**: `object`

Standard valid test data for form filling

#### VALID_FORM_DATA.firstName

> `readonly` **firstName**: `"John"` = `'John'`

#### VALID_FORM_DATA.lastName

> `readonly` **lastName**: `"Doe"` = `'Doe'`

#### VALID_FORM_DATA.email

> `readonly` **email**: `"john.doe@example.com"` = `'john.doe@example.com'`

### EDGE_CASE_DATA

> `readonly` **EDGE_CASE_DATA**: `object`

Edge case data: unicode, apostrophes, plus-addressing

#### EDGE_CASE_DATA.firstName

> `readonly` **firstName**: `"José María"` = `'José María'`

#### EDGE_CASE_DATA.lastName

> `readonly` **lastName**: `"O'Connor-Smith"` = `"O'Connor-Smith"`

#### EDGE_CASE_DATA.email

> `readonly` **email**: `"test.email+tag@example.co.uk"` = `'test.email+tag@example.co.uk'`
