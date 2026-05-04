// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model Driven App Locators — factory-function style.
 *
 * Every entry is a function `(ctx, ...params?) => Locator`. Built-in Playwright
 * locators (`getByRole`, `getByLabel`, etc.) are used wherever a stable ARIA
 * contract exists. `ctx.locator(css)` is used only where no ARIA equivalent
 * exists (ag-Grid row attributes, internal data-automation-id) — these are
 * marked with comments.
 */

import { Page, Locator, FrameLocator } from '@playwright/test';

/** Any context that supports the Playwright `getBy*` + `locator()` API. */
type Ctx = Page | FrameLocator | Locator;

export const ModelDrivenAppLocators = {
  // ── Home Page — App Creation ──────────────────────────────────────────────

  Home: {
    CreateButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Create' }),
    CreateMenu: (ctx: Ctx) => ctx.getByRole('menu', { name: 'Create menu' }),
    BlankAppOption: (ctx: Ctx) => ctx.getByTestId('create-blank-model-app'),
    FromSolutionOption: (ctx: Ctx) => ctx.getByTestId('create-from-solution'),
    AppsGrid: (ctx: Ctx) => ctx.getByRole('grid', { name: 'Apps' }),
    AppCard: (ctx: Ctx, name: string) => ctx.getByRole('gridcell', { name }),
    SearchBox: (ctx: Ctx) => ctx.getByPlaceholder('Search'),
    // FRAGILE: app-type filter UI varies across Maker Portal versions
    AppTypeFilter: (ctx: Ctx) => ctx.locator('[data-id="app-type-filter"]'),
  },

  // ── Modern App Designer ───────────────────────────────────────────────────
  // 🎨 Studio authoring only.

  Designer: {
    CommandBar: {
      AppNameInput: (ctx: Ctx) => ctx.getByLabel('App name'),
      SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
      PublishButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Publish' }),
      PlayButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Play' }),
      SettingsButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Settings' }),
      ShareButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Share' }),
      ValidateButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Validate' }),
    },

    LeftNav: {
      NavigationTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Navigation' }),
      PagesTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Pages' }),
      DataTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Data' }),
      AutomationTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Automation' }),
    },

    Pages: {
      PagesList: (ctx: Ctx) => ctx.getByRole('tree', { name: 'Pages' }),
      AddPageButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Add page' }),
      TableBasedPage: (ctx: Ctx) => ctx.getByRole('button', { name: 'Table based view and form' }),
      DashboardPage: (ctx: Ctx) => ctx.getByRole('button', { name: 'Dashboard' }),
      CustomPage: (ctx: Ctx) => ctx.getByRole('button', { name: 'Custom page' }),
      PageItem: (ctx: Ctx, name: string) => ctx.getByRole('treeitem', { name }),
      PageMenu: (ctx: Ctx) => ctx.getByRole('button', { name: 'Page options' }),
      EditPage: (ctx: Ctx) => ctx.getByRole('button', { name: 'Edit' }),
      DeletePage: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete' }),
    },

    Navigation: {
      NavigationTree: (ctx: Ctx) => ctx.getByRole('tree', { name: 'Navigation' }),
      AddGroupButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Add group' }),
      AddSubAreaButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Add subarea' }),
      GroupItem: (ctx: Ctx, name: string) => ctx.getByRole('treeitem', { name }),
      SubAreaItem: (ctx: Ctx, name: string) => ctx.getByRole('treeitem', { name }),
      TitleInput: (ctx: Ctx) => ctx.getByLabel('Title'),
      TablePicker: (ctx: Ctx) => ctx.getByRole('button', { name: 'Choose table' }),
      UrlInput: (ctx: Ctx) => ctx.getByLabel('URL'),
    },

    Data: {
      AddTableButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Add table' }),
      SearchTable: (ctx: Ctx) => ctx.getByPlaceholder('Search tables'),
      TablesList: (ctx: Ctx) => ctx.getByRole('list', { name: 'Tables' }),
      TableItem: (ctx: Ctx, name: string) => ctx.getByRole('listitem', { name }),
    },

    Properties: {
      // FRAGILE: data-automation-id is an internal Studio attribute — no ARIA equivalent
      PropertiesPanel: (ctx: Ctx) => ctx.locator('[data-automation-id="properties-panel"]'),
      DisplayNameInput: (ctx: Ctx) => ctx.getByLabel('Display name'),
      DescriptionInput: (ctx: Ctx) => ctx.getByLabel('Description'),
    },

    // FRAGILE: data-automation-id is internal Studio — no ARIA equivalent
    Canvas: {
      PreviewArea: (ctx: Ctx) => ctx.locator('[data-automation-id="preview-area"]'),
      AppModule: (ctx: Ctx) => ctx.locator('[data-automation-id="app-module"]'),
      SiteMap: (ctx: Ctx) => ctx.locator('[data-automation-id="sitemap"]'),
    },
  },

  // ── Dialogs ───────────────────────────────────────────────────────────────

  CreateTableDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Create table' }),
    DisplayNameInput: (ctx: Ctx) => ctx.getByLabel('Display name'),
    PluralNameInput: (ctx: Ctx) => ctx.getByLabel('Plural name'),
    CreateButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Create' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
  },

  AddPageDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Add page' }),
    FormItem: (ctx: Ctx, name: string) => ctx.getByRole('listitem', { name }),
    ViewItem: (ctx: Ctx, name: string) => ctx.getByRole('listitem', { name }),
    SelectTableDropdown: (ctx: Ctx) => ctx.getByRole('combobox', { name: 'Table' }),
    AddButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Add' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
  },

  Settings: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Settings' }),
    GeneralTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'General' }),
    FeaturesTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Features' }),
    AppNameInput: (ctx: Ctx) => ctx.getByLabel('Name'),
    DescriptionInput: (ctx: Ctx) => ctx.getByLabel('Description'),
    EnableMobileToggle: (ctx: Ctx) => ctx.getByLabel('Enable for mobile'),
    EnableOfflineToggle: (ctx: Ctx) => ctx.getByLabel('Enable offline mode'),
    SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
  },

  PublishDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Publish' }),
    PublishButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Publish' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
    SuccessMessage: (ctx: Ctx) =>
      ctx.getByRole('status').filter({ hasText: 'Published successfully' }),
  },

  Validation: {
    // FRAGILE: data-automation-id is internal
    ValidationPanel: (ctx: Ctx) => ctx.locator('[data-automation-id="validation-panel"]'),
    ErrorItem: (ctx: Ctx) => ctx.locator('[role="listitem"][data-severity="error"]'),
    FixButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Fix' }),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
  },

  // ── Runtime / Play Mode ───────────────────────────────────────────────────
  // Methods targeting the published MDA running in the UCI shell.

  Runtime: {
    AppBar: {
      // FRAGILE: data-automation-id is internal. Use getByRole('banner') if stable.
      AppName: (ctx: Ctx) => ctx.locator('[data-automation-id="app-name"]'),
      SearchBox: (ctx: Ctx) => ctx.getByPlaceholder('Search'),
      SettingsButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Settings' }),
      HelpButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Help' }),
    },

    SiteMap: {
      // FRAGILE: data-automation-id is internal — used as CSS fallback in waitForRuntimeLoad
      NavigationPane: (ctx: Ctx) => ctx.locator('[data-automation-id="navigation-pane"]'),
      ExpandButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Expand navigation' }),
      CollapseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Collapse navigation' }),
      GroupHeader: (ctx: Ctx, name: string) => ctx.getByRole('button', { name }),
      // MDA sidebar items render differently across versions — use multi-selector via findLocator
      SubArea: (ctx: Ctx, name: string) =>
        ctx
          .locator(
            `[role="presentation"][title="${name}"], a[title="${name}"], a[aria-label="${name}"]`
          )
          .first(),
      RecentItems: (ctx: Ctx) => ctx.getByRole('button', { name: 'Recent' }),
      PinnedItems: (ctx: Ctx) => ctx.getByRole('button', { name: 'Pinned' }),
    },

    Content: {
      // FRAGILE: data-automation-id is internal
      MainContent: (ctx: Ctx) => ctx.locator('[data-automation-id="main-content"]'),
      // FRAGILE: data-automation-id is internal
      Form: (ctx: Ctx) => ctx.locator('[data-automation-id="form"]'),
      FormTabs: (ctx: Ctx) => ctx.getByRole('tablist'),
      FormTab: (ctx: Ctx, name: string) => ctx.getByRole('tab', { name }),
      FormField: (ctx: Ctx, name: string) => ctx.locator(`[data-field-name="${name}"]`),

      // ag-Grid — row-index and col-id are ag-Grid attributes with no ARIA equivalent.
      // getByRole('row') is used where possible; CSS attribute filters are required
      // for positional and column targeting.
      Grid: {
        Container: (ctx: Ctx) => ctx.locator('[role="grid"], [role="treegrid"]'),
        // ag-Grid data rows carry row-index; header rows do not — this correctly
        // excludes headers from counts and iteration.
        // CSS attribute selector is used (not ARIA filter) to match exactly one element
        // reliably, consistent with getCellValue's [role="row"][row-index="N"] approach.
        RowByIndex: (ctx: Ctx, index: number) => ctx.locator(`[role="row"][row-index="${index}"]`),
        // Checkbox inside a row — used for row selection
        CheckboxCell: (ctx: Ctx) => ctx.locator('[role="gridcell"] input[type="checkbox"]'),
        // Primary link in a row — used to open a record
        LinkCell: (ctx: Ctx) => ctx.locator('[role="gridcell"] a'),
        // Column header by display name — aria-label contains the name
        ColumnHeader: (ctx: Ctx, name: string) =>
          ctx.getByRole('columnheader', { name, exact: false }),
        // FRAGILE: data-id is internal Dynamics attribute
        EmptyMessage: (ctx: Ctx) => ctx.locator('[data-id="no-records"]'),
        LoadingIndicator: (ctx: Ctx) => ctx.locator('[data-id="grid-loading"]'),

        Pagination: {
          NextPage: (ctx: Ctx) => ctx.getByRole('button', { name: /Next page/i }),
          PreviousPage: (ctx: Ctx) => ctx.getByRole('button', { name: /Previous page/i }),
        },
      },
    },

    Commands: {
      NewButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'New' }),
      SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
      SaveAndCloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save & Close' }),
      DeleteButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete' }),
      RefreshButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Refresh' }),
      ExportButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Export to Excel' }),
      MoreCommandsButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'More commands' }),
    },
  },

  // ── Share Dialog ──────────────────────────────────────────────────────────

  ShareDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Share' }),
    SearchUsers: (ctx: Ctx) => ctx.getByPlaceholder('Enter a name or email address'),
    SecurityRoleDropdown: (ctx: Ctx) => ctx.getByRole('combobox', { name: 'Security role' }),
    ShareButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Share' }),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
  },

  // ── App Details Page ──────────────────────────────────────────────────────

  Details: {
    EditButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Edit' }),
    PlayButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Play' }),
    ShareButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Share' }),
    MoreButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'More actions' }),
    DeleteButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete' }),
  },

  // ── Delete Confirmation ───────────────────────────────────────────────────

  DeleteDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Confirm deletion' }),
    DeleteButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
  },

  // ── Common UI Elements ────────────────────────────────────────────────────

  Common: {
    LoadingSpinner: (ctx: Ctx) => ctx.getByRole('progressbar', { name: 'Loading' }),
    ErrorNotification: (ctx: Ctx) => ctx.getByRole('alert'),
    SuccessNotification: (ctx: Ctx) => ctx.getByRole('status'),
    BackButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Back' }),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
    SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
    OKButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'OK' }),
  },
};

/**
 * @deprecated Use Playwright built-in locators (`getByRole`, `getByLabel`) instead.
 * `data-automation-id` is an internal Power Apps Studio attribute, not a public contract.
 */
export const getModelDrivenDataAutomationId = (automationId: string): string =>
  `[data-automation-id="${automationId}"]`;

/** @deprecated Use `ctx.locator('[data-table-name="..."]')` directly if needed. */
export const getModelDrivenTablePage = (tableName: string): string =>
  `[data-table-name="${tableName}"]`;

/** @deprecated Use `ctx.getByLabel(fieldName)` or `ctx.locator('[data-field-name="..."]')`. */
export const getModelDrivenFormField = (fieldName: string): string =>
  `[data-field-name="${fieldName}"]`;

/** @deprecated Use `ctx.getByRole('link', { name })` or `ctx.getByLabel(name)`. */
export const getModelDrivenNavItem = (itemName: string): string => `a[aria-label="${itemName}"]`;
