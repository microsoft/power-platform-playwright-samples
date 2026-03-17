[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / FormContextData

# Interface: FormContextData

Defined in: components/model-driven/form.context.ts:36

FormContext data structure returned from Model-Driven App

## Properties

### entityName

> **entityName**: `string`

Defined in: components/model-driven/form.context.ts:38

Entity logical name (e.g., 'account', 'nwind_order')

---

### entityId

> **entityId**: `string`

Defined in: components/model-driven/form.context.ts:40

Entity GUID

---

### primaryAttributeValue

> **primaryAttributeValue**: `string`

Defined in: components/model-driven/form.context.ts:42

Primary attribute value (usually the record name)

---

### isDirty

> **isDirty**: `boolean`

Defined in: components/model-driven/form.context.ts:44

Whether the form has unsaved changes

---

### isValid

> **isValid**: `boolean`

Defined in: components/model-driven/form.context.ts:46

Whether all form data is valid

---

### attributeNames

> **attributeNames**: `string`[]

Defined in: components/model-driven/form.context.ts:48

All attribute names on the form
