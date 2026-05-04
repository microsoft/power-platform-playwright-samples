// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Canvas App Locators — factory-function style.
 *
 * Every entry is a function `(ctx, ...params?) => Locator`. Pass the Page,
 * FrameLocator, or Locator that provides the search scope as the first argument.
 *
 * Built-in Playwright locators (`getByRole`, `getByLabel`, etc.) are used wherever
 * a stable ARIA contract exists. Raw `ctx.locator(css)` is used only for internal
 * Canvas attributes (`data-control-name`, `data-automation-id`) where no ARIA
 * equivalent is available — these are marked with a comment.
 */

import { Page, Locator, FrameLocator } from '@playwright/test';

/** Any context that supports the Playwright `getBy*` + `locator()` API. */
type Ctx = Page | FrameLocator | Locator;

export const CanvasAppLocators = {
  // ── Home Page — App Creation ──────────────────────────────────────────────

  Home: {
    CreateButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Create' }),
    CreateMenu: (ctx: Ctx) => ctx.getByRole('menu', { name: 'Create menu' }),
    BlankAppOption: (ctx: Ctx) => ctx.getByTestId('create-blank-canvas-app'),
    TemplateOption: (ctx: Ctx) => ctx.getByTestId('create-from-template'),
    DataOption: (ctx: Ctx) => ctx.getByTestId('create-from-data'),
    AppsGrid: (ctx: Ctx) => ctx.getByRole('grid', { name: 'Apps' }),
    AppCard: (ctx: Ctx, appName: string) => ctx.getByRole('gridcell', { name: appName }),
    SearchBox: (ctx: Ctx) => ctx.getByPlaceholder('Search'),
    FilterButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Filter' }),
  },

  // ── Canvas Studio — Main Interface (runs inside an iframe) ────────────────
  // 🎨 Studio authoring only. All sub-entries require the Studio FrameLocator
  // as context, obtained via Studio.StudioFrame(page).

  Studio: {
    /** Returns the FrameLocator for the Canvas Studio iframe. Accepts Page only. */
    StudioFrame: (page: Page) => page.frameLocator('iframe[name="canvas-app-studio"]'),

    // Top Command Bar
    CommandBar: {
      AppName: (ctx: Ctx) => ctx.getByLabel('App name'),
      SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
      SaveAsButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save as' }),
      PublishButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Publish' }),
      PlayButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Play' }),
      SettingsButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Settings' }),
      UndoButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Undo' }),
      RedoButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Redo' }),
      ShareButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Share' }),
    },

    // Left Navigation
    LeftNav: {
      TreeViewTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Tree view' }),
      InsertTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Insert' }),
      DataTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Data' }),
      MediaTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Media' }),
      AdvancedTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Advanced tools' }),
      SearchButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Search' }),
    },

    // Insert Panel — data-control-type is an internal Studio attribute (no ARIA equivalent)
    Insert: {
      SearchControl: (ctx: Ctx) => ctx.getByPlaceholder('Search controls'),
      LayoutSection: (ctx: Ctx) => ctx.getByRole('button', { name: 'Layout' }),
      InputSection: (ctx: Ctx) => ctx.getByRole('button', { name: 'Input' }),
      DisplaySection: (ctx: Ctx) => ctx.getByRole('button', { name: 'Display' }),
      IconsSection: (ctx: Ctx) => ctx.getByRole('button', { name: 'Icons' }),
      MediaSection: (ctx: Ctx) => ctx.getByRole('button', { name: 'Media' }),
      ChartsSection: (ctx: Ctx) => ctx.getByRole('button', { name: 'Charts' }),
      AISection: (ctx: Ctx) => ctx.getByRole('button', { name: 'AI' }),
      // data-control-type is internal Studio — no ARIA equivalent
      ButtonControl: (ctx: Ctx) => ctx.locator('div[data-control-type="Button"]'),
      TextLabelControl: (ctx: Ctx) => ctx.locator('div[data-control-type="Label"]'),
      TextInputControl: (ctx: Ctx) => ctx.locator('div[data-control-type="TextInput"]'),
      DropdownControl: (ctx: Ctx) => ctx.locator('div[data-control-type="Dropdown"]'),
      GalleryControl: (ctx: Ctx) => ctx.locator('div[data-control-type="Gallery"]'),
      FormControl: (ctx: Ctx) => ctx.locator('div[data-control-type="Form"]'),
      DataTableControl: (ctx: Ctx) => ctx.locator('div[data-control-type="DataTable"]'),
    },

    // Data Panel
    Data: {
      AddDataButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Add data' }),
      SearchDataSource: (ctx: Ctx) => ctx.getByPlaceholder('Search data sources'),
      DataSourcesList: (ctx: Ctx) => ctx.getByRole('list', { name: 'Data sources' }),
      DataSourceItem: (ctx: Ctx, name: string) => ctx.getByRole('listitem', { name }),
      ConnectButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Connect' }),
      RefreshButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Refresh' }),
    },

    // Canvas area — data-automation-id and data-control-name are internal Studio attributes
    Canvas: {
      CanvasArea: (ctx: Ctx) => ctx.locator('[data-automation-id="canvas-area"]'),
      Screen: (ctx: Ctx, name: string) => ctx.locator(`[data-control-name="${name}"]`),
      Control: (ctx: Ctx, name: string) => ctx.locator(`[data-control-name="${name}"]`),
      SelectedControl: (ctx: Ctx) => ctx.locator('[data-is-selected="true"]'),
    },

    // Properties Panel
    Properties: {
      PropertiesPanel: (ctx: Ctx) => ctx.locator('[data-automation-id="properties-panel"]'),
      PropertySearch: (ctx: Ctx) => ctx.getByPlaceholder('Search properties'),
      PropertyItem: (ctx: Ctx, name: string) => ctx.locator(`[data-property-name="${name}"]`),
      Text: (ctx: Ctx) => ctx.getByLabel('Text'),
      Color: (ctx: Ctx) => ctx.getByLabel('Color'),
      Fill: (ctx: Ctx) => ctx.getByLabel('Fill'),
      X: (ctx: Ctx) => ctx.getByLabel('X'),
      Y: (ctx: Ctx) => ctx.getByLabel('Y'),
      Width: (ctx: Ctx) => ctx.getByLabel('Width'),
      Height: (ctx: Ctx) => ctx.getByLabel('Height'),
    },

    // Formula Bar
    FormulaBar: {
      FormulaInput: (ctx: Ctx) => ctx.getByLabel('Formula bar'),
      PropertyDropdown: (ctx: Ctx) => ctx.locator('[aria-label="Property selector"]'),
      ErrorIndicator: (ctx: Ctx) => ctx.getByLabel('Formula error'),
      IntelliSenseList: (ctx: Ctx) => ctx.getByRole('listbox', { name: 'IntelliSense' }),
    },

    // Screens Panel
    Screens: {
      ScreensList: (ctx: Ctx) => ctx.getByRole('tree', { name: 'Screens' }),
      AddScreenButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'New screen' }),
      ScreenItem: (ctx: Ctx, name: string) => ctx.getByRole('treeitem', { name }),
      ScreenMenu: (ctx: Ctx) => ctx.getByRole('button', { name: 'Screen options' }),
      DuplicateScreen: (ctx: Ctx) => ctx.getByRole('button', { name: 'Duplicate screen' }),
      DeleteScreen: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete screen' }),
    },
  },

  // ── App Settings Dialog ───────────────────────────────────────────────────

  Settings: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Settings' }),
    GeneralTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'General' }),
    DisplayTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Display' }),
    UpdatesTab: (ctx: Ctx) => ctx.getByRole('button', { name: 'Updates' }),
    AppNameInput: (ctx: Ctx) => ctx.getByLabel('App name'),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
    SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
  },

  // ── Save Dialog ───────────────────────────────────────────────────────────

  SaveDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Save' }),
    AppNameInput: (ctx: Ctx) => ctx.getByLabel('Name'),
    SaveButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Save' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
    SuccessMessage: (ctx: Ctx) => ctx.getByRole('status').filter({ hasText: 'Saved' }),
  },

  // ── Publish Dialog ────────────────────────────────────────────────────────

  PublishDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Publish' }),
    PublishButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Publish this version' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
    VersionComments: (ctx: Ctx) => ctx.getByLabel('Comments'),
    SuccessMessage: (ctx: Ctx) => ctx.getByRole('status').filter({ hasText: 'Published' }),
  },

  // ── Share Dialog ──────────────────────────────────────────────────────────

  ShareDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Share' }),
    SearchUsers: (ctx: Ctx) => ctx.getByPlaceholder('Enter a name, email address, or Everyone'),
    UsersList: (ctx: Ctx) => ctx.getByRole('list', { name: 'People with access' }),
    PermissionDropdown: (ctx: Ctx) => ctx.getByRole('combobox', { name: 'Permission' }),
    ShareButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Share' }),
    CopyLinkButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Copy link' }),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
  },

  // ── Play Mode (Studio Preview) ────────────────────────────────────────────

  PlayMode: {
    StopButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close preview' }),
    RestartButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Restart' }),
    ErrorMessage: (ctx: Ctx) => ctx.getByRole('alert', { name: 'Error' }),
  },

  // ── Runtime / Play-mode ───────────────────────────────────────────────────
  // Used when interacting with a *published* Canvas app in Play mode.
  // Resolve inside the Canvas player iframe:
  //   const frame = CanvasAppLocators.Runtime.CanvasFrame(page);
  //   CanvasAppLocators.Runtime.GalleryItem(frame)

  Runtime: {
    /**
     * FrameLocator for the Canvas player iframe.
     * ⚠️ VERIFY: confirm the iframe src in your environment:
     *   page.locator('iframe').evaluateAll(els => els.map(e => e.src))
     * Standalone Canvas apps use a different URL pattern than apps embedded in MDA.
     */
    CanvasFrame: (page: Page) => page.frameLocator('iframe[src*="apps.powerapps.com"]'),

    /**
     * Gallery list items. VERIFIED: role="listitem" + data-control-part="gallery-item"
     * is used and passing in existing tests (custom-page-crud.test.ts).
     */
    GalleryItem: (ctx: Ctx) =>
      ctx.getByRole('listitem').filter({ has: ctx.locator('[data-control-part="gallery-item"]') }),

    /**
     * Gallery root container by control name.
     * data-control-name is internal Canvas runtime — changes when maker renames the control.
     * Centralise here so renames require only one update.
     * ⚠️ VERIFY: inspect with frame.locator('[data-control-name]').evaluateAll(...)
     */
    GalleryRoot: (ctx: Ctx, controlName: string) =>
      ctx.locator(`[data-control-name="${controlName}"]`),

    /**
     * Clickable button inside a gallery item.
     * Prefer GalleryItemButton (ARIA role child) over GalleryRoot for interactions.
     * ⚠️ VERIFY: control name must match Power Apps Studio assignment.
     */
    GalleryItemButton: (ctx: Ctx, controlName: string) =>
      ctx.locator(`[data-control-name="${controlName}"]`).getByRole('button'),

    /**
     * Button by AccessibilityLabel (set via the AccessibilityLabel property in Canvas Studio).
     * Most stable runtime selector when the app maker has set AccessibilityLabel.
     * ⚠️ VERIFY: confirm aria-label value in the live DOM.
     */
    ButtonByLabel: (ctx: Ctx, label: string) => ctx.getByLabel(label).getByRole('button'),

    /**
     * Button by title attribute (set via Tooltip property in Canvas Studio).
     * ⚠️ VERIFY: confirm title value in the live DOM.
     */
    ButtonByTitle: (ctx: Ctx, title: string) => ctx.getByTitle(title),

    /**
     * Button by control name — fallback when AccessibilityLabel is not set.
     * ⚠️ VERIFY: control name must match Power Apps Studio assignment.
     */
    ButtonByControlName: (ctx: Ctx, controlName: string) =>
      ctx.locator(`[data-control-name="${controlName}"]`).getByRole('button'),

    /**
     * Text input by AccessibilityLabel.
     * ⚠️ VERIFY: confirm the aria-label value matches what Canvas renders at runtime.
     */
    InputByLabel: (ctx: Ctx, label: string) => ctx.getByLabel(label),
  },

  // ── App Details Page ──────────────────────────────────────────────────────

  Details: {
    EditButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Edit' }),
    PlayButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Play' }),
    ShareButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Share' }),
    MoreButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'More actions' }),
    DeleteButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete' }),
  },

  // ── Delete Confirmation Dialog ────────────────────────────────────────────

  DeleteDialog: {
    Dialog: (ctx: Ctx) => ctx.getByRole('dialog', { name: 'Delete app' }),
    DeleteButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Delete' }),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
  },

  // ── Common UI Elements ────────────────────────────────────────────────────

  Common: {
    LoadingSpinner: (ctx: Ctx) => ctx.getByRole('progressbar', { name: 'Loading' }),
    ErrorBanner: (ctx: Ctx) => ctx.getByRole('alert'),
    SuccessBanner: (ctx: Ctx) => ctx.getByRole('status'),
    CancelButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Cancel' }),
    OKButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'OK' }),
    CloseButton: (ctx: Ctx) => ctx.getByRole('button', { name: 'Close' }),
  },
};

/**
 * @deprecated Use `CanvasAppLocators.Runtime.GalleryRoot(ctx, controlName)` or
 * `CanvasAppLocators.Runtime.ButtonByLabel(ctx, label)` instead.
 * `data-control-name` is an internal Canvas runtime attribute that changes whenever
 * the app maker renames a control.
 */
export const getCanvasControlByName = (controlName: string): string =>
  `[data-control-name="${controlName}"]`;

/**
 * @deprecated `data-screen-name` is an internal Canvas runtime attribute.
 * Use a unique control on the target screen as the readiness signal instead.
 */
export const getCanvasScreenByName = (screenName: string): string =>
  `[data-screen-name="${screenName}"]`;

/**
 * Returns a `[data-testid]` selector string.
 * Prefer `page.getByTestId(id)` at the call site instead.
 */
export const getCanvasDataTestId = (testId: string): string => `[data-testid="${testId}"]`;
