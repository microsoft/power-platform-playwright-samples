# CodeAppPage — Page Object for Power Apps Code Apps

**Lives at:** `packages/e2e-tests/pages/CodeAppPage.ts`
**Used by:** every test under `tests/veltro-novo/`

This is the Page Object Microsoft's `power-platform-playwright-toolkit` doesn't ship. Code Apps are a newer surface than MDAs (`ModelDrivenAppPage`) or classic Canvas (`CanvasAppPage`) and behave differently enough to warrant their own abstraction.

---

## 1. Anatomy of a Code App page

When you `goto(CODE_APP_URL)`:

```
┌─ apps.powerapps.com (outer page) ──────────────────────────────┐
│  ┌─ Power Apps shell (purple bar, share button, etc.) ──────┐  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌─ <iframe src="https://apps.powerapps.com/play/..."> ────┐  │
│  │  ┌─ #root (React DOM mount point) ─────────────────────┐ │  │
│  │  │  <CodeAppGate>                                      │ │  │
│  │  │    awaits getContext() from @microsoft/power-apps   │ │  │
│  │  │    then renders:                                     │ │  │
│  │  │  <Providers>                                         │ │  │
│  │  │    <RouterProvider>                                  │ │  │
│  │  │      <AppLayout>                                     │ │  │
│  │  │        <Sidebar/> <Header/> <main><Outlet/></main>   │ │  │
│  │  │      </AppLayout>                                    │ │  │
│  │  │    </RouterProvider>                                 │ │  │
│  │  │  </Providers>                                        │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

Two big consequences for testing:

1. **Everything our app renders lives in an iframe.** Default Playwright locators (`page.getByRole(...)`) target the outer page — they won't find your sidebar. You must use a `FrameLocator`.
2. **`window.location.hash` inside the iframe is what React Router reads.** Setting it on the outer page does nothing. `CodeAppPage.goToHash()` handles this.

---

## 2. Lifecycle

### `launch(opts?)`

```ts
const app = new CodeAppPage(page);
await app.launch();
// Optionally: await app.launch({ url: 'https://...override...' });
// Optionally: await app.launch({ bootTimeoutMs: 60000 });
```

What it does:
1. `page.goto(CODE_APP_URL)` (defaulted from `.env`).
2. Waits for `networkidle` (Power Apps shell finishes loading).
3. Waits for `getByRole('navigation', { name: /main navigation/i })` inside the iframe to be visible — that's our `<SidebarContent role="navigation" aria-label="Main navigation">`.

If the sidebar never shows up:
- `MS_AUTH_EMAIL` is wrong → tests see the login page instead of the app.
- Storage state expired → run `auth-veltro.ps1` again.
- The Code App actually crashed → check the iframe's console via DevTools.

### `codeAppFrame()` and `codeAppFrameRaw()`

```ts
const frame = app.codeAppFrame();          // FrameLocator — chainable, lazy
const rawFrame = app.codeAppFrameRaw();    // Frame — for evaluate()
```

Use `codeAppFrame()` for everything visual (clicks, assertions). Use `codeAppFrameRaw()` only when you need to run JS in the iframe (`evaluate()`).

---

## 3. Sidebar interactions

```ts
await app.clickSidebarNav('Locations');     // navigate to a top-level item
await app.expandSidebarGroup('Inspections'); // open a collapsible group
const labels = await app.sidebarNavLabels(); // returns all visible labels
```

Sidebar groups in Veltro Novo (Phase 0):
- **Overview** — Dashboard
- **Assets & Facilities** — Locations, Assets
- **Work Management** — Tasks
- **Safety & Compliance** — Incidents
- **Inspections** — Templates, Inspections, Actions, Schedules, Reports
- **Administration** — Users, Teams, Settings

Single-item groups (Overview, Work Management, Safety & Compliance) don't have a clickable trigger — items are always visible. Multi-item groups are `<Collapsible>` and need `expandSidebarGroup()` first if collapsed.

---

## 4. Header interactions

```ts
await app.toggleTheme();        // light ↔ dark
await app.toggleLanguage();     // en ↔ da
const theme = await app.currentTheme();  // 'light' | 'dark' | 'system'
```

The theme is read from `<html class="dark">` etc. (next-themes convention).

---

## 5. Overflow diagnostics

This is what catches regressions like Veltro Novo PR #27:

```ts
const m = await app.measureScrolls();
// m.documentScrollHeight  — iframe body scroll height
// m.viewportHeight        — window.innerHeight inside iframe
// m.mainScrollHeight      — <main> scroll height
// m.mainClientHeight      — <main> visible height
// m.bodyScrolls           — true if body would show a scrollbar
// m.mainScrolls           — true if main has its own scrollbar
```

Assertion pattern for empty pages:

```ts
const m = await app.measureScrolls();
expect(m.bodyScrolls).toBe(false);
```

For long pages (Tasks with 906 rows):

```ts
expect(m.bodyScrolls).toBe(false);
expect(m.mainScrolls).toBe(true);
```

---

## 6. Hash routing

```ts
await app.goToHash('/locations');           // navigate
const hash = await app.currentHash();       // '#/locations'
```

React Router (HashRouter) listens to `hashchange` events on `window`. Setting `window.location.hash` inside the iframe triggers it. Outside the iframe → no-op.

---

## 7. Identity

```ts
const identity = await app.readIdentityFromFooter();
// { fullName: 'Veltro E2E Bot', upn: 'e2e-veltro@powerfoxbi.com' } | null
```

Pulls from `Sidebar.tsx`'s footer block (data-slot="sidebar-footer"). Returns null on Phase 0 if the footer hasn't rendered identity yet (some race conditions). For assertion of "the right user is logged in," combine with `useIdentity()` exposed via `evaluate()`:

```ts
const fromHook = await app.codeAppFrameRaw().evaluate(() => {
  // Future: expose useIdentity result on window for testability.
  return null;
});
```

For Phase 1+, suggest adding `window.__veltro__ = { identity }` somewhere in dev builds so we can read it directly. That's an open issue.

---

## 8. Screenshots

```ts
await app.screenshotFullPage('./test-results/dashboard.png');
```

`page.screenshot({ fullPage: true })` works against the outer Power Apps shell. The iframe's contents render inside it normally. If you need just the iframe (no Power Apps chrome), use `app.codeAppFrameRaw().locator('body').screenshot(...)` — but for most cases, full page is what you want.

---

## 9. Extending CodeAppPage

When you add a feature test (Phase 2+), don't put feature-specific selectors in CodeAppPage. Create a sub-Page-Object:

```ts
// pages/LocationsPage.ts
import { CodeAppPage } from './CodeAppPage';

export class LocationsPage {
  constructor(private app: CodeAppPage) {}

  async open() {
    await this.app.clickSidebarNav('Locations');
    // Wait for the data table to hydrate
    const frame = this.app.codeAppFrame();
    await frame.getByRole('table').waitFor();
  }

  async createLocation(input: { name: string; code: string; type: string }) {
    const frame = this.app.codeAppFrame();
    await frame.getByRole('button', { name: /new location/i }).click();
    await frame.getByLabel('Name').fill(input.name);
    await frame.getByLabel('Code').fill(input.code);
    await frame.getByLabel('Type').click();
    await frame.getByRole('option', { name: input.type }).click();
    await frame.getByRole('button', { name: /save/i }).click();
  }

  async getRowCount(): Promise<number> {
    const frame = this.app.codeAppFrame();
    const rows = frame.getByRole('row');
    return (await rows.all()).length - 1;  // subtract header
  }
}

// Usage:
const app = new CodeAppPage(page);
await app.launch();
const locations = new LocationsPage(app);
await locations.open();
await locations.createLocation({ name: 'X', code: 'X', type: 'Site' });
```

This composition pattern keeps `CodeAppPage` focused on shell concerns (launch, sidebar, header, routing) and leaves feature-specific selectors with their feature.

---

## 10. Selectors — what's stable, what isn't

Tested for stability against Veltro Novo Phase 0 commit `67921fc`:

| Selector | Stability | Notes |
|---|---|---|
| `getByRole('navigation', { name: /main navigation/i })` | ✅ Stable | Hard-coded in `Sidebar.tsx` `aria-label="Main navigation"` |
| `getByRole('link', { name: 'Locations' })` | ✅ Stable | `<NavLink to="/locations">` renders as `<a>` with the text |
| `getByRole('button', { name: /toggle theme/i })` | ✅ Stable | `aria-label={t("theme.toggle", "Toggle theme")}` in Header.tsx |
| `getByRole('button', { name: /switch language/i })` | ✅ Stable | `aria-label="Switch language"` in LanguageSwitcher.tsx |
| `[data-slot="sidebar-footer"]` | ⚠️ Library-stable | Set by shadcn sidebar primitive; would break if we swap sidebar libraries |
| `iframe[src*="apps.powerapps.com"]` | ⚠️ Host-stable | If Microsoft renames the host or changes iframe structure, breaks |
| Anything matched by visible text | ⚠️ i18n-fragile | Today EN-only; once Yeriel adds DA strings, multi-locale tests should use i18n keys not literals |

For Phase 1+, the recommendation is:
1. Add `data-testid` attributes to interactive elements (forms, buttons, table rows).
2. Match by testid before falling back to role/text.
3. Reserve role/text for assertions ("the text matches what i18n returns") rather than navigation.

---

## 11. Known gaps / TODOs

- `readIdentityFromFooter()` is fragile — relies on sidebar text layout. Better: expose `window.__veltro__.identity` in dev builds.
- No helper for opening dialogs / modals yet — Phase 2 will add `openDialog(name)`.
- No screenshot baselining yet — `expect(page).toHaveScreenshot()` would catch visual regressions across PRs.
- No "wait for data table to finish loading" helper — needs to be smart about isLoading states.
- No CRUD helpers via Dataverse API. Yeriel cancelled the SP-based seeding. If a test needs to assert "this row exists in Dataverse after the UI flow," we'd have to either re-query through the UI or use the user's session cookies to hit the Web API (possible but adds complexity).

---

## 12. Quick reference

| Need | Use |
|---|---|
| Open the app | `await new CodeAppPage(page).launch()` |
| Click sidebar | `await app.clickSidebarNav('Locations')` |
| Expand group | `await app.expandSidebarGroup('Inspections')` |
| Toggle theme | `await app.toggleTheme()` |
| Toggle language | `await app.toggleLanguage()` |
| Measure overflow | `await app.measureScrolls()` |
| Set hash | `await app.goToHash('/tasks')` |
| Read hash | `await app.currentHash()` |
| Screenshot | `await app.screenshotFullPage('./out.png')` |
| Eval inside iframe | `await app.codeAppFrameRaw().evaluate(() => …)` |
