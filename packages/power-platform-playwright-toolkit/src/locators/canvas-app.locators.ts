/**
 * Canvas App Locators
 * Centralized selectors for Canvas App creation, editing, and testing
 * Based on Microsoft Power Apps Canvas App documentation
 */

export const CanvasAppLocators = {
  // Home Page - App Creation
  Home: {
    CreateButton: 'button[name="Create"]',
    CreateMenu: '[role="menu"][aria-label="Create menu"]',
    BlankAppOption: '[data-testid="create-blank-canvas-app"]',
    TemplateAppOption: '[data-testid="create-from-template"]',
    DataAppOption: '[data-testid="create-from-data"]',
    AppsGrid: '[role="grid"][aria-label="Apps"]',
    AppCard: (appName: string) => `[role="gridcell"]:has-text("${appName}")`,
    SearchBox: 'input[placeholder="Search"]',
    FilterButton: 'button[aria-label="Filter"]',
  },

  // Canvas Studio - Main Interface (runs in iframe)
  Studio: {
    // Studio frame selector
    StudioFrame: 'iframe[name="canvas-app-studio"]',

    // Top Command Bar
    CommandBar: {
      AppName: 'input[aria-label="App name"]',
      SaveButton: 'button[aria-label="Save"]',
      SaveAsButton: 'button[aria-label="Save as"]',
      PublishButton: 'button[aria-label="Publish"]',
      PlayButton: 'button[aria-label="Play"]',
      SettingsButton: 'button[aria-label="Settings"]',
      UndoButton: 'button[aria-label="Undo"]',
      RedoButton: 'button[aria-label="Redo"]',
      ShareButton: 'button[aria-label="Share"]',
    },

    // Left Navigation Panel
    LeftNav: {
      TreeViewTab: 'button[aria-label="Tree view"]',
      InsertTab: 'button[aria-label="Insert"]',
      DataTab: 'button[aria-label="Data"]',
      MediaTab: 'button[aria-label="Media"]',
      AdvancedTab: 'button[aria-label="Advanced tools"]',
      SearchButton: 'button[aria-label="Search"]',
    },

    // Insert Panel - Controls
    Insert: {
      SearchControl: 'input[placeholder="Search controls"]',
      LayoutSection: 'button[aria-label="Layout"]',
      InputSection: 'button[aria-label="Input"]',
      DisplaySection: 'button[aria-label="Display"]',
      IconsSection: 'button[aria-label="Icons"]',
      MediaSection: 'button[aria-label="Media"]',
      ChartsSection: 'button[aria-label="Charts"]',
      AISection: 'button[aria-label="AI"]',

      // Common Controls
      ButtonControl: 'div[data-control-type="Button"]',
      TextLabelControl: 'div[data-control-type="Label"]',
      TextInputControl: 'div[data-control-type="TextInput"]',
      DropdownControl: 'div[data-control-type="Dropdown"]',
      ComboboxControl: 'div[data-control-type="ComboBox"]',
      DatePickerControl: 'div[data-control-type="DatePicker"]',
      GalleryControl: 'div[data-control-type="Gallery"]',
      FormControl: 'div[data-control-type="Form"]',
      DataTableControl: 'div[data-control-type="DataTable"]',
      IconControl: 'div[data-control-type="Icon"]',
      ImageControl: 'div[data-control-type="Image"]',
      ShapeControl: 'div[data-control-type="Shape"]',
      ChartControl: 'div[data-control-type="Chart"]',
    },

    // Data Panel
    Data: {
      AddDataButton: 'button[aria-label="Add data"]',
      SearchDataSource: 'input[placeholder="Search data sources"]',
      DataSourcesList: '[role="list"][aria-label="Data sources"]',
      DataSourceItem: (sourceName: string) => `[role="listitem"]:has-text("${sourceName}")`,
      ConnectButton: 'button[aria-label="Connect"]',
      RefreshButton: 'button[aria-label="Refresh"]',
    },

    // Canvas - Drawing Surface
    Canvas: {
      CanvasArea: '[data-automation-id="canvas-area"]',
      Screen: (screenName: string) => `[data-control-name="${screenName}"]`,
      Control: (controlName: string) => `[data-control-name="${controlName}"]`,
      SelectedControl: '[data-is-selected="true"]',
    },

    // Right Properties Panel
    Properties: {
      PropertiesPanel: '[data-automation-id="properties-panel"]',
      PropertySearch: 'input[placeholder="Search properties"]',
      PropertyItem: (propertyName: string) => `[data-property-name="${propertyName}"]`,

      // Common Properties
      Text: 'input[aria-label="Text"]',
      Color: 'input[aria-label="Color"]',
      Fill: 'input[aria-label="Fill"]',
      X: 'input[aria-label="X"]',
      Y: 'input[aria-label="Y"]',
      Width: 'input[aria-label="Width"]',
      Height: 'input[aria-label="Height"]',
      Visible: 'input[aria-label="Visible"]',
      OnSelect: 'input[aria-label="OnSelect"]',
    },

    // Formula Bar
    FormulaBar: {
      FormulaInput: 'textarea[aria-label="Formula bar"]',
      PropertyDropdown: '[aria-label="Property selector"]',
      ErrorIndicator: '[aria-label="Formula error"]',
      IntelliSenseList: '[role="listbox"][aria-label="IntelliSense"]',
    },

    // Screens Panel
    Screens: {
      ScreensList: '[role="tree"][aria-label="Screens"]',
      AddScreenButton: 'button[aria-label="New screen"]',
      ScreenItem: (screenName: string) => `[role="treeitem"]:has-text("${screenName}")`,
      ScreenMenu: 'button[aria-label="Screen options"]',
      DuplicateScreen: 'button[aria-label="Duplicate screen"]',
      DeleteScreen: 'button[aria-label="Delete screen"]',
    },
  },

  // App Settings Dialog
  Settings: {
    SettingsDialog: '[role="dialog"][aria-label="Settings"]',
    GeneralTab: 'button[aria-label="General"]',
    DisplayTab: 'button[aria-label="Display"]',
    UpdatesTab: 'button[aria-label="Updates"]',
    SupportTab: 'button[aria-label="Support"]',

    // General Settings
    AppNameInput: 'input[aria-label="App name"]',
    AppDescriptionInput: 'textarea[aria-label="Description"]',
    AppIconUpload: 'input[type="file"][aria-label="Upload icon"]',

    // Display Settings
    OrientationDropdown: 'select[aria-label="Orientation"]',
    ScreenSizeDropdown: 'select[aria-label="Screen size"]',
    ScaleFitRadio: 'input[type="radio"][aria-label="Scale to fit"]',
    LockAspectRatio: 'input[type="checkbox"][aria-label="Lock aspect ratio"]',

    CloseButton: 'button[aria-label="Close"]',
    SaveButton: 'button[aria-label="Save"]',
  },

  // Save Dialog
  SaveDialog: {
    Dialog: '[role="dialog"][aria-label="Save"]',
    AppNameInput: 'input[aria-label="Name"]',
    SaveButton: 'button[aria-label="Save"]',
    CancelButton: 'button[aria-label="Cancel"]',
    SaveProgressIndicator: '[role="progressbar"]',
    SuccessMessage: '[role="status"]:has-text("Saved")',
  },

  // Publish Dialog
  PublishDialog: {
    Dialog: '[role="dialog"][aria-label="Publish"]',
    PublishButton: 'button[aria-label="Publish this version"]',
    CancelButton: 'button[aria-label="Cancel"]',
    VersionComments: 'textarea[aria-label="Comments"]',
    PublishProgressIndicator: '[role="progressbar"]',
    SuccessMessage: '[role="status"]:has-text("Published")',
  },

  // Share Dialog
  ShareDialog: {
    Dialog: '[role="dialog"][aria-label="Share"]',
    SearchUsers: 'input[placeholder="Enter a name, email address, or Everyone"]',
    UsersList: '[role="list"][aria-label="People with access"]',
    PermissionDropdown: 'select[aria-label="Permission"]',
    CanEditOption: 'option[value="CanEdit"]',
    CanViewOption: 'option[value="CanView"]',
    ShareButton: 'button[aria-label="Share"]',
    CopyLinkButton: 'button[aria-label="Copy link"]',
    CloseButton: 'button[aria-label="Close"]',
  },

  // Play Mode (App Preview)
  PlayMode: {
    PlayWindow: '[data-automation-id="play-window"]',
    StopButton: 'button[aria-label="Close preview"]',
    RestartButton: 'button[aria-label="Restart"]',
    ErrorMessage: '[role="alert"][aria-label="Error"]',
  },

  // App Details Page
  Details: {
    AppDetailsPage: '[data-automation-id="app-details-page"]',
    EditButton: 'button[aria-label="Edit"]',
    PlayButton: 'button[aria-label="Play"]',
    ShareButton: 'button[aria-label="Share"]',
    DetailsTab: 'button[aria-label="Details"]',
    VersionsTab: 'button[aria-label="Versions"]',
    AnalyticsTab: 'button[aria-label="Analytics"]',

    // Details Tab
    AppName: '[data-automation-id="app-name"]',
    AppOwner: '[data-automation-id="app-owner"]',
    AppCreated: '[data-automation-id="app-created"]',
    AppModified: '[data-automation-id="app-modified"]',

    // Versions Tab
    VersionsList: '[role="list"][aria-label="Versions"]',
    VersionItem: (version: string) => `[role="listitem"]:has-text("Version ${version}")`,
    RestoreButton: 'button[aria-label="Restore"]',

    // More Actions
    MoreButton: 'button[aria-label="More actions"]',
    DeleteButton: 'button[aria-label="Delete"]',
    ExportButton: 'button[aria-label="Export package"]',
    AddToSolutionButton: 'button[aria-label="Add to solution"]',
  },

  // Delete Confirmation Dialog
  DeleteDialog: {
    Dialog: '[role="dialog"][aria-label="Delete app"]',
    ConfirmMessage: 'text="Are you sure you want to delete this app?"',
    DeleteButton: 'button[aria-label="Delete"]',
    CancelButton: 'button[aria-label="Cancel"]',
  },

  // Common UI Elements
  Common: {
    LoadingSpinner: '[role="progressbar"][aria-label="Loading"]',
    ErrorBanner: '[role="alert"][aria-live="assertive"]',
    SuccessBanner: '[role="status"][aria-live="polite"]',
    ToastNotification: '[role="status"][aria-label="Notification"]',
    ConfirmDialog: '[role="dialog"][aria-label="Confirm"]',
    CancelButton: 'button[aria-label="Cancel"]',
    OKButton: 'button[aria-label="OK"]',
    CloseButton: 'button[aria-label="Close"]',
  },
};

/**
 * Helper function to get data test id selector
 */
export const getCanvasDataTestId = (testId: string): string => {
  return `[data-testid="${testId}"]`;
};

/**
 * Helper function to get control by name
 */
export const getCanvasControlByName = (controlName: string): string => {
  return `[data-control-name="${controlName}"]`;
};

/**
 * Helper function to get screen by name
 */
export const getCanvasScreenByName = (screenName: string): string => {
  return `[data-screen-name="${screenName}"]`;
};
