[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / CanvasAppLocators

# Variable: CanvasAppLocators

> `const` **CanvasAppLocators**: `object`

Defined in: locators/canvas-app.locators.ts:7

Canvas App Locators
Centralized selectors for Canvas App creation, editing, and testing
Based on Microsoft Power Apps Canvas App documentation

## Type Declaration

### Home

> **Home**: `object`

#### Home.CreateButton

> **CreateButton**: `string` = `'button[name="Create"]'`

#### Home.CreateMenu

> **CreateMenu**: `string` = `'[role="menu"][aria-label="Create menu"]'`

#### Home.BlankAppOption

> **BlankAppOption**: `string` = `'[data-testid="create-blank-canvas-app"]'`

#### Home.TemplateAppOption

> **TemplateAppOption**: `string` = `'[data-testid="create-from-template"]'`

#### Home.DataAppOption

> **DataAppOption**: `string` = `'[data-testid="create-from-data"]'`

#### Home.AppsGrid

> **AppsGrid**: `string` = `'[role="grid"][aria-label="Apps"]'`

#### Home.AppCard()

> **AppCard**: (`appName`) => `string`

##### Parameters

###### appName

`string`

##### Returns

`string`

#### Home.SearchBox

> **SearchBox**: `string` = `'input[placeholder="Search"]'`

#### Home.FilterButton

> **FilterButton**: `string` = `'button[aria-label="Filter"]'`

### Studio

> **Studio**: `object`

#### Studio.StudioFrame

> **StudioFrame**: `string` = `'iframe[name="canvas-app-studio"]'`

#### Studio.CommandBar

> **CommandBar**: `object`

#### Studio.CommandBar.AppName

> **AppName**: `string` = `'input[aria-label="App name"]'`

#### Studio.CommandBar.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

#### Studio.CommandBar.SaveAsButton

> **SaveAsButton**: `string` = `'button[aria-label="Save as"]'`

#### Studio.CommandBar.PublishButton

> **PublishButton**: `string` = `'button[aria-label="Publish"]'`

#### Studio.CommandBar.PlayButton

> **PlayButton**: `string` = `'button[aria-label="Play"]'`

#### Studio.CommandBar.SettingsButton

> **SettingsButton**: `string` = `'button[aria-label="Settings"]'`

#### Studio.CommandBar.UndoButton

> **UndoButton**: `string` = `'button[aria-label="Undo"]'`

#### Studio.CommandBar.RedoButton

> **RedoButton**: `string` = `'button[aria-label="Redo"]'`

#### Studio.CommandBar.ShareButton

> **ShareButton**: `string` = `'button[aria-label="Share"]'`

#### Studio.LeftNav

> **LeftNav**: `object`

#### Studio.LeftNav.TreeViewTab

> **TreeViewTab**: `string` = `'button[aria-label="Tree view"]'`

#### Studio.LeftNav.InsertTab

> **InsertTab**: `string` = `'button[aria-label="Insert"]'`

#### Studio.LeftNav.DataTab

> **DataTab**: `string` = `'button[aria-label="Data"]'`

#### Studio.LeftNav.MediaTab

> **MediaTab**: `string` = `'button[aria-label="Media"]'`

#### Studio.LeftNav.AdvancedTab

> **AdvancedTab**: `string` = `'button[aria-label="Advanced tools"]'`

#### Studio.LeftNav.SearchButton

> **SearchButton**: `string` = `'button[aria-label="Search"]'`

#### Studio.Insert

> **Insert**: `object`

#### Studio.Insert.SearchControl

> **SearchControl**: `string` = `'input[placeholder="Search controls"]'`

#### Studio.Insert.LayoutSection

> **LayoutSection**: `string` = `'button[aria-label="Layout"]'`

#### Studio.Insert.InputSection

> **InputSection**: `string` = `'button[aria-label="Input"]'`

#### Studio.Insert.DisplaySection

> **DisplaySection**: `string` = `'button[aria-label="Display"]'`

#### Studio.Insert.IconsSection

> **IconsSection**: `string` = `'button[aria-label="Icons"]'`

#### Studio.Insert.MediaSection

> **MediaSection**: `string` = `'button[aria-label="Media"]'`

#### Studio.Insert.ChartsSection

> **ChartsSection**: `string` = `'button[aria-label="Charts"]'`

#### Studio.Insert.AISection

> **AISection**: `string` = `'button[aria-label="AI"]'`

#### Studio.Insert.ButtonControl

> **ButtonControl**: `string` = `'div[data-control-type="Button"]'`

#### Studio.Insert.TextLabelControl

> **TextLabelControl**: `string` = `'div[data-control-type="Label"]'`

#### Studio.Insert.TextInputControl

> **TextInputControl**: `string` = `'div[data-control-type="TextInput"]'`

#### Studio.Insert.DropdownControl

> **DropdownControl**: `string` = `'div[data-control-type="Dropdown"]'`

#### Studio.Insert.ComboboxControl

> **ComboboxControl**: `string` = `'div[data-control-type="ComboBox"]'`

#### Studio.Insert.DatePickerControl

> **DatePickerControl**: `string` = `'div[data-control-type="DatePicker"]'`

#### Studio.Insert.GalleryControl

> **GalleryControl**: `string` = `'div[data-control-type="Gallery"]'`

#### Studio.Insert.FormControl

> **FormControl**: `string` = `'div[data-control-type="Form"]'`

#### Studio.Insert.DataTableControl

> **DataTableControl**: `string` = `'div[data-control-type="DataTable"]'`

#### Studio.Insert.IconControl

> **IconControl**: `string` = `'div[data-control-type="Icon"]'`

#### Studio.Insert.ImageControl

> **ImageControl**: `string` = `'div[data-control-type="Image"]'`

#### Studio.Insert.ShapeControl

> **ShapeControl**: `string` = `'div[data-control-type="Shape"]'`

#### Studio.Insert.ChartControl

> **ChartControl**: `string` = `'div[data-control-type="Chart"]'`

#### Studio.Data

> **Data**: `object`

#### Studio.Data.AddDataButton

> **AddDataButton**: `string` = `'button[aria-label="Add data"]'`

#### Studio.Data.SearchDataSource

> **SearchDataSource**: `string` = `'input[placeholder="Search data sources"]'`

#### Studio.Data.DataSourcesList

> **DataSourcesList**: `string` = `'[role="list"][aria-label="Data sources"]'`

#### Studio.Data.DataSourceItem()

> **DataSourceItem**: (`sourceName`) => `string`

##### Parameters

###### sourceName

`string`

##### Returns

`string`

#### Studio.Data.ConnectButton

> **ConnectButton**: `string` = `'button[aria-label="Connect"]'`

#### Studio.Data.RefreshButton

> **RefreshButton**: `string` = `'button[aria-label="Refresh"]'`

#### Studio.Canvas

> **Canvas**: `object`

#### Studio.Canvas.CanvasArea

> **CanvasArea**: `string` = `'[data-automation-id="canvas-area"]'`

#### Studio.Canvas.Screen()

> **Screen**: (`screenName`) => `string`

##### Parameters

###### screenName

`string`

##### Returns

`string`

#### Studio.Canvas.Control()

> **Control**: (`controlName`) => `string`

##### Parameters

###### controlName

`string`

##### Returns

`string`

#### Studio.Canvas.SelectedControl

> **SelectedControl**: `string` = `'[data-is-selected="true"]'`

#### Studio.Properties

> **Properties**: `object`

#### Studio.Properties.PropertiesPanel

> **PropertiesPanel**: `string` = `'[data-automation-id="properties-panel"]'`

#### Studio.Properties.PropertySearch

> **PropertySearch**: `string` = `'input[placeholder="Search properties"]'`

#### Studio.Properties.PropertyItem()

> **PropertyItem**: (`propertyName`) => `string`

##### Parameters

###### propertyName

`string`

##### Returns

`string`

#### Studio.Properties.Text

> **Text**: `string` = `'input[aria-label="Text"]'`

#### Studio.Properties.Color

> **Color**: `string` = `'input[aria-label="Color"]'`

#### Studio.Properties.Fill

> **Fill**: `string` = `'input[aria-label="Fill"]'`

#### Studio.Properties.X

> **X**: `string` = `'input[aria-label="X"]'`

#### Studio.Properties.Y

> **Y**: `string` = `'input[aria-label="Y"]'`

#### Studio.Properties.Width

> **Width**: `string` = `'input[aria-label="Width"]'`

#### Studio.Properties.Height

> **Height**: `string` = `'input[aria-label="Height"]'`

#### Studio.Properties.Visible

> **Visible**: `string` = `'input[aria-label="Visible"]'`

#### Studio.Properties.OnSelect

> **OnSelect**: `string` = `'input[aria-label="OnSelect"]'`

#### Studio.FormulaBar

> **FormulaBar**: `object`

#### Studio.FormulaBar.FormulaInput

> **FormulaInput**: `string` = `'textarea[aria-label="Formula bar"]'`

#### Studio.FormulaBar.PropertyDropdown

> **PropertyDropdown**: `string` = `'[aria-label="Property selector"]'`

#### Studio.FormulaBar.ErrorIndicator

> **ErrorIndicator**: `string` = `'[aria-label="Formula error"]'`

#### Studio.FormulaBar.IntelliSenseList

> **IntelliSenseList**: `string` = `'[role="listbox"][aria-label="IntelliSense"]'`

#### Studio.Screens

> **Screens**: `object`

#### Studio.Screens.ScreensList

> **ScreensList**: `string` = `'[role="tree"][aria-label="Screens"]'`

#### Studio.Screens.AddScreenButton

> **AddScreenButton**: `string` = `'button[aria-label="New screen"]'`

#### Studio.Screens.ScreenItem()

> **ScreenItem**: (`screenName`) => `string`

##### Parameters

###### screenName

`string`

##### Returns

`string`

#### Studio.Screens.ScreenMenu

> **ScreenMenu**: `string` = `'button[aria-label="Screen options"]'`

#### Studio.Screens.DuplicateScreen

> **DuplicateScreen**: `string` = `'button[aria-label="Duplicate screen"]'`

#### Studio.Screens.DeleteScreen

> **DeleteScreen**: `string` = `'button[aria-label="Delete screen"]'`

### Settings

> **Settings**: `object`

#### Settings.SettingsDialog

> **SettingsDialog**: `string` = `'[role="dialog"][aria-label="Settings"]'`

#### Settings.GeneralTab

> **GeneralTab**: `string` = `'button[aria-label="General"]'`

#### Settings.DisplayTab

> **DisplayTab**: `string` = `'button[aria-label="Display"]'`

#### Settings.UpdatesTab

> **UpdatesTab**: `string` = `'button[aria-label="Updates"]'`

#### Settings.SupportTab

> **SupportTab**: `string` = `'button[aria-label="Support"]'`

#### Settings.AppNameInput

> **AppNameInput**: `string` = `'input[aria-label="App name"]'`

#### Settings.AppDescriptionInput

> **AppDescriptionInput**: `string` = `'textarea[aria-label="Description"]'`

#### Settings.AppIconUpload

> **AppIconUpload**: `string` = `'input[type="file"][aria-label="Upload icon"]'`

#### Settings.OrientationDropdown

> **OrientationDropdown**: `string` = `'select[aria-label="Orientation"]'`

#### Settings.ScreenSizeDropdown

> **ScreenSizeDropdown**: `string` = `'select[aria-label="Screen size"]'`

#### Settings.ScaleFitRadio

> **ScaleFitRadio**: `string` = `'input[type="radio"][aria-label="Scale to fit"]'`

#### Settings.LockAspectRatio

> **LockAspectRatio**: `string` = `'input[type="checkbox"][aria-label="Lock aspect ratio"]'`

#### Settings.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`

#### Settings.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

### SaveDialog

> **SaveDialog**: `object`

#### SaveDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Save"]'`

#### SaveDialog.AppNameInput

> **AppNameInput**: `string` = `'input[aria-label="Name"]'`

#### SaveDialog.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

#### SaveDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

#### SaveDialog.SaveProgressIndicator

> **SaveProgressIndicator**: `string` = `'[role="progressbar"]'`

#### SaveDialog.SuccessMessage

> **SuccessMessage**: `string` = `'[role="status"]:has-text("Saved")'`

### PublishDialog

> **PublishDialog**: `object`

#### PublishDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Publish"]'`

#### PublishDialog.PublishButton

> **PublishButton**: `string` = `'button[aria-label="Publish this version"]'`

#### PublishDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

#### PublishDialog.VersionComments

> **VersionComments**: `string` = `'textarea[aria-label="Comments"]'`

#### PublishDialog.PublishProgressIndicator

> **PublishProgressIndicator**: `string` = `'[role="progressbar"]'`

#### PublishDialog.SuccessMessage

> **SuccessMessage**: `string` = `'[role="status"]:has-text("Published")'`

### ShareDialog

> **ShareDialog**: `object`

#### ShareDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Share"]'`

#### ShareDialog.SearchUsers

> **SearchUsers**: `string` = `'input[placeholder="Enter a name, email address, or Everyone"]'`

#### ShareDialog.UsersList

> **UsersList**: `string` = `'[role="list"][aria-label="People with access"]'`

#### ShareDialog.PermissionDropdown

> **PermissionDropdown**: `string` = `'select[aria-label="Permission"]'`

#### ShareDialog.CanEditOption

> **CanEditOption**: `string` = `'option[value="CanEdit"]'`

#### ShareDialog.CanViewOption

> **CanViewOption**: `string` = `'option[value="CanView"]'`

#### ShareDialog.ShareButton

> **ShareButton**: `string` = `'button[aria-label="Share"]'`

#### ShareDialog.CopyLinkButton

> **CopyLinkButton**: `string` = `'button[aria-label="Copy link"]'`

#### ShareDialog.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`

### PlayMode

> **PlayMode**: `object`

#### PlayMode.PlayWindow

> **PlayWindow**: `string` = `'[data-automation-id="play-window"]'`

#### PlayMode.StopButton

> **StopButton**: `string` = `'button[aria-label="Close preview"]'`

#### PlayMode.RestartButton

> **RestartButton**: `string` = `'button[aria-label="Restart"]'`

#### PlayMode.ErrorMessage

> **ErrorMessage**: `string` = `'[role="alert"][aria-label="Error"]'`

### Details

> **Details**: `object`

#### Details.AppDetailsPage

> **AppDetailsPage**: `string` = `'[data-automation-id="app-details-page"]'`

#### Details.EditButton

> **EditButton**: `string` = `'button[aria-label="Edit"]'`

#### Details.PlayButton

> **PlayButton**: `string` = `'button[aria-label="Play"]'`

#### Details.ShareButton

> **ShareButton**: `string` = `'button[aria-label="Share"]'`

#### Details.DetailsTab

> **DetailsTab**: `string` = `'button[aria-label="Details"]'`

#### Details.VersionsTab

> **VersionsTab**: `string` = `'button[aria-label="Versions"]'`

#### Details.AnalyticsTab

> **AnalyticsTab**: `string` = `'button[aria-label="Analytics"]'`

#### Details.AppName

> **AppName**: `string` = `'[data-automation-id="app-name"]'`

#### Details.AppOwner

> **AppOwner**: `string` = `'[data-automation-id="app-owner"]'`

#### Details.AppCreated

> **AppCreated**: `string` = `'[data-automation-id="app-created"]'`

#### Details.AppModified

> **AppModified**: `string` = `'[data-automation-id="app-modified"]'`

#### Details.VersionsList

> **VersionsList**: `string` = `'[role="list"][aria-label="Versions"]'`

#### Details.VersionItem()

> **VersionItem**: (`version`) => `string`

##### Parameters

###### version

`string`

##### Returns

`string`

#### Details.RestoreButton

> **RestoreButton**: `string` = `'button[aria-label="Restore"]'`

#### Details.MoreButton

> **MoreButton**: `string` = `'button[aria-label="More actions"]'`

#### Details.DeleteButton

> **DeleteButton**: `string` = `'button[aria-label="Delete"]'`

#### Details.ExportButton

> **ExportButton**: `string` = `'button[aria-label="Export package"]'`

#### Details.AddToSolutionButton

> **AddToSolutionButton**: `string` = `'button[aria-label="Add to solution"]'`

### DeleteDialog

> **DeleteDialog**: `object`

#### DeleteDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Delete app"]'`

#### DeleteDialog.ConfirmMessage

> **ConfirmMessage**: `string` = `'text="Are you sure you want to delete this app?"'`

#### DeleteDialog.DeleteButton

> **DeleteButton**: `string` = `'button[aria-label="Delete"]'`

#### DeleteDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

### Common

> **Common**: `object`

#### Common.LoadingSpinner

> **LoadingSpinner**: `string` = `'[role="progressbar"][aria-label="Loading"]'`

#### Common.ErrorBanner

> **ErrorBanner**: `string` = `'[role="alert"][aria-live="assertive"]'`

#### Common.SuccessBanner

> **SuccessBanner**: `string` = `'[role="status"][aria-live="polite"]'`

#### Common.ToastNotification

> **ToastNotification**: `string` = `'[role="status"][aria-label="Notification"]'`

#### Common.ConfirmDialog

> **ConfirmDialog**: `string` = `'[role="dialog"][aria-label="Confirm"]'`

#### Common.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

#### Common.OKButton

> **OKButton**: `string` = `'button[aria-label="OK"]'`

#### Common.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`
