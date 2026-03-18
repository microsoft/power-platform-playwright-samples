/**
 * Type definitions for Model-Driven App Components
 * Common types used across component abstractions
 */

/**
 * Options for opening a record from grid
 */
export interface GridRecordOptions {
  /** Open record at specific row index (0-based) */
  rowNumber?: number;
  /** Open record by matching column value */
  columnValue?: string;
  /** Column name to search in (required if columnValue is provided) */
  columnName?: string;
}

/**
 * Options for sorting grid columns
 */
export interface GridSortOptions {
  /** Column name to sort by */
  columnName: string;
  /** Sort direction (ascending or descending) */
  direction?: 'asc' | 'desc';
}

/**
 * Options for filtering grid columns
 */
export interface GridFilterOptions {
  /** Column name to filter */
  columnName: string;
  /** Filter operator */
  operator: 'equals' | 'contains' | 'startsWith';
  /** Filter value */
  value: string;
}
