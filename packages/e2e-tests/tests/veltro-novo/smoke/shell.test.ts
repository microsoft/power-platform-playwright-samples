// =============================================================================
// Veltro Novo Code App — shell smoke test
// =============================================================================
//
// Read-only checks on the AppLayout shell. Touches no data. Catches:
//   - Sidebar didn't hydrate (CodeAppGate stuck on Loading)
//   - Sidebar nav missing groups (NAV_GROUPS broken)
//   - Body scrollbar regression (the bug fixed in veltro-novo PR #27)
//   - Theme toggle no-op
//   - Hash routes not navigating
//
// Run:
//   .\run-tests.ps1 shell
// =============================================================================

import { test, expect } from '@playwright/test';
import { CodeAppPage } from '../../../pages/CodeAppPage';

test.describe('Veltro Novo Code App — shell smoke', () => {
  test('boots through CodeAppGate and shows the sidebar', async ({ page }) => {
    const app = new CodeAppPage(page);
    await app.launch();

    const labels = await app.sidebarNavLabels();
    // Phase 0 NAV_GROUPS: at minimum Dashboard, Locations, Assets, Tasks,
    // Incidents, Templates, Inspections, Actions, Schedules, Reports,
    // Users, Teams, Settings.
    expect(labels.length).toBeGreaterThanOrEqual(8);
    expect(labels.some((l) => /dashboard/i.test(l))).toBeTruthy();
    expect(labels.some((l) => /locations/i.test(l))).toBeTruthy();
  });

  test('does NOT produce a body scrollbar on the empty Dashboard', async ({ page }) => {
    // This is the regression test for veltro-novo PR #27. The fix was to
    // override shadcn SidebarProvider's min-h-svh with !min-h-0 h-full so the
    // iframe body doesn't claim more height than #root.
    const app = new CodeAppPage(page);
    await app.launch();
    await app.goToHash('/');

    const metrics = await app.measureScrolls();
    expect(metrics.bodyScrolls).toBe(false);
    // main can scroll internally if its content overflows — that's fine.
  });

  test('theme toggle flips the <html> class', async ({ page }) => {
    const app = new CodeAppPage(page);
    await app.launch();

    const before = await app.currentTheme();
    await app.toggleTheme();
    const after = await app.currentTheme();
    expect(after).not.toBe(before);
  });

  test('language switcher persists choice to localStorage', async ({ page }) => {
    const app = new CodeAppPage(page);
    await app.launch();

    // Toggle once (en → da).
    await app.toggleLanguage();
    const stored = await app.codeAppFrameRaw().evaluate(() => {
      return localStorage.getItem('i18n_language');
    });
    expect(stored).toMatch(/^(en|da)$/);
  });

  test('legacy hash routes still navigate', async ({ page }) => {
    const app = new CodeAppPage(page);
    await app.launch();

    for (const hash of ['/locations', '/tasks', '/templates', '/inspections']) {
      await app.goToHash(hash);
      expect(await app.currentHash()).toBe(`#${hash}`);
    }
  });
});
