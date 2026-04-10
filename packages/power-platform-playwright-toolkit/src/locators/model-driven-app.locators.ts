// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Model Driven App Locators
 * Centralized selectors for Model Driven App creation, editing, and testing
 * Based on Microsoft Power Apps Model Driven App documentation
 */

export const ModelDrivenAppLocators = {
  // Home Page - App Creation
  Home: {
    CreateButton: 'button[name="Create"]',
    CreateMenu: '[role="menu"][aria-label="Create menu"]',
    BlankAppOption: '[data-testid="create-blank-model-app"]',
    FromSolutionOption: '[data-testid="create-from-solution"]',
    AppsGrid: '[role="grid"][aria-label="Apps"]',
    AppCard: (appName: string) => `[role="gridcell"]:has-text("${appName}")`,
    AppTypeFilter: 'select[aria-label="App type"]',
    ModelDrivenOption: 'option[value="ModelDriven"]',
    SearchBox: 'input[placeholder="Search"]',
  },

  // Modern App Designer (Main Interface)
  Designer: {
    // Command Bar
    CommandBar: {
      AppNameInput: 'input[aria-label="App name"]',
      SaveButton: 'button[aria-label="Save"]',
      PublishButton: 'button[aria-label="Publish"]',
      PlayButton: 'button[aria-label="Play"]',
      SettingsButton: 'button[aria-label="Settings"]',
      ShareButton: 'button[aria-label="Share"]',
      ValidateButton: 'button[aria-label="Validate"]',
      SwitchToClassicButton: 'button[aria-label="Switch to classic"]',
    },

    // Left Navigation Panel
    LeftNav: {
      NavigationTab: 'button[aria-label="Navigation"]',
      PagesTab: 'button[aria-label="Pages"]',
      DataTab: 'button[aria-label="Data"]',
      AutomationTab: 'button[aria-label="Automation"]',
    },

    // Pages Panel
    Pages: {
      PagesList: '[role="tree"][aria-label="Pages"]',
      AddPageButton: 'button[aria-label="Add page"]',
      NewPageMenu: '[role="menu"][aria-label="New page"]',

      // Page Types
      TableBasedPage: 'button[aria-label="Table based view and form"]',
      DashboardPage: 'button[aria-label="Dashboard"]',
      CustomPage: 'button[aria-label="Custom page"]',

      // Page Items
      PageItem: (pageName: string) => `[role="treeitem"]:has-text("${pageName}")`,
      PageMenu: 'button[aria-label="Page options"]',
      EditPage: 'button[aria-label="Edit"]',
      DeletePage: 'button[aria-label="Delete"]',
      MovePage: 'button[aria-label="Move"]',
    },

    // Navigation Designer
    Navigation: {
      NavigationTree: '[role="tree"][aria-label="Navigation"]',
      AddGroupButton: 'button[aria-label="Add group"]',
      AddSubAreaButton: 'button[aria-label="Add subarea"]',

      // Navigation Items
      GroupItem: (groupName: string) => `[role="treeitem"][aria-label="${groupName}"]`,
      SubAreaItem: (subAreaName: string) => `[role="treeitem"]:has-text("${subAreaName}")`,

      // Properties
      TitleInput: 'input[aria-label="Title"]',
      IconPicker: 'button[aria-label="Choose icon"]',
      TablePicker: 'button[aria-label="Choose table"]',
      UrlInput: 'input[aria-label="URL"]',
    },

    // Data Panel
    Data: {
      AddTableButton: 'button[aria-label="Add table"]',
      SearchTable: 'input[placeholder="Search tables"]',
      TablesList: '[role="list"][aria-label="Tables"]',
      TableItem: (tableName: string) => `[role="listitem"]:has-text("${tableName}")`,
      FormsSection: 'button[aria-label="Forms"]',
      ViewsSection: 'button[aria-label="Views"]',
      ChartsSection: 'button[aria-label="Charts"]',
      DashboardsSection: 'button[aria-label="Dashboards"]',
    },

    // Properties Panel (Right Side)
    Properties: {
      PropertiesPanel: '[data-automation-id="properties-panel"]',
      DisplayNameInput: 'input[aria-label="Display name"]',
      DescriptionInput: 'textarea[aria-label="Description"]',
      IconPicker: 'button[aria-label="Icon"]',
      WelcomePageToggle: 'input[type="checkbox"][aria-label="Enable welcome page"]',
      MobileToggle: 'input[type="checkbox"][aria-label="Enable for mobile"]',
    },

    // Canvas/Preview Area
    Canvas: {
      PreviewArea: '[data-automation-id="preview-area"]',
      AppModule: '[data-automation-id="app-module"]',
      SiteMap: '[data-automation-id="sitemap"]',
    },
  },

  // Create Table Dialog
  CreateTableDialog: {
    Dialog: '[role="dialog"][aria-label="Create table"]',
    DisplayNameInput: 'input[aria-label="Display name"]',
    PluralNameInput: 'input[aria-label="Plural name"]',
    DescriptionInput: 'textarea[aria-label="Description"]',
    EnableAttachmentsToggle: 'input[type="checkbox"][aria-label="Enable attachments"]',
    CreateButton: 'button[aria-label="Create"]',
    CancelButton: 'button[aria-label="Cancel"]',
  },

  // Add Page Dialog
  AddPageDialog: {
    Dialog: '[role="dialog"][aria-label="Add page"]',
    PageTypeList: '[role="list"][aria-label="Page types"]',

    // For Table-based pages
    SelectTableDropdown: 'select[aria-label="Select table"]',
    TableOption: (tableName: string) => `option:has-text("${tableName}")`,

    // Forms
    FormsList: '[role="list"][aria-label="Forms"]',
    FormItem: (formName: string) => `[role="listitem"]:has-text("${formName}")`,
    MainForm: 'input[type="checkbox"][aria-label="Main form"]',
    QuickCreateForm: 'input[type="checkbox"][aria-label="Quick create form"]',
    QuickViewForm: 'input[type="checkbox"][aria-label="Quick view form"]',

    // Views
    ViewsList: '[role="list"][aria-label="Views"]',
    ViewItem: (viewName: string) => `[role="listitem"]:has-text("${viewName}")`,

    AddButton: 'button[aria-label="Add"]',
    CancelButton: 'button[aria-label="Cancel"]',
  },

  // Settings Dialog
  Settings: {
    Dialog: '[role="dialog"][aria-label="Settings"]',

    // Tabs
    GeneralTab: 'button[aria-label="General"]',
    FeaturesTab: 'button[aria-label="Features"]',
    UpcomingTab: 'button[aria-label="Upcoming"]',

    // General Settings
    AppNameInput: 'input[aria-label="Name"]',
    DescriptionInput: 'textarea[aria-label="Description"]',
    AppIconUpload: 'input[type="file"][aria-label="Upload icon"]',
    WelcomePageUrl: 'input[aria-label="Welcome page URL"]',

    // Features
    EnableMobileToggle: 'input[type="checkbox"][aria-label="Enable for mobile"]',
    EnableOfflineToggle: 'input[type="checkbox"][aria-label="Enable offline mode"]',
    ReadOnlyToggle: 'input[type="checkbox"][aria-label="Read-only mode"]',

    SaveButton: 'button[aria-label="Save"]',
    CloseButton: 'button[aria-label="Close"]',
  },

  // Publish Dialog
  PublishDialog: {
    Dialog: '[role="dialog"][aria-label="Publish"]',
    PublishButton: 'button[aria-label="Publish"]',
    CancelButton: 'button[aria-label="Cancel"]',
    ProgressIndicator: '[role="progressbar"]',
    SuccessMessage: '[role="status"]:has-text("Published successfully")',
  },

  // Validation Panel
  Validation: {
    ValidationPanel: '[data-automation-id="validation-panel"]',
    ErrorsList: '[role="list"][aria-label="Errors"]',
    WarningsList: '[role="list"][aria-label="Warnings"]',
    ErrorItem: '[role="listitem"][data-severity="error"]',
    WarningItem: '[role="listitem"][data-severity="warning"]',
    FixButton: 'button[aria-label="Fix"]',
    IgnoreButton: 'button[aria-label="Ignore"]',
    CloseButton: 'button[aria-label="Close"]',
  },

  // Play Mode - App Runtime
  Runtime: {
    // Top Navigation Bar
    AppBar: {
      AppName: '[data-automation-id="app-name"]',
      SearchBox: 'input[placeholder="Search"]',
      SettingsButton: 'button[aria-label="Settings"]',
      HelpButton: 'button[aria-label="Help"]',
      UserMenu: 'button[aria-label="User menu"]',
    },

    // Site Map (Left Navigation)
    SiteMap: {
      NavigationPane: '[data-automation-id="navigation-pane"]',
      ExpandButton: 'button[aria-label="Expand navigation"]',
      CollapseButton: 'button[aria-label="Collapse navigation"]',
      GroupHeader: (groupName: string) => `button[aria-label="${groupName}"]`,
      SubArea: (subAreaName: string) => `a[aria-label="${subAreaName}"]`,
      RecentItems: 'button[aria-label="Recent"]',
      PinnedItems: 'button[aria-label="Pinned"]',
    },

    // Main Content Area
    Content: {
      MainContent: '[data-automation-id="main-content"]',
      PageTitle: '[data-automation-id="page-title"]',
      CommandBar: '[data-automation-id="command-bar"]',

      // Grid View - Enhanced with comprehensive locators
      Grid: {
        // Container (supports both grid and treegrid roles)
        Container: '[role="grid"], [role="treegrid"]',
        Header: '[role="row"]:first-child',
        Body: '[role="rowgroup"]',

        // Rows
        Row: '[role="row"]',
        RowByIndex: (index: number) => `[role="row"][row-index="${index}"]`,

        // Cells
        Cell: '[role="gridcell"]',
        CellByRowAndColumn: (row: number, col: number) =>
          `[role="row"][row-index="${row}"] [role="gridcell"]:nth-child(${col + 1})`,
        LinkCell: '[role="gridcell"] a',
        CheckboxCell: '[role="gridcell"] input[type="checkbox"]',

        // Headers
        ColumnHeader: (name: string) => `[role="columnheader"][aria-label*="${name}"]`,

        // States
        EmptyMessage: '[data-id="no-records"]',
        LoadingIndicator: '[data-id="grid-loading"]',

        // Pagination
        Pagination: {
          Container: '[data-id="pagination"]',
          NextPage: 'button[aria-label*="Next page"]',
          PreviousPage: 'button[aria-label*="Previous page"]',
          PageInput: 'input[aria-label*="Page number"]',
          RecordCount: '[data-id="record-count"]',
        },

        // View Selector
        ViewSelector: {
          Dropdown: '[data-id="viewSelector"]',
          Option: (viewName: string) => `[role="option"]:has-text("${viewName}")`,
        },
      },

      // Form View
      Form: '[data-automation-id="form"]',
      FormHeader: '[data-automation-id="form-header"]',
      FormTabs: '[role="tablist"]',
      FormTab: (tabName: string) => `[role="tab"][aria-label="${tabName}"]`,
      FormSection: (sectionName: string) => `[data-section-name="${sectionName}"]`,
      FormField: (fieldName: string) => `[data-field-name="${fieldName}"]`,

      // Dashboard View
      Dashboard: '[data-automation-id="dashboard"]',
      DashboardChart: '[data-automation-id="chart"]',
      DashboardGrid: '[data-automation-id="dashboard-grid"]',
    },

    // Command Bar Buttons (Common)
    Commands: {
      NewButton: 'button[aria-label="New"]',
      SaveButton: 'button[aria-label="Save"]',
      SaveAndCloseButton: 'button[aria-label="Save & Close"]',
      DeleteButton: 'button[aria-label="Delete"]',
      RefreshButton: 'button[aria-label="Refresh"]',
      ExportButton: 'button[aria-label="Export to Excel"]',
      EmailButton: 'button[aria-label="Email a Link"]',
      FlowButton: 'button[aria-label="Flow"]',
      MoreCommandsButton: 'button[aria-label="More commands"]',
    },
  },

  // Share Dialog
  ShareDialog: {
    Dialog: '[role="dialog"][aria-label="Share"]',
    SearchUsers: 'input[placeholder="Enter a name or email address"]',
    UsersList: '[role="list"][aria-label="Users"]',
    SecurityRoleDropdown: 'select[aria-label="Security role"]',
    ReadPrivilege: 'option[value="Read"]',
    WritePrivilege: 'option[value="Write"]',
    ShareButton: 'button[aria-label="Share"]',
    ManageRolesButton: 'button[aria-label="Manage security roles"]',
    CloseButton: 'button[aria-label="Close"]',
  },

  // App Details Page
  Details: {
    DetailsPage: '[data-automation-id="app-details-page"]',
    EditButton: 'button[aria-label="Edit"]',
    PlayButton: 'button[aria-label="Play"]',
    ShareButton: 'button[aria-label="Share"]',

    // Tabs
    OverviewTab: 'button[aria-label="Overview"]',
    ComponentsTab: 'button[aria-label="Components"]',
    SettingsTab: 'button[aria-label="Settings"]',

    // Overview
    AppName: '[data-automation-id="app-name"]',
    AppDescription: '[data-automation-id="app-description"]',
    AppOwner: '[data-automation-id="app-owner"]',
    AppCreated: '[data-automation-id="created-date"]',
    AppModified: '[data-automation-id="modified-date"]',

    // Components
    ComponentsList: '[role="list"][aria-label="Components"]',
    TablesCount: '[data-automation-id="tables-count"]',
    FormsCount: '[data-automation-id="forms-count"]',
    ViewsCount: '[data-automation-id="views-count"]',
    ChartsCount: '[data-automation-id="charts-count"]',

    // More Actions
    MoreButton: 'button[aria-label="More actions"]',
    DeleteButton: 'button[aria-label="Delete"]',
    ExportButton: 'button[aria-label="Export"]',
    ImportButton: 'button[aria-label="Import"]',
    CopyButton: 'button[aria-label="Create a copy"]',
    AddToSolutionButton: 'button[aria-label="Add to solution"]',
  },

  // Solutions Integration
  Solutions: {
    SolutionExplorer: '[data-automation-id="solution-explorer"]',
    AddExistingButton: 'button[aria-label="Add existing"]',
    AddNewButton: 'button[aria-label="Add new"]',
    SolutionPicker: 'select[aria-label="Select solution"]',
    SolutionOption: (solutionName: string) => `option:has-text("${solutionName}")`,
    AddButton: 'button[aria-label="Add"]',
  },

  // Delete Confirmation
  DeleteDialog: {
    Dialog: '[role="dialog"][aria-label="Confirm deletion"]',
    ConfirmMessage: 'text="Are you sure you want to delete"',
    ConfirmCheckbox: 'input[type="checkbox"][aria-label="I understand"]',
    DeleteButton: 'button[aria-label="Delete"]',
    CancelButton: 'button[aria-label="Cancel"]',
  },

  // Common UI Elements
  Common: {
    LoadingSpinner: '[role="progressbar"][aria-label="Loading"]',
    ErrorNotification: '[role="alert"][aria-live="assertive"]',
    SuccessNotification: '[role="status"][aria-live="polite"]',
    ToastMessage: '[data-automation-id="toast-notification"]',
    ConfirmDialog: '[role="dialog"][aria-label="Confirm"]',
    BackButton: 'button[aria-label="Back"]',
    CloseButton: 'button[aria-label="Close"]',
    SaveButton: 'button[aria-label="Save"]',
    CancelButton: 'button[aria-label="Cancel"]',
    OKButton: 'button[aria-label="OK"]',
  },
};

/**
 * Helper function to get data automation id selector
 */
export const getModelDrivenDataAutomationId = (automationId: string): string => {
  return `[data-automation-id="${automationId}"]`;
};

/**
 * Helper function to get table page selector
 */
export const getModelDrivenTablePage = (tableName: string): string => {
  return `[data-table-name="${tableName}"]`;
};

/**
 * Helper function to get form field selector
 */
export const getModelDrivenFormField = (fieldName: string): string => {
  return `[data-field-name="${fieldName}"]`;
};

/**
 * Helper function to get navigation item selector
 */
export const getModelDrivenNavItem = (itemName: string): string => {
  return `a[aria-label="${itemName}"]`;
};
