[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / ModelDrivenAppLocators

# Variable: ModelDrivenAppLocators

> `const` **ModelDrivenAppLocators**: `object`

Defined in: locators/model-driven-app.locators.ts:7

Model Driven App Locators
Centralized selectors for Model Driven App creation, editing, and testing
Based on Microsoft Power Apps Model Driven App documentation

## Type Declaration

### Home

> **Home**: `object`

#### Home.CreateButton

> **CreateButton**: `string` = `'button[name="Create"]'`

#### Home.CreateMenu

> **CreateMenu**: `string` = `'[role="menu"][aria-label="Create menu"]'`

#### Home.BlankAppOption

> **BlankAppOption**: `string` = `'[data-testid="create-blank-model-app"]'`

#### Home.FromSolutionOption

> **FromSolutionOption**: `string` = `'[data-testid="create-from-solution"]'`

#### Home.AppsGrid

> **AppsGrid**: `string` = `'[role="grid"][aria-label="Apps"]'`

#### Home.AppCard()

> **AppCard**: (`appName`) => `string`

##### Parameters

###### appName

`string`

##### Returns

`string`

#### Home.AppTypeFilter

> **AppTypeFilter**: `string` = `'select[aria-label="App type"]'`

#### Home.ModelDrivenOption

> **ModelDrivenOption**: `string` = `'option[value="ModelDriven"]'`

#### Home.SearchBox

> **SearchBox**: `string` = `'input[placeholder="Search"]'`

### Designer

> **Designer**: `object`

#### Designer.CommandBar

> **CommandBar**: `object`

#### Designer.CommandBar.AppNameInput

> **AppNameInput**: `string` = `'input[aria-label="App name"]'`

#### Designer.CommandBar.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

#### Designer.CommandBar.PublishButton

> **PublishButton**: `string` = `'button[aria-label="Publish"]'`

#### Designer.CommandBar.PlayButton

> **PlayButton**: `string` = `'button[aria-label="Play"]'`

#### Designer.CommandBar.SettingsButton

> **SettingsButton**: `string` = `'button[aria-label="Settings"]'`

#### Designer.CommandBar.ShareButton

> **ShareButton**: `string` = `'button[aria-label="Share"]'`

#### Designer.CommandBar.ValidateButton

> **ValidateButton**: `string` = `'button[aria-label="Validate"]'`

#### Designer.CommandBar.SwitchToClassicButton

> **SwitchToClassicButton**: `string` = `'button[aria-label="Switch to classic"]'`

#### Designer.LeftNav

> **LeftNav**: `object`

#### Designer.LeftNav.NavigationTab

> **NavigationTab**: `string` = `'button[aria-label="Navigation"]'`

#### Designer.LeftNav.PagesTab

> **PagesTab**: `string` = `'button[aria-label="Pages"]'`

#### Designer.LeftNav.DataTab

> **DataTab**: `string` = `'button[aria-label="Data"]'`

#### Designer.LeftNav.AutomationTab

> **AutomationTab**: `string` = `'button[aria-label="Automation"]'`

#### Designer.Pages

> **Pages**: `object`

#### Designer.Pages.PagesList

> **PagesList**: `string` = `'[role="tree"][aria-label="Pages"]'`

#### Designer.Pages.AddPageButton

> **AddPageButton**: `string` = `'button[aria-label="Add page"]'`

#### Designer.Pages.NewPageMenu

> **NewPageMenu**: `string` = `'[role="menu"][aria-label="New page"]'`

#### Designer.Pages.TableBasedPage

> **TableBasedPage**: `string` = `'button[aria-label="Table based view and form"]'`

#### Designer.Pages.DashboardPage

> **DashboardPage**: `string` = `'button[aria-label="Dashboard"]'`

#### Designer.Pages.CustomPage

> **CustomPage**: `string` = `'button[aria-label="Custom page"]'`

#### Designer.Pages.PageItem()

> **PageItem**: (`pageName`) => `string`

##### Parameters

###### pageName

`string`

##### Returns

`string`

#### Designer.Pages.PageMenu

> **PageMenu**: `string` = `'button[aria-label="Page options"]'`

#### Designer.Pages.EditPage

> **EditPage**: `string` = `'button[aria-label="Edit"]'`

#### Designer.Pages.DeletePage

> **DeletePage**: `string` = `'button[aria-label="Delete"]'`

#### Designer.Pages.MovePage

> **MovePage**: `string` = `'button[aria-label="Move"]'`

#### Designer.Navigation

> **Navigation**: `object`

#### Designer.Navigation.NavigationTree

> **NavigationTree**: `string` = `'[role="tree"][aria-label="Navigation"]'`

#### Designer.Navigation.AddGroupButton

> **AddGroupButton**: `string` = `'button[aria-label="Add group"]'`

#### Designer.Navigation.AddSubAreaButton

> **AddSubAreaButton**: `string` = `'button[aria-label="Add subarea"]'`

#### Designer.Navigation.GroupItem()

> **GroupItem**: (`groupName`) => `string`

##### Parameters

###### groupName

`string`

##### Returns

`string`

#### Designer.Navigation.SubAreaItem()

> **SubAreaItem**: (`subAreaName`) => `string`

##### Parameters

###### subAreaName

`string`

##### Returns

`string`

#### Designer.Navigation.TitleInput

> **TitleInput**: `string` = `'input[aria-label="Title"]'`

#### Designer.Navigation.IconPicker

> **IconPicker**: `string` = `'button[aria-label="Choose icon"]'`

#### Designer.Navigation.TablePicker

> **TablePicker**: `string` = `'button[aria-label="Choose table"]'`

#### Designer.Navigation.UrlInput

> **UrlInput**: `string` = `'input[aria-label="URL"]'`

#### Designer.Data

> **Data**: `object`

#### Designer.Data.AddTableButton

> **AddTableButton**: `string` = `'button[aria-label="Add table"]'`

#### Designer.Data.SearchTable

> **SearchTable**: `string` = `'input[placeholder="Search tables"]'`

#### Designer.Data.TablesList

> **TablesList**: `string` = `'[role="list"][aria-label="Tables"]'`

#### Designer.Data.TableItem()

> **TableItem**: (`tableName`) => `string`

##### Parameters

###### tableName

`string`

##### Returns

`string`

#### Designer.Data.FormsSection

> **FormsSection**: `string` = `'button[aria-label="Forms"]'`

#### Designer.Data.ViewsSection

> **ViewsSection**: `string` = `'button[aria-label="Views"]'`

#### Designer.Data.ChartsSection

> **ChartsSection**: `string` = `'button[aria-label="Charts"]'`

#### Designer.Data.DashboardsSection

> **DashboardsSection**: `string` = `'button[aria-label="Dashboards"]'`

#### Designer.Properties

> **Properties**: `object`

#### Designer.Properties.PropertiesPanel

> **PropertiesPanel**: `string` = `'[data-automation-id="properties-panel"]'`

#### Designer.Properties.DisplayNameInput

> **DisplayNameInput**: `string` = `'input[aria-label="Display name"]'`

#### Designer.Properties.DescriptionInput

> **DescriptionInput**: `string` = `'textarea[aria-label="Description"]'`

#### Designer.Properties.IconPicker

> **IconPicker**: `string` = `'button[aria-label="Icon"]'`

#### Designer.Properties.WelcomePageToggle

> **WelcomePageToggle**: `string` = `'input[type="checkbox"][aria-label="Enable welcome page"]'`

#### Designer.Properties.MobileToggle

> **MobileToggle**: `string` = `'input[type="checkbox"][aria-label="Enable for mobile"]'`

#### Designer.Canvas

> **Canvas**: `object`

#### Designer.Canvas.PreviewArea

> **PreviewArea**: `string` = `'[data-automation-id="preview-area"]'`

#### Designer.Canvas.AppModule

> **AppModule**: `string` = `'[data-automation-id="app-module"]'`

#### Designer.Canvas.SiteMap

> **SiteMap**: `string` = `'[data-automation-id="sitemap"]'`

### CreateTableDialog

> **CreateTableDialog**: `object`

#### CreateTableDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Create table"]'`

#### CreateTableDialog.DisplayNameInput

> **DisplayNameInput**: `string` = `'input[aria-label="Display name"]'`

#### CreateTableDialog.PluralNameInput

> **PluralNameInput**: `string` = `'input[aria-label="Plural name"]'`

#### CreateTableDialog.DescriptionInput

> **DescriptionInput**: `string` = `'textarea[aria-label="Description"]'`

#### CreateTableDialog.EnableAttachmentsToggle

> **EnableAttachmentsToggle**: `string` = `'input[type="checkbox"][aria-label="Enable attachments"]'`

#### CreateTableDialog.CreateButton

> **CreateButton**: `string` = `'button[aria-label="Create"]'`

#### CreateTableDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

### AddPageDialog

> **AddPageDialog**: `object`

#### AddPageDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Add page"]'`

#### AddPageDialog.PageTypeList

> **PageTypeList**: `string` = `'[role="list"][aria-label="Page types"]'`

#### AddPageDialog.SelectTableDropdown

> **SelectTableDropdown**: `string` = `'select[aria-label="Select table"]'`

#### AddPageDialog.TableOption()

> **TableOption**: (`tableName`) => `string`

##### Parameters

###### tableName

`string`

##### Returns

`string`

#### AddPageDialog.FormsList

> **FormsList**: `string` = `'[role="list"][aria-label="Forms"]'`

#### AddPageDialog.FormItem()

> **FormItem**: (`formName`) => `string`

##### Parameters

###### formName

`string`

##### Returns

`string`

#### AddPageDialog.MainForm

> **MainForm**: `string` = `'input[type="checkbox"][aria-label="Main form"]'`

#### AddPageDialog.QuickCreateForm

> **QuickCreateForm**: `string` = `'input[type="checkbox"][aria-label="Quick create form"]'`

#### AddPageDialog.QuickViewForm

> **QuickViewForm**: `string` = `'input[type="checkbox"][aria-label="Quick view form"]'`

#### AddPageDialog.ViewsList

> **ViewsList**: `string` = `'[role="list"][aria-label="Views"]'`

#### AddPageDialog.ViewItem()

> **ViewItem**: (`viewName`) => `string`

##### Parameters

###### viewName

`string`

##### Returns

`string`

#### AddPageDialog.AddButton

> **AddButton**: `string` = `'button[aria-label="Add"]'`

#### AddPageDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

### Settings

> **Settings**: `object`

#### Settings.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Settings"]'`

#### Settings.GeneralTab

> **GeneralTab**: `string` = `'button[aria-label="General"]'`

#### Settings.FeaturesTab

> **FeaturesTab**: `string` = `'button[aria-label="Features"]'`

#### Settings.UpcomingTab

> **UpcomingTab**: `string` = `'button[aria-label="Upcoming"]'`

#### Settings.AppNameInput

> **AppNameInput**: `string` = `'input[aria-label="Name"]'`

#### Settings.DescriptionInput

> **DescriptionInput**: `string` = `'textarea[aria-label="Description"]'`

#### Settings.AppIconUpload

> **AppIconUpload**: `string` = `'input[type="file"][aria-label="Upload icon"]'`

#### Settings.WelcomePageUrl

> **WelcomePageUrl**: `string` = `'input[aria-label="Welcome page URL"]'`

#### Settings.EnableMobileToggle

> **EnableMobileToggle**: `string` = `'input[type="checkbox"][aria-label="Enable for mobile"]'`

#### Settings.EnableOfflineToggle

> **EnableOfflineToggle**: `string` = `'input[type="checkbox"][aria-label="Enable offline mode"]'`

#### Settings.ReadOnlyToggle

> **ReadOnlyToggle**: `string` = `'input[type="checkbox"][aria-label="Read-only mode"]'`

#### Settings.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

#### Settings.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`

### PublishDialog

> **PublishDialog**: `object`

#### PublishDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Publish"]'`

#### PublishDialog.PublishButton

> **PublishButton**: `string` = `'button[aria-label="Publish"]'`

#### PublishDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

#### PublishDialog.ProgressIndicator

> **ProgressIndicator**: `string` = `'[role="progressbar"]'`

#### PublishDialog.SuccessMessage

> **SuccessMessage**: `string` = `'[role="status"]:has-text("Published successfully")'`

### Validation

> **Validation**: `object`

#### Validation.ValidationPanel

> **ValidationPanel**: `string` = `'[data-automation-id="validation-panel"]'`

#### Validation.ErrorsList

> **ErrorsList**: `string` = `'[role="list"][aria-label="Errors"]'`

#### Validation.WarningsList

> **WarningsList**: `string` = `'[role="list"][aria-label="Warnings"]'`

#### Validation.ErrorItem

> **ErrorItem**: `string` = `'[role="listitem"][data-severity="error"]'`

#### Validation.WarningItem

> **WarningItem**: `string` = `'[role="listitem"][data-severity="warning"]'`

#### Validation.FixButton

> **FixButton**: `string` = `'button[aria-label="Fix"]'`

#### Validation.IgnoreButton

> **IgnoreButton**: `string` = `'button[aria-label="Ignore"]'`

#### Validation.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`

### Runtime

> **Runtime**: `object`

#### Runtime.AppBar

> **AppBar**: `object`

#### Runtime.AppBar.AppName

> **AppName**: `string` = `'[data-automation-id="app-name"]'`

#### Runtime.AppBar.SearchBox

> **SearchBox**: `string` = `'input[placeholder="Search"]'`

#### Runtime.AppBar.SettingsButton

> **SettingsButton**: `string` = `'button[aria-label="Settings"]'`

#### Runtime.AppBar.HelpButton

> **HelpButton**: `string` = `'button[aria-label="Help"]'`

#### Runtime.AppBar.UserMenu

> **UserMenu**: `string` = `'button[aria-label="User menu"]'`

#### Runtime.SiteMap

> **SiteMap**: `object`

#### Runtime.SiteMap.NavigationPane

> **NavigationPane**: `string` = `'[data-automation-id="navigation-pane"]'`

#### Runtime.SiteMap.ExpandButton

> **ExpandButton**: `string` = `'button[aria-label="Expand navigation"]'`

#### Runtime.SiteMap.CollapseButton

> **CollapseButton**: `string` = `'button[aria-label="Collapse navigation"]'`

#### Runtime.SiteMap.GroupHeader()

> **GroupHeader**: (`groupName`) => `string`

##### Parameters

###### groupName

`string`

##### Returns

`string`

#### Runtime.SiteMap.SubArea()

> **SubArea**: (`subAreaName`) => `string`

##### Parameters

###### subAreaName

`string`

##### Returns

`string`

#### Runtime.SiteMap.RecentItems

> **RecentItems**: `string` = `'button[aria-label="Recent"]'`

#### Runtime.SiteMap.PinnedItems

> **PinnedItems**: `string` = `'button[aria-label="Pinned"]'`

#### Runtime.Content

> **Content**: `object`

#### Runtime.Content.MainContent

> **MainContent**: `string` = `'[data-automation-id="main-content"]'`

#### Runtime.Content.PageTitle

> **PageTitle**: `string` = `'[data-automation-id="page-title"]'`

#### Runtime.Content.CommandBar

> **CommandBar**: `string` = `'[data-automation-id="command-bar"]'`

#### Runtime.Content.Grid

> **Grid**: `object`

#### Runtime.Content.Grid.Container

> **Container**: `string` = `'[role="grid"], [role="treegrid"]'`

#### Runtime.Content.Grid.Header

> **Header**: `string` = `'[role="row"]:first-child'`

#### Runtime.Content.Grid.Body

> **Body**: `string` = `'[role="rowgroup"]'`

#### Runtime.Content.Grid.Row

> **Row**: `string` = `'[role="row"]'`

#### Runtime.Content.Grid.RowByIndex()

> **RowByIndex**: (`index`) => `string`

##### Parameters

###### index

`number`

##### Returns

`string`

#### Runtime.Content.Grid.Cell

> **Cell**: `string` = `'[role="gridcell"]'`

#### Runtime.Content.Grid.CellByRowAndColumn()

> **CellByRowAndColumn**: (`row`, `col`) => `string`

##### Parameters

###### row

`number`

###### col

`number`

##### Returns

`string`

#### Runtime.Content.Grid.LinkCell

> **LinkCell**: `string` = `'[role="gridcell"] a'`

#### Runtime.Content.Grid.CheckboxCell

> **CheckboxCell**: `string` = `'[role="gridcell"] input[type="checkbox"]'`

#### Runtime.Content.Grid.ColumnHeader()

> **ColumnHeader**: (`name`) => `string`

##### Parameters

###### name

`string`

##### Returns

`string`

#### Runtime.Content.Grid.EmptyMessage

> **EmptyMessage**: `string` = `'[data-id="no-records"]'`

#### Runtime.Content.Grid.LoadingIndicator

> **LoadingIndicator**: `string` = `'[data-id="grid-loading"]'`

#### Runtime.Content.Grid.Pagination

> **Pagination**: `object`

#### Runtime.Content.Grid.Pagination.Container

> **Container**: `string` = `'[data-id="pagination"]'`

#### Runtime.Content.Grid.Pagination.NextPage

> **NextPage**: `string` = `'button[aria-label*="Next page"]'`

#### Runtime.Content.Grid.Pagination.PreviousPage

> **PreviousPage**: `string` = `'button[aria-label*="Previous page"]'`

#### Runtime.Content.Grid.Pagination.PageInput

> **PageInput**: `string` = `'input[aria-label*="Page number"]'`

#### Runtime.Content.Grid.Pagination.RecordCount

> **RecordCount**: `string` = `'[data-id="record-count"]'`

#### Runtime.Content.Grid.ViewSelector

> **ViewSelector**: `object`

#### Runtime.Content.Grid.ViewSelector.Dropdown

> **Dropdown**: `string` = `'[data-id="viewSelector"]'`

#### Runtime.Content.Grid.ViewSelector.Option()

> **Option**: (`viewName`) => `string`

##### Parameters

###### viewName

`string`

##### Returns

`string`

#### Runtime.Content.Form

> **Form**: `string` = `'[data-automation-id="form"]'`

#### Runtime.Content.FormHeader

> **FormHeader**: `string` = `'[data-automation-id="form-header"]'`

#### Runtime.Content.FormTabs

> **FormTabs**: `string` = `'[role="tablist"]'`

#### Runtime.Content.FormTab()

> **FormTab**: (`tabName`) => `string`

##### Parameters

###### tabName

`string`

##### Returns

`string`

#### Runtime.Content.FormSection()

> **FormSection**: (`sectionName`) => `string`

##### Parameters

###### sectionName

`string`

##### Returns

`string`

#### Runtime.Content.FormField()

> **FormField**: (`fieldName`) => `string`

##### Parameters

###### fieldName

`string`

##### Returns

`string`

#### Runtime.Content.Dashboard

> **Dashboard**: `string` = `'[data-automation-id="dashboard"]'`

#### Runtime.Content.DashboardChart

> **DashboardChart**: `string` = `'[data-automation-id="chart"]'`

#### Runtime.Content.DashboardGrid

> **DashboardGrid**: `string` = `'[data-automation-id="dashboard-grid"]'`

#### Runtime.Commands

> **Commands**: `object`

#### Runtime.Commands.NewButton

> **NewButton**: `string` = `'button[aria-label="New"]'`

#### Runtime.Commands.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

#### Runtime.Commands.SaveAndCloseButton

> **SaveAndCloseButton**: `string` = `'button[aria-label="Save & Close"]'`

#### Runtime.Commands.DeleteButton

> **DeleteButton**: `string` = `'button[aria-label="Delete"]'`

#### Runtime.Commands.RefreshButton

> **RefreshButton**: `string` = `'button[aria-label="Refresh"]'`

#### Runtime.Commands.ExportButton

> **ExportButton**: `string` = `'button[aria-label="Export to Excel"]'`

#### Runtime.Commands.EmailButton

> **EmailButton**: `string` = `'button[aria-label="Email a Link"]'`

#### Runtime.Commands.FlowButton

> **FlowButton**: `string` = `'button[aria-label="Flow"]'`

#### Runtime.Commands.MoreCommandsButton

> **MoreCommandsButton**: `string` = `'button[aria-label="More commands"]'`

### ShareDialog

> **ShareDialog**: `object`

#### ShareDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Share"]'`

#### ShareDialog.SearchUsers

> **SearchUsers**: `string` = `'input[placeholder="Enter a name or email address"]'`

#### ShareDialog.UsersList

> **UsersList**: `string` = `'[role="list"][aria-label="Users"]'`

#### ShareDialog.SecurityRoleDropdown

> **SecurityRoleDropdown**: `string` = `'select[aria-label="Security role"]'`

#### ShareDialog.ReadPrivilege

> **ReadPrivilege**: `string` = `'option[value="Read"]'`

#### ShareDialog.WritePrivilege

> **WritePrivilege**: `string` = `'option[value="Write"]'`

#### ShareDialog.ShareButton

> **ShareButton**: `string` = `'button[aria-label="Share"]'`

#### ShareDialog.ManageRolesButton

> **ManageRolesButton**: `string` = `'button[aria-label="Manage security roles"]'`

#### ShareDialog.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`

### Details

> **Details**: `object`

#### Details.DetailsPage

> **DetailsPage**: `string` = `'[data-automation-id="app-details-page"]'`

#### Details.EditButton

> **EditButton**: `string` = `'button[aria-label="Edit"]'`

#### Details.PlayButton

> **PlayButton**: `string` = `'button[aria-label="Play"]'`

#### Details.ShareButton

> **ShareButton**: `string` = `'button[aria-label="Share"]'`

#### Details.OverviewTab

> **OverviewTab**: `string` = `'button[aria-label="Overview"]'`

#### Details.ComponentsTab

> **ComponentsTab**: `string` = `'button[aria-label="Components"]'`

#### Details.SettingsTab

> **SettingsTab**: `string` = `'button[aria-label="Settings"]'`

#### Details.AppName

> **AppName**: `string` = `'[data-automation-id="app-name"]'`

#### Details.AppDescription

> **AppDescription**: `string` = `'[data-automation-id="app-description"]'`

#### Details.AppOwner

> **AppOwner**: `string` = `'[data-automation-id="app-owner"]'`

#### Details.AppCreated

> **AppCreated**: `string` = `'[data-automation-id="created-date"]'`

#### Details.AppModified

> **AppModified**: `string` = `'[data-automation-id="modified-date"]'`

#### Details.ComponentsList

> **ComponentsList**: `string` = `'[role="list"][aria-label="Components"]'`

#### Details.TablesCount

> **TablesCount**: `string` = `'[data-automation-id="tables-count"]'`

#### Details.FormsCount

> **FormsCount**: `string` = `'[data-automation-id="forms-count"]'`

#### Details.ViewsCount

> **ViewsCount**: `string` = `'[data-automation-id="views-count"]'`

#### Details.ChartsCount

> **ChartsCount**: `string` = `'[data-automation-id="charts-count"]'`

#### Details.MoreButton

> **MoreButton**: `string` = `'button[aria-label="More actions"]'`

#### Details.DeleteButton

> **DeleteButton**: `string` = `'button[aria-label="Delete"]'`

#### Details.ExportButton

> **ExportButton**: `string` = `'button[aria-label="Export"]'`

#### Details.ImportButton

> **ImportButton**: `string` = `'button[aria-label="Import"]'`

#### Details.CopyButton

> **CopyButton**: `string` = `'button[aria-label="Create a copy"]'`

#### Details.AddToSolutionButton

> **AddToSolutionButton**: `string` = `'button[aria-label="Add to solution"]'`

### Solutions

> **Solutions**: `object`

#### Solutions.SolutionExplorer

> **SolutionExplorer**: `string` = `'[data-automation-id="solution-explorer"]'`

#### Solutions.AddExistingButton

> **AddExistingButton**: `string` = `'button[aria-label="Add existing"]'`

#### Solutions.AddNewButton

> **AddNewButton**: `string` = `'button[aria-label="Add new"]'`

#### Solutions.SolutionPicker

> **SolutionPicker**: `string` = `'select[aria-label="Select solution"]'`

#### Solutions.SolutionOption()

> **SolutionOption**: (`solutionName`) => `string`

##### Parameters

###### solutionName

`string`

##### Returns

`string`

#### Solutions.AddButton

> **AddButton**: `string` = `'button[aria-label="Add"]'`

### DeleteDialog

> **DeleteDialog**: `object`

#### DeleteDialog.Dialog

> **Dialog**: `string` = `'[role="dialog"][aria-label="Confirm deletion"]'`

#### DeleteDialog.ConfirmMessage

> **ConfirmMessage**: `string` = `'text="Are you sure you want to delete"'`

#### DeleteDialog.ConfirmCheckbox

> **ConfirmCheckbox**: `string` = `'input[type="checkbox"][aria-label="I understand"]'`

#### DeleteDialog.DeleteButton

> **DeleteButton**: `string` = `'button[aria-label="Delete"]'`

#### DeleteDialog.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

### Common

> **Common**: `object`

#### Common.LoadingSpinner

> **LoadingSpinner**: `string` = `'[role="progressbar"][aria-label="Loading"]'`

#### Common.ErrorNotification

> **ErrorNotification**: `string` = `'[role="alert"][aria-live="assertive"]'`

#### Common.SuccessNotification

> **SuccessNotification**: `string` = `'[role="status"][aria-live="polite"]'`

#### Common.ToastMessage

> **ToastMessage**: `string` = `'[data-automation-id="toast-notification"]'`

#### Common.ConfirmDialog

> **ConfirmDialog**: `string` = `'[role="dialog"][aria-label="Confirm"]'`

#### Common.BackButton

> **BackButton**: `string` = `'button[aria-label="Back"]'`

#### Common.CloseButton

> **CloseButton**: `string` = `'button[aria-label="Close"]'`

#### Common.SaveButton

> **SaveButton**: `string` = `'button[aria-label="Save"]'`

#### Common.CancelButton

> **CancelButton**: `string` = `'button[aria-label="Cancel"]'`

#### Common.OKButton

> **OKButton**: `string` = `'button[aria-label="OK"]'`
