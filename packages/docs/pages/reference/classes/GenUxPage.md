[**Power Platform Playwright Toolkit v0.0.4**](../README.md)

***

[Power Platform Playwright Toolkit](../README.md) / GenUxPage

# Class: GenUxPage

Defined in: components/gen-ux/gen-ux.page.ts:49

Page object for the Power Apps Maker Portal GenUX AI designer.

Handles two workflows:
- **App Generation**: submit prompts to the GenUX AI, verify generation progress
- **Inspection**: read Preview tab DOM and Code tab content for test generation

## Example

```typescript
const appProvider = new AppProvider(page, context);
await appProvider.launch({
  app: 'Power Apps Maker',
  type: AppType.ModelDriven,
  mode: AppLaunchMode.Edit,
  baseUrl: process.env.MAKER_PORTAL_URL,
});
const genUxPage = appProvider.getGenUxPage();
```

## Constructors

### Constructor

> **new GenUxPage**(`page`): `GenUxPage`

Defined in: components/gen-ux/gen-ux.page.ts:50

#### Parameters

##### page

`Page`

#### Returns

`GenUxPage`

## Accessors

### previewFrame

#### Get Signature

> **get** **previewFrame**(): `FrameLocator`

Defined in: components/gen-ux/gen-ux.page.ts:79

Public accessor for the UCI Preview frame locator.
Use this to search for generated form elements inside the designer canvas.

##### Example

```typescript
const input = await findFormInput(genUxPage.previewFrame, 'firstName');
```

##### Returns

`FrameLocator`

## Methods

### goToAppsPage()

> **goToAppsPage**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:95

Navigate to the Apps page for the current environment.

Prefers direct URL navigation using `POWER_APPS_ENVIRONMENT_ID` — this avoids
strict-mode violations from ambiguous sidebar link matching when multiple
elements share the accessible name "Apps".

Falls back to clicking the sidebar link (with `exact: true`) when no
environment ID is configured.

#### Returns

`Promise`\<`void`\>

***

### navigateToStartWithPageDesign()

> **navigateToStartWithPageDesign**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:125

Click "+ New app" → "Model-driven app" → "Blank page with navigation"
to start the GenUX designer.

The command-bar button renders as "+ New app" (icon + text + dropdown chevron),
so a regex match is used to avoid strict exact-name failures.

Uses `getByRole('button', { name: /new app/i })` for the trigger,
`getByRole('menuitem')` for the dropdown item,
`getByRole('heading')` to confirm page load,
and `getByText()` to click the template card.

#### Returns

`Promise`\<`void`\>

***

### createAppWithName()

> **createAppWithName**(`appName`): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:152

Fill in the app name and click Create in the app creation dialog.

Uses `getByLabel()` for the name input (best for accessible form fields)
and `getByRole('button')` for the Create button.

#### Parameters

##### appName

`string`

Display name for the new app (use a timestamp suffix to avoid collisions)

#### Returns

`Promise`\<`void`\>

***

### addNewPage()

> **addNewPage**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:168

Click "Add new page" then select "Describe a page" to open the GenUX prompt panel.

Uses `getByRole('button')` for "Describe a page". The add-page placeholder
has no semantic role so falls back to `locator()` with its stable ID.

#### Returns

`Promise`\<`void`\>

***

### waitForUCIPreviewFrameAndFillPrompt()

> **waitForUCIPreviewFrameAndFillPrompt**(`prompt`): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:192

Wait for the UCI Preview iframe, fill the AI prompt text box, then click Generate/Send.

Uses `getByRole('textbox')` for the prompt input.
Uses `getByTestId()` for generate/send — icon buttons without stable labels.

A 4-second delay is applied before clicking to work around a network error caused
by clicking too quickly after filling the prompt.
See: https://msazure.visualstudio.com/OneAgile/_workitems/edit/34618242

#### Parameters

##### prompt

`string`

The AI generation prompt string to submit

#### Returns

`Promise`\<`void`\>

***

### waitForUCIPreviewFrameAndSelectTemplate()

> **waitForUCIPreviewFrameAndSelectTemplate**(`templateText`): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:222

Select a template suggestion pill in the UCI Preview frame and click Generate.

Uses `getByTestId()` for the carousel cards (structured component without role)
and `.filter({ hasText })` to pick the specific template.

The same 4-second delay as `waitForUCIPreviewFrameAndFillPrompt` applies.

#### Parameters

##### templateText

`string`

Partial or full text of the template carousel card to click

#### Returns

`Promise`\<`void`\>

***

### verifyThoughtStreaming()

> **verifyThoughtStreaming**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:253

Verify the GenUX AI "thought streaming" indicators are visible.

Checks for transient streaming UI: confirmation message, latency loader,
Stop button, and adaptive card headings. These elements are short-lived —
generation may complete before all of them appear. Each check is therefore
best-effort: the method logs a warning rather than throwing when a
transient element is already gone.

The only hard assertion is that either the streaming indicators OR the
completion message ("Your page is now generated") is visible, which
ensures we do not proceed if generation never started.

Uses `getByText()` for text content assertions and `getByRole('button')`
for the interactive Stop button.

#### Returns

`Promise`\<`void`\>

***

### verifyCodeAndPreviewTabsAvailable()

> **verifyCodeAndPreviewTabsAvailable**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:285

Verify that both the Code and Preview tabs are visible in the UCI Preview frame.
These tabs appear after the GenUX AI finishes planning the page structure.

Uses `getByRole('tab')` — tabs have an explicit ARIA tab role.

#### Returns

`Promise`\<`void`\>

***

### verifyCodeStreaming()

> **verifyCodeStreaming**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:304

Verify the full code streaming lifecycle:
1. "Your page is being generated" visible (Code tab auto-selected)
2. Attachment and Send buttons disabled during generation
3. "Your page is now generated" visible (Preview tab auto-selected)

Uses `getByText()` for status messages, `getByRole('tab')` for tab state,
and `getByTestId()` for icon-only action buttons.

Generation can take up to 2 minutes — this method waits accordingly.

#### Returns

`Promise`\<`void`\>

***

### clickPreviewTab()

> **clickPreviewTab**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:321

Click the Preview tab in the UCI Preview frame.
Uses `getByRole('tab')`.

#### Returns

`Promise`\<`void`\>

***

### clickCodeTab()

> **clickCodeTab**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:332

Click the Code tab in the UCI Preview frame.
Uses `getByRole('tab')`.

#### Returns

`Promise`\<`void`\>

***

### waitForGeneratedContent()

> **waitForGeneratedContent**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:350

Wait for the generated preview content to be visible.

After the AI generation completes and the Preview tab is selected, the generated
form/page renders directly in the main canvas area (the right panel of the designer),
NOT inside the UCI Preview frame. Look for any visible form input in the canvas as a
reliable readiness signal — a generated form always has at least one textbox or input.

Falls back to a `waitForLoadState` + small pause if no inputs are found within the
timeout, so the test can still proceed and let subsequent assertions catch failures.

#### Returns

`Promise`\<`void`\>

***

### waitForCodeTabContent()

> **waitForCodeTabContent**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:371

Wait for Code tab content (Monaco editor or equivalent) to be visible.

Monaco editor has no accessible role or label, so `locator()` with its
class name is the only stable approach.

#### Returns

`Promise`\<`void`\>

***

### getPreviewTabDom()

> **getPreviewTabDom**(): `Promise`\<`string`\>

Defined in: components/gen-ux/gen-ux.page.ts:388

Return the serialized outer HTML of the UCI Preview iframe body.

Use this during test generation to discover exact selectors (`data-control-name`,
`aria-label`, `role`) without guessing.

#### Returns

`Promise`\<`string`\>

Raw HTML string from the preview frame body

***

### getCodeTabContent()

> **getCodeTabContent**(): `Promise`\<`string`\>

Defined in: components/gen-ux/gen-ux.page.ts:400

Return the text content of the Code tab (Power Fx / YAML source).

Use this to discover control names, Power Fx formulas, screen structure,
collections, and data sources.

#### Returns

`Promise`\<`string`\>

Raw code text from the editor

***

### publishApp()

> **publishApp**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:426

Publish the current app in the GenUX designer.

Clicks the "Publish" button in the top command bar of the Maker Portal
app designer. After generation, the app must be published before it can
be played via the Apps list or a direct play URL.

Waits for either a success toast ("Published successfully", "App published")
or a confirmation that the designer returned to its idle state.

Uses `getByRole('button', { name: /publish/i })` — the Publish button has a
visible label in all Maker Portal locales.

#### Returns

`Promise`\<`void`\>

#### Throws

If the Publish button is not found or the success indicator does not appear

***

### buildCanvasPlayUrl()

> **buildCanvasPlayUrl**(): `string`

Defined in: components/gen-ux/gen-ux.page.ts:483

Build the Canvas App player URL for the currently open app in the designer.

Extracts the app ID from the current URL and combines it with environment
configuration to produce a playable URL.

#### Returns

`string`

Canvas App play URL string

***

### submitForm()

> **submitForm**(): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:517

Click the Submit/Save button in the generated preview form.

GenUX forms render a primary action button (commonly "Submit" or "Save")
that triggers the Power Fx `Patch()` call to persist the record.

Strategy (tries in order):
  1. `getByRole('button', { name: /submit/i })` — most common generated label
  2. `getByRole('button', { name: /save/i })`   — alternative label
  3. `getByTestId('submit-button')`              — data-testid fallback

Searches inside the UCI Preview iframe where the generated form is rendered.

#### Returns

`Promise`\<`void`\>

#### Throws

If no submit/save button is found within the default timeout

***

### waitForSubmitSuccess()

> **waitForSubmitSuccess**(`timeout`): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:544

Wait for any success indicator after form submission and log the message text.

AI-generated forms use `Notify()` with unpredictable text
(e.g. "Form submitted!", "Contact saved!", "Record created successfully!").
This method matches any notification that looks like success rather than
hard-coding a specific string, then logs what it found.

Searches only inside the UCI Preview iframe — Power Fx `Notify()` banners
render in the Canvas App canvas, not on the outer Maker Portal page.

#### Parameters

##### timeout

`number` = `30_000`

How long to wait in ms (default: 30 s)

#### Returns

`Promise`\<`void`\>

#### Throws

If no success indicator is found within the timeout

***

### getAppIdFromUrl()

> **getAppIdFromUrl**(): `string`

Defined in: components/gen-ux/gen-ux.page.ts:568

Extract the app ID (GUID) from the current Maker Portal URL.

Maker portal canvas editor URLs follow the pattern:
`.../environments/{envId}/canvas/{appId}?...`

Skips the environment ID GUID so only the app ID is returned.
Also logs the ID to the console for easy reference during test runs.

#### Returns

`string`

App ID as a lowercase GUID string

#### Throws

If no app ID GUID is found in the current URL

***

### searchAndPlayApp()

> **searchAndPlayApp**(`appName`, `context`): `Promise`\<`Page` \| `null`\>

Defined in: components/gen-ux/gen-ux.page.ts:590

Search for an app by name in the Apps list and play it.

Returns `null` (and logs a warning) when the Play menuitem is disabled —
this happens when the app has not been published yet. Callers should use
`test.skip()` when `null` is returned rather than failing the test.

#### Parameters

##### appName

`string`

Exact display name of the app to find and play

##### context

`BrowserContext`

BrowserContext used to capture the new tab opened by Play

#### Returns

`Promise`\<`Page` \| `null`\>

The new Page where the app is playing, or `null` if Play is disabled

***

### deleteAppsMatchingPrefix()

> **deleteAppsMatchingPrefix**(`prefix`): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:669

Delete all apps whose display names start with the given prefix.

Searches the Apps list for matching rows, then deletes them one by one.
Re-queries after each deletion because the list re-renders.
Safe to call when no matching apps exist — logs "0 apps found" and returns.

Uses `getByRole('searchbox')` to filter, `getByRole('row')` to locate rows,
`getByRole('button', { name: 'Commands' })` for the context menu,
`getByRole('menuitem', { name: 'Delete' })` and `getByRole('dialog')` for confirm.

#### Parameters

##### prefix

`string`

Display name prefix to match (e.g. "GenUX BasicForm")

#### Returns

`Promise`\<`void`\>

***

### deleteAppFromAppListIfFound()

> **deleteAppFromAppListIfFound**(`appName`): `Promise`\<`void`\>

Defined in: components/gen-ux/gen-ux.page.ts:751

Delete an app from the Maker Portal app list if it exists.
Safe to call even if the app was never created — silently skips if not found.

Uses `getByRole('row')` to locate the app row, `getByRole('button')` for the
Commands trigger, `getByRole('menu') → menuitem` for Delete,
`getByRole('dialog') → button` for the confirm dialog,
and `getByText()` to verify the success toast.

#### Parameters

##### appName

`string`

Exact display name of the app to delete

#### Returns

`Promise`\<`void`\>
