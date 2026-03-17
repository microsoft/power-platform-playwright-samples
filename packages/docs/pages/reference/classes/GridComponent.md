[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / GridComponent

# Class: GridComponent

Defined in: components/model-driven/grid.component.ts:23

## Constructors

### Constructor

> **new GridComponent**(`page`, `gridLocators`): `GridComponent`

Defined in: components/model-driven/grid.component.ts:24

#### Parameters

##### page

`Page`

##### gridLocators

`any`

#### Returns

`GridComponent`

## Methods

### openRecord()

> **openRecord**(`options`): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:47

Open a record from the grid
Supports opening by row number or by searching for column value

#### Parameters

##### options

[`GridRecordOptions`](../interfaces/GridRecordOptions.md)

Record selection options

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Open first record
await grid.openRecord({ rowNumber: 0 });

// Open record by column value
await grid.openRecord({
  columnValue: 'TEST-123',
  columnName: 'Order Number'
});
```

***

### selectRow()

> **selectRow**(`rowNumber`): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:108

Select a single row by index
Uses checkbox selection if available, otherwise clicks row

#### Parameters

##### rowNumber

`number`

Row index (0-based)

#### Returns

`Promise`\<`void`\>

***

### selectRows()

> **selectRows**(`rowNumbers`): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:130

Select multiple rows

#### Parameters

##### rowNumbers

`number`[]

Array of row indices to select

#### Returns

`Promise`\<`void`\>

***

### getCellValue()

> **getCellValue**(`row`, `column`): `Promise`\<`string`\>

Defined in: components/model-driven/grid.component.ts:146

Get cell value at specific row and column

Uses ag-Grid's `row-index` and `col-id` attributes for reliable targeting,
avoiding fragile positional nth-child selectors.

#### Parameters

##### row

`number`

Row index (0-based, matches ag-Grid row-index attribute)

##### column

`string`

Column schema name (col-id, e.g. 'nwind_ordernumber') or display name

#### Returns

`Promise`\<`string`\>

Cell text content

***

### getRowCount()

> **getRowCount**(): `Promise`\<`number`\>

Defined in: components/model-driven/grid.component.ts:199

Get total number of rows in the grid (excluding header)

#### Returns

`Promise`\<`number`\>

Number of data rows

***

### sortByColumn()

> **sortByColumn**(`columnName`, `direction`): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:211

Sort grid by column

#### Parameters

##### columnName

`string`

Column name to sort by

##### direction

Sort direction ('asc' or 'desc')

`"asc"` | `"desc"`

#### Returns

`Promise`\<`void`\>

***

### waitForGridLoad()

> **waitForGridLoad**(): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:239

Wait for grid to fully load
Waits for grid container to be visible and loading indicator to disappear

#### Returns

`Promise`\<`void`\>

***

### isGridEmpty()

> **isGridEmpty**(): `Promise`\<`boolean`\>

Defined in: components/model-driven/grid.component.ts:257

Check if grid is empty (has no data rows)

#### Returns

`Promise`\<`boolean`\>

true if grid has no records

***

### filterByColumn()

> **filterByColumn**(`columnLabel`, `value`): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:279

Filter grid by a specific column using the column-level "begins with" filter.

This uses the column header filter panel in Model-Driven App ag-Grid views.
Clicking the column's filter searchbox opens a "begins with" input which
is then filled and submitted.

#### Parameters

##### columnLabel

`string`

Column label as it appears in the filter searchbox
  (e.g. `'Order'` for the aria-label `"Order Filter by keyword"`)

##### value

`string`

Value to filter by

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Filter orders list to rows where order number begins with "0915"
await grid.filterByColumn('Order', '0915');
```

***

### filterByKeyword()

> **filterByKeyword**(`keyword`): `Promise`\<`void`\>

Defined in: components/model-driven/grid.component.ts:306

Filter grid by keyword using the search box
Uses the "Filter by keyword" search box in the grid toolbar

#### Parameters

##### keyword

`string`

The keyword to search for

#### Returns

`Promise`\<`void`\>

***

### getGrid()

> **getGrid**(): `Locator`

Defined in: components/model-driven/grid.component.ts:334

Get the grid locator
Low-level method for custom operations

#### Returns

`Locator`

Grid container locator
