[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

---

[Power Platform Playwright Toolkit](../README.md) / PowerAppsPageSelectors

# Variable: PowerAppsPageSelectors

> `const` **PowerAppsPageSelectors**: `object`

Defined in: locators/power-apps.locators.ts:15

Power Apps Page Selectors - Constant object for easy management
Organized by page/section for better maintainability

## Type Declaration

### Root

> **Root**: `string` = `'#root'`

### PageHeader

> **PageHeader**: `string` = `'#o365header'`

### MainNavigation

> **MainNavigation**: `string` = `'[role="navigation"][aria-label="main"]'`

### AppsPage

> **AppsPage**: `object`

#### AppsPage.MainContainer

> **MainContainer**: `string` = `'[data-test-id="PageCanvasSlot"]'`

#### AppsPage.PageContainer

> **PageContainer**: `string` = `'[class*="appsPageContainer"]'`

#### AppsPage.Sidebar

> **Sidebar**: `string` = `'[role="navigation"][aria-label="Main"]'`

#### AppsPage.CommandBar

> **CommandBar**: `string` = `'[role="menubar"][class*="ms-CommandBar"]'`

#### AppsPage.NewApp

> **NewApp**: `string` = `'button[role="menuitem"][name="New app"]'`

#### AppsPage.AllApps

> **AllApps**: `string` = `'button[data-test-id="All"]'`

#### AppsPage.CanvasApp

> **CanvasApp**: `string` = `'button[name="Canvas"]'`

#### AppsPage.ModelApp

> **ModelApp**: `string` = `'button[role="menuitem"]:has-text("Model-driven")'`

#### AppsPage.PortalApp

> **PortalApp**: `string` = `'button[name="Portal"]'`

#### AppsPage.EditApp

> **EditApp**: `string` = `'button[role="menuitem"][name="Edit"]'`

#### AppsPage.CanvasEditApp

> **CanvasEditApp**: `string` = `'button[role="menuitem"]:has-text("Edit")'`

#### AppsPage.DeleteApp

> **DeleteApp**: `string` = `'button[role="menuitem"] i[data-icon-name="Delete"]'`

#### AppsPage.AppListsGridContainer

> **AppListsGridContainer**: `string` = `'[data-automationid="DetailsList"]'`

#### AppsPage.AppNameContainerSelector

> **AppNameContainerSelector**: `string` = `'[data-automationid="DetailsRowFields"]'`

#### AppsPage.AppSelector

> **AppSelector**: `string` = `'[role="rowheader"][aria-colindex="3"] [class*="ms-Link"]:has-text("{0}")'`

#### AppsPage.ContextualMenu

> **ContextualMenu**: `string` = `'[data-automation-key="contextualMenu"]'`

### SolutionsPage

> **SolutionsPage**: `object`

#### SolutionsPage.SideBar

> **SideBar**: `string` = `'[class*="ba-Sidebar ba-Sidebar-"]'`

#### SolutionsPage.CommandBar

> **CommandBar**: `string` = `'[class*="command-bar"] [data-automation-id="visibleContent"]'`

#### SolutionsPage.SearchTextBox

> **SearchTextBox**: `string` = `'[data-automation-id="visibleContent"] [role="searchbox"]'`

#### SolutionsPage.SolutionsListContainer

> **SolutionsListContainer**: `string` = `'[data-automationid="DetailsList"]'`

#### SolutionsPage.ComponentTypesList

> **ComponentTypesList**: `string` = `'[role="tree"] [class*="ms-List-surface"]'`

#### SolutionsPage.DefaultSolutionContainerGrid

> **DefaultSolutionContainerGrid**: `string` = `'[data-automationid="DetailsList"] [role="grid"]'`

#### SolutionsPage.SolutionPreviewButton

> **SolutionPreviewButton**: `string` = `'[id*="Toggle"][role="switch"]'`

#### SolutionsPage.SolutionSelector

> **SolutionSelector**: `string` = `'[role="rowheader"][data-automation-key="name"] [class*="ms-Link"]:has-text("{0}")'`

#### SolutionsPage.SolutionNewLookTeachingBubble

> **SolutionNewLookTeachingBubble**: `string` = `'[role="dialog"][class*="ms-TeachingBubble-content"]'`

#### SolutionsPage.SolutionNewLookTeachingBubbleCloseButton

> **SolutionNewLookTeachingBubbleCloseButton**: `string` = `'[aria-label="Close"][class*="ms-TeachingBubble-closebutton"]'`

#### SolutionsPage.SiteMapContainer

> **SiteMapContainer**: `string` = `'[data-automationid="DetailsList"]'`

#### SolutionsPage.SiteMapNameContainer

> **SiteMapNameContainer**: `string` = `'[role="grid"] [data-automationid="DetailsRow"]'`

#### SolutionsPage.SiteMapSelector

> **SiteMapSelector**: `string` = `'[role="gridcell"] [role="link"][class*="ms-Link"][data-test-id="sitemap-{0}"]'`

### AppPreviewPage

> **AppPreviewPage**: `object`

#### AppPreviewPage.CanvasAndPanes

> **CanvasAndPanes**: `string` = `'[class*="canvasAndPanes"]'`

#### AppPreviewPage.CanvasAppBackStageRootComponent

> **CanvasAppBackStageRootComponent**: `string` = `'#backstage-root-component'`

#### AppPreviewPage.CanvasAppManagementPage

> **CanvasAppManagementPage**: `string` = `'#ba-Page-main'`

#### AppPreviewPage.CanvasPlaceholderNewPage

> **CanvasPlaceholderNewPage**: `string` = `'[data-cy="canvasPlaceholderNewPage"]'`

#### AppPreviewPage.CloseButton

> **CloseButton**: `string` = `"button[class*='ms-Button--action ms-Button--command'][class*='closeButton'][title='Close']"`

#### AppPreviewPage.PlayButton

> **PlayButton**: `string` = `'button[role="menuitem"]:has-text("Play")'`

#### AppPreviewPage.PreviewPlaceholder

> **PreviewPlaceholder**: `string` = `'#previewPlaceholder'`

#### AppPreviewPage.PublishButton

> **PublishButton**: `string` = `'button[role="menuitem"]:has-text("Publish")'`

#### AppPreviewPage.SaveButton

> **SaveButton**: `string` = `'button[role="menuitem"]:has-text("Save")'`

### ModelAppPage

> **ModelAppPage**: `object`

#### ModelAppPage.ApplicationShell

> **ApplicationShell**: `string` = `'#ApplicationShell'`

#### ModelAppPage.AppTitle

> **AppTitle**: `string` = `'[data-id="appBreadCrumb"]'`

#### ModelAppPage.GlobalCommandBar

> **GlobalCommandBar**: `string` = `'[data-id="topBar"] [data-id="CommandBar"]'`

#### ModelAppPage.MainContent

> **MainContent**: `string` = `'#mainContent'`

### HomePage

> **HomePage**: `object`

#### HomePage.Apps

> **Apps**: `string` = `'[aria-label="Apps"] >> text=Apps'`

#### HomePage.MainContainer

> **MainContainer**: `string` = `'[class*="mainContainerStyle"]'`

#### HomePage.MainContent

> **MainContent**: `string` = `'main[aria-label="Home page"]'`

#### HomePage.HomePageContainer

> **HomePageContainer**: `string` = `'[class*="homePageContainer"]'`

#### HomePage.HeaderRegion

> **HeaderRegion**: `string` = `'[role="region"][aria-label="Home page header"]'`

#### HomePage.PlansSection

> **PlansSection**: `string` = `'[role="region"][aria-label="Plans"]'`

#### HomePage.AppsSection

> **AppsSection**: `string` = `'[role="region"][aria-label="Apps"]'`

#### HomePage.LearningSection

> **LearningSection**: `string` = `'[role="region"][aria-label="Learning for every level"]'`

### TeachingBubble

> **TeachingBubble**: `string` = `'[role="dialog"][class*="ms-TeachingBubble-content"]'`

### TeachingBubbleCloseButton

> **TeachingBubbleCloseButton**: `string` = `'[class*="ms-TeachingBubble-closebutton"]'`

### TeachingBubblePrimaryButton

> **TeachingBubblePrimaryButton**: `string` = `'[role="button"].ms-TeachingBubble-primaryButton'`

### ModalFocusTrapZone

> **ModalFocusTrapZone**: `string` = `"[id*='ModalFocusTrapZone']"`

### DialogAcceptButton

> **DialogAcceptButton**: `string` = `'[data-test-id="Dialog.Accept"]'`

### DialogCancelButton

> **DialogCancelButton**: `string` = `'[data-test-id="Dialog.Cancel"]'`

### CanvasDesignerIframe

> **CanvasDesignerIframe**: `string` = `'[data-test-id="iframe-powerapps-studio"]'`

### CanvasPlayerIframe

> **CanvasPlayerIframe**: `string` = `'iframe[name="app-player"]'`

### MeInitialsButton

> **MeInitialsButton**: `string` = `'#meInitialsButton'`

### SignOutButton

> **SignOutButton**: `string` = `'#mectrl_body_signOut'`

### SignOutLink

> **SignOutLink**: `string` = `'#meControlSignoutLink'`

### ErrorPage

> **ErrorPage**: `object`

#### ErrorPage.Container

> **Container**: `string` = `'[data-cy="ppux-error-page"]'`

#### ErrorPage.Title

> **Title**: `string` = `'h1:has-text("Sorry, there\'s been a disconnect")'`

#### ErrorPage.Message

> **Message**: `string` = `'div:has-text("We can\'t find the page you\'re looking for")'`

#### ErrorPage.HomeButton

> **HomeButton**: `string` = `'a[href="/"]:has-text("Go to home page")'`
