/**
 * Power Apps Page Locators using Playwright Best Practices
 * Centralized locator management for Power Apps Maker Portal
 * Supports Canvas Apps, Model-Driven Apps, and Power Platform portal
 * Extracted and enhanced from lib/old
 */

import { Page, Locator } from '@playwright/test';
import { LocatorUtils } from './base.locators';

/**
 * Power Apps Page Selectors - Constant object for easy management
 * Organized by page/section for better maintainability
 */
export const PowerAppsPageSelectors = {
  // ============ Root Elements ============
  Root: '#root',
  PageHeader: '#o365header',
  MainNavigation: '[role="navigation"][aria-label="main"]',

  // ============ Apps Page ============
  AppsPage: {
    MainContainer: '[data-test-id="PageCanvasSlot"]',
    PageContainer: '[class*="appsPageContainer"]',
    Sidebar: '[role="navigation"][aria-label="Main"]',
    CommandBar: '[role="menubar"][class*="ms-CommandBar"]',
    NewApp: 'button[role="menuitem"][name="New app"]',
    AllApps: 'button[data-test-id="All"]',
    CanvasApp: 'button[name="Canvas"]',
    ModelApp: 'button[role="menuitem"]:has-text("Model-driven")',
    PortalApp: 'button[name="Portal"]',
    EditApp: 'button[role="menuitem"][name="Edit"]',
    CanvasEditApp: 'button[role="menuitem"]:has-text("Edit")',
    DeleteApp: 'button[role="menuitem"] i[data-icon-name="Delete"]',
    AppListsGridContainer: '[data-automationid="DetailsList"]',
    AppNameContainerSelector: '[data-automationid="DetailsRowFields"]',
    AppSelector: '[role="rowheader"][aria-colindex="3"] [class*="ms-Link"]:has-text("{0}")',
    ContextualMenu: '[data-automation-key="contextualMenu"]',
  },

  // ============ Solutions Page ============
  SolutionsPage: {
    SideBar: '[class*="ba-Sidebar ba-Sidebar-"]',
    CommandBar: '[class*="command-bar"] [data-automation-id="visibleContent"]',
    SearchTextBox: '[data-automation-id="visibleContent"] [role="searchbox"]',
    SolutionsListContainer: '[data-automationid="DetailsList"]',
    ComponentTypesList: '[role="tree"] [class*="ms-List-surface"]',
    DefaultSolutionContainerGrid: '[data-automationid="DetailsList"] [role="grid"]',
    SolutionPreviewButton: '[id*="Toggle"][role="switch"]',
    SolutionSelector:
      '[role="rowheader"][data-automation-key="name"] [class*="ms-Link"]:has-text("{0}")',
    SolutionNewLookTeachingBubble: '[role="dialog"][class*="ms-TeachingBubble-content"]',
    SolutionNewLookTeachingBubbleCloseButton:
      '[aria-label="Close"][class*="ms-TeachingBubble-closebutton"]',
    SiteMapContainer: '[data-automationid="DetailsList"]',
    SiteMapNameContainer: '[role="grid"] [data-automationid="DetailsRow"]',
    SiteMapSelector:
      '[role="gridcell"] [role="link"][class*="ms-Link"][data-test-id="sitemap-{0}"]',
  },

  // ============ App Preview Page (Canvas Studio) ============
  AppPreviewPage: {
    CanvasAndPanes: '[class*="canvasAndPanes"]',
    CanvasAppBackStageRootComponent: '#backstage-root-component',
    CanvasAppManagementPage: '#ba-Page-main',
    CanvasPlaceholderNewPage: '[data-cy="canvasPlaceholderNewPage"]',
    CloseButton:
      "button[class*='ms-Button--action ms-Button--command'][class*='closeButton'][title='Close']",
    PlayButton: 'button[role="menuitem"]:has-text("Play")',
    PreviewPlaceholder: '#previewPlaceholder',
    PublishButton: 'button[role="menuitem"]:has-text("Publish")',
    SaveButton: 'button[role="menuitem"]:has-text("Save")',
  },

  // ============ Model App Page ============
  ModelAppPage: {
    ApplicationShell: '#ApplicationShell',
    AppTitle: '[data-id="appBreadCrumb"]',
    GlobalCommandBar: '[data-id="topBar"] [data-id="CommandBar"]',
    MainContent: '#mainContent',
  },

  // ============ Home Page ============
  HomePage: {
    Apps: '[aria-label="Apps"] >> text=Apps',
    MainContainer: '[class*="mainContainerStyle"]',
    MainContent: 'main[aria-label="Home page"]',
    HomePageContainer: '[class*="homePageContainer"]',
    HeaderRegion: '[role="region"][aria-label="Home page header"]',
    PlansSection: '[role="region"][aria-label="Plans"]',
    AppsSection: '[role="region"][aria-label="Apps"]',
    LearningSection: '[role="region"][aria-label="Learning for every level"]',
  },

  // ============ Teaching Bubble ============
  TeachingBubble: '[role="dialog"][class*="ms-TeachingBubble-content"]',
  TeachingBubbleCloseButton: '[class*="ms-TeachingBubble-closebutton"]',
  TeachingBubblePrimaryButton: '[role="button"].ms-TeachingBubble-primaryButton',

  // ============ Dialog & Modal ============
  ModalFocusTrapZone: "[id*='ModalFocusTrapZone']",
  DialogAcceptButton: '[data-test-id="Dialog.Accept"]',
  DialogCancelButton: '[data-test-id="Dialog.Cancel"]',

  // ============ Canvas Designer Iframe ============
  CanvasDesignerIframe: '[data-test-id="iframe-powerapps-studio"]',
  CanvasPlayerIframe: 'iframe[name="app-player"]',

  // ============ Authentication ============
  MeInitialsButton: '#meInitialsButton',
  SignOutButton: '#mectrl_body_signOut',
  SignOutLink: '#meControlSignoutLink',

  // ============ Error Page ============
  ErrorPage: {
    Container: '[data-cy="ppux-error-page"]',
    Title: 'h1:has-text("Sorry, there\'s been a disconnect")',
    Message: 'div:has-text("We can\'t find the page you\'re looking for")',
    HomeButton: 'a[href="/"]:has-text("Go to home page")',
  },
};

/**
 * Helper class to work with Power Apps selectors and return Playwright Locators
 * Provides strongly-typed access to page elements for Canvas Apps, Model-Driven Apps, etc.
 */
export class PowerAppsPageLocators {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get locator for a selector string
   */
  private loc(selector: string): Locator {
    return this.page.locator(selector);
  }

  // ============ Root Elements ============
  get root(): Locator {
    return this.loc(PowerAppsPageSelectors.Root);
  }

  get pageHeader(): Locator {
    return this.loc(PowerAppsPageSelectors.PageHeader);
  }

  get mainNavigation(): Locator {
    return this.loc(PowerAppsPageSelectors.MainNavigation);
  }

  // ============ Home Page Locators ============
  get homePageMainContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.MainContainer);
  }

  get homePageMainContent(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.MainContent);
  }

  get homePageContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.HomePageContainer);
  }

  get homePageHeaderRegion(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.HeaderRegion);
  }

  get homePagePlansSection(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.PlansSection);
  }

  get homePageAppsSection(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.AppsSection);
  }

  get homePageLearningSection(): Locator {
    return this.loc(PowerAppsPageSelectors.HomePage.LearningSection);
  }

  // ============ Error Page Locators ============
  get errorPageContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.ErrorPage.Container);
  }

  get errorPageTitle(): Locator {
    return this.loc(PowerAppsPageSelectors.ErrorPage.Title);
  }

  get errorPageMessage(): Locator {
    return this.loc(PowerAppsPageSelectors.ErrorPage.Message);
  }

  get errorPageHomeButton(): Locator {
    return this.loc(PowerAppsPageSelectors.ErrorPage.HomeButton);
  }

  // ============ Apps Page Locators ============
  get appsPageMainContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.MainContainer);
  }

  get appsPageContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.PageContainer);
  }

  get sidebar(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.Sidebar);
  }

  get commandBar(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.CommandBar);
  }

  get appsPageCommandBar(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.CommandBar);
  }

  get appListsGridContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.AppListsGridContainer);
  }

  get newAppButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.NewApp);
  }

  get allAppsButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.AllApps);
  }

  get canvasAppButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.CanvasApp);
  }

  get modelAppButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.ModelApp);
  }

  get editAppButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.EditApp);
  }

  get deleteAppButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.DeleteApp);
  }

  get appListGrid(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.AppListsGridContainer);
  }

  get contextualMenu(): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.ContextualMenu);
  }

  /**
   * Get app by name using a link locator
   */
  getAppByName(appName: string): Locator {
    return this.page.getByRole('link', { name: appName, exact: true });
  }

  /**
   * Get app row container by name
   */
  getAppRowByName(appName: string): Locator {
    return this.loc(PowerAppsPageSelectors.AppsPage.AppNameContainerSelector)
      .filter({
        hasText: appName,
      })
      .first();
  }

  // ============ Solutions Page Locators ============
  get solutionsSidebar(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.SideBar);
  }

  get solutionsCommandBar(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.CommandBar);
  }

  get solutionsSearchBox(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.SearchTextBox);
  }

  get solutionsListContainer(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.SolutionsListContainer);
  }

  get componentTypesList(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.ComponentTypesList);
  }

  get solutionsComponentTypesList(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.ComponentTypesList);
  }

  get defaultSolutionGrid(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.DefaultSolutionContainerGrid);
  }

  get solutionPreviewToggle(): Locator {
    return this.loc(PowerAppsPageSelectors.SolutionsPage.SolutionPreviewButton);
  }

  getSolutionByName(solutionName: string): Locator {
    return this.page.getByTestId(solutionName);
  }

  getSitemapById(sitemapId: string): Locator {
    return this.loc(
      LocatorUtils.formatSelector(PowerAppsPageSelectors.SolutionsPage.SiteMapSelector, sitemapId)
    );
  }

  // ============ App Preview Page Locators ============
  get canvasAndPanes(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.CanvasAndPanes);
  }

  get canvasPlaceholderNewPage(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.CanvasPlaceholderNewPage);
  }

  get previewPlaceholder(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.PreviewPlaceholder);
  }

  get saveButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.SaveButton);
  }

  get publishButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.PublishButton);
  }

  get playButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.PlayButton);
  }

  get closeButton(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.CloseButton);
  }

  get canvasAppManagementPage(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.CanvasAppManagementPage);
  }

  get backstageRootComponent(): Locator {
    return this.loc(PowerAppsPageSelectors.AppPreviewPage.CanvasAppBackStageRootComponent);
  }

  // ============ Model App Page Locators ============
  get applicationShell(): Locator {
    return this.loc(PowerAppsPageSelectors.ModelAppPage.ApplicationShell);
  }

  get appTitle(): Locator {
    return this.loc(PowerAppsPageSelectors.ModelAppPage.AppTitle);
  }

  get globalCommandBar(): Locator {
    return this.loc(PowerAppsPageSelectors.ModelAppPage.GlobalCommandBar);
  }

  get mainContent(): Locator {
    return this.loc(PowerAppsPageSelectors.ModelAppPage.MainContent);
  }

  // ============ Teaching Bubble Locators ============
  get teachingBubble(): Locator {
    return this.loc(PowerAppsPageSelectors.TeachingBubble);
  }

  get teachingBubbleCloseButton(): Locator {
    return this.loc(PowerAppsPageSelectors.TeachingBubbleCloseButton);
  }

  get teachingBubblePrimaryButton(): Locator {
    return this.loc(PowerAppsPageSelectors.TeachingBubblePrimaryButton);
  }

  // ============ Dialog Locators ============
  get modalFocusTrapZone(): Locator {
    return this.loc(PowerAppsPageSelectors.ModalFocusTrapZone);
  }

  get dialogAcceptButton(): Locator {
    return this.loc(PowerAppsPageSelectors.DialogAcceptButton);
  }

  get dialogCancelButton(): Locator {
    return this.loc(PowerAppsPageSelectors.DialogCancelButton);
  }

  // ============ Canvas Designer Locators ============
  get canvasDesignerIframe(): Locator {
    return this.loc(PowerAppsPageSelectors.CanvasDesignerIframe);
  }

  get canvasPlayerIframe(): Locator {
    return this.loc(PowerAppsPageSelectors.CanvasPlayerIframe);
  }

  // ============ Authentication Locators ============
  get meInitialsButton(): Locator {
    return this.loc(PowerAppsPageSelectors.MeInitialsButton);
  }

  get signOutButton(): Locator {
    return this.loc(PowerAppsPageSelectors.SignOutButton);
  }

  get signOutLink(): Locator {
    return this.loc(PowerAppsPageSelectors.SignOutLink);
  }

  // ============ Search and Filter ============
  get searchTextBox(): Locator {
    return this.solutionsSearchBox;
  }
}
