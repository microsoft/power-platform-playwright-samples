// =============================================================================
// CodeAppPage — Page Object for Power Apps Code Apps (React + Vite + SDK).
// =============================================================================
//
// WHY THIS EXISTS:
// The Microsoft `power-platform-playwright-toolkit` ships Page Objects for
// classic Model-Driven Apps (`ModelDrivenAppPage`) and Canvas Apps
// (`CanvasAppPage`). Code Apps are a newer surface — they're React/Vite SPAs
// hosted inside apps.powerapps.com/play/e/<env>/app/<id> — and behave more
// like a vanilla SPA than either of those. We need our own PO.
//
// WHAT IT KNOWS:
// - The Code App is hosted at apps.powerapps.com/play/e/<env>/app/<id>.
// - It boots into an iframe inside Power Apps shell chrome. Our React app's
//   `#root` lives in the iframe. The Power Apps shell is the parent page.
// - CodeAppGate (in our app) awaits getContext() from @microsoft/power-apps/app
//   before rendering anything inside #root. So "ready" = #root has children
//   AND the sidebar is visible.
//
// WHAT IT EXPOSES:
// - `launch()` — navigate to CODE_APP_URL, wait for shell, switch into iframe.
// - `sidebar()` — interact with our vendored shadcn sidebar (click items).
// - `header()` — interact with breadcrumb / theme toggle / language switcher.
// - `mainScrollMetrics()` — measure body vs main heights (overflow diagnosis).
// - `screenshotFullPage()` — capture the rendered iframe.
//
// CONVENTIONS:
// - All locators that target Veltro Novo internals (sidebar nav items, header
//   buttons, etc.) are defined as data-testid where possible. If a feature
//   component doesn't have testids yet, we fall back to role/text.
// - Long URL waits use the CODE_APP_URL hash routing (#/locations, etc.).
// =============================================================================

import { Page, Frame, FrameLocator, Locator, expect } from '@playwright/test';

const CODE_APP_HOST = 'apps.powerapps.com';

export interface ScrollMetrics {
  /** document.documentElement.scrollHeight (iframe body) */
  documentScrollHeight: number;
  /** window.innerHeight inside the iframe */
  viewportHeight: number;
  /** main element scrollHeight */
  mainScrollHeight: number;
  /** main element clientHeight */
  mainClientHeight: number;
  /** True if document is scrollable (body scrollbar would show) */
  bodyScrolls: boolean;
  /** True if main is scrollable (internal scrollbar inside main) */
  mainScrolls: boolean;
}

export interface CodeAppLaunchOptions {
  /** Override CODE_APP_URL from .env. Useful for testing different apps. */
  url?: string;
  /** ms to wait for #root to hydrate. Default 30000. */
  bootTimeoutMs?: number;
}

/**
 * Page Object for the Veltro Novo Code App. One instance per test.
 */
export class CodeAppPage {
  constructor(private readonly page: Page) {}

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  /** Navigate to the Code App URL, wait for the shell + sidebar to hydrate. */
  async launch(opts: CodeAppLaunchOptions = {}): Promise<void> {
    const url = opts.url ?? process.env.CODE_APP_URL;
    if (!url) {
      throw new Error('CODE_APP_URL is required in .env or pass { url } to launch()');
    }

    await this.page.goto(url, { waitUntil: 'domcontentloaded' });

    // Power Apps shell renders the purple bar + iframe. Wait for the iframe.
    await this.page.waitForLoadState('networkidle', { timeout: opts.bootTimeoutMs ?? 30000 });

    // Wait until our React app inside the iframe is visible (sidebar shows).
    // Sidebar nav items have role="navigation" in our AppLayout.
    const sidebarNav = this.codeAppFrame().getByRole('navigation', { name: /main navigation/i });
    await expect(sidebarNav).toBeVisible({ timeout: opts.bootTimeoutMs ?? 30000 });
  }

  // ---------------------------------------------------------------------------
  // Iframe access
  // ---------------------------------------------------------------------------

  /**
   * The FrameLocator pointing at the Code App's iframe inside Power Apps shell.
   * Power Apps embeds the app via an iframe whose src starts with
   * apps.powerapps.com/play/.../iframe or similar; we match the broadest
   * stable predicate.
   */
  codeAppFrame(): FrameLocator {
    // Power Apps wraps Code Apps in an iframe. The iframe's name attribute
    // historically varies; we match the iframe whose URL contains 'apps.powerapps.com'.
    // If the host changes, update this selector.
    return this.page.frameLocator(`iframe[src*="${CODE_APP_HOST}"]`).first();
  }

  /** Raw Frame access for evaluations not expressible via locators. */
  codeAppFrameRaw(): Frame {
    const frame = this.page.frames().find((f) => f.url().includes(CODE_APP_HOST));
    if (!frame) {
      throw new Error(`Code App iframe not found. Frames: ${this.page.frames().map((f) => f.url()).join(', ')}`);
    }
    return frame;
  }

  // ---------------------------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------------------------

  /** Click a top-level sidebar nav item by visible label. */
  async clickSidebarNav(label: string): Promise<void> {
    const frame = this.codeAppFrame();
    const link = frame.getByRole('link', { name: new RegExp(`^${label}$`, 'i') }).first();
    await link.click();
  }

  /** Expand a collapsible sidebar group (e.g. "Inspections"). */
  async expandSidebarGroup(groupLabel: string): Promise<void> {
    const frame = this.codeAppFrame();
    const trigger = frame.getByRole('button', { name: new RegExp(groupLabel, 'i') }).first();
    if ((await trigger.getAttribute('data-state')) !== 'open') {
      await trigger.click();
    }
  }

  /** Returns all visible sidebar nav item labels (for assertion). */
  async sidebarNavLabels(): Promise<string[]> {
    const frame = this.codeAppFrame();
    const items = frame.getByRole('navigation', { name: /main navigation/i }).getByRole('link');
    return items.allTextContents();
  }

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------

  /** Toggle the theme (light ↔ dark). */
  async toggleTheme(): Promise<void> {
    const frame = this.codeAppFrame();
    await frame.getByRole('button', { name: /toggle theme/i }).click();
  }

  /** Toggle EN ↔ DA. */
  async toggleLanguage(): Promise<void> {
    const frame = this.codeAppFrame();
    await frame.getByRole('button', { name: /switch language/i }).click();
  }

  /** Returns the current theme as reported by next-themes (`light` | `dark` | `system`). */
  async currentTheme(): Promise<string> {
    // next-themes writes `class="dark"` (or removes it) on <html>.
    return this.codeAppFrameRaw().evaluate(() => {
      const html = document.documentElement;
      if (html.classList.contains('dark')) return 'dark';
      if (html.classList.contains('light')) return 'light';
      return 'system';
    });
  }

  // ---------------------------------------------------------------------------
  // Overflow / layout diagnostics
  // ---------------------------------------------------------------------------

  /**
   * Measure scroll heights to diagnose layout overflow (the bug we caught in
   * Veltro Novo PR #27). If `bodyScrolls === true` on an empty page, the
   * SidebarProvider is claiming more height than #root.
   */
  async measureScrolls(): Promise<ScrollMetrics> {
    return this.codeAppFrameRaw().evaluate(() => {
      const doc = document.documentElement;
      const main = document.querySelector('main') as HTMLElement | null;
      return {
        documentScrollHeight: doc.scrollHeight,
        viewportHeight: window.innerHeight,
        mainScrollHeight: main?.scrollHeight ?? 0,
        mainClientHeight: main?.clientHeight ?? 0,
        bodyScrolls: doc.scrollHeight > window.innerHeight,
        mainScrolls: !!main && main.scrollHeight > main.clientHeight,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Identity
  // ---------------------------------------------------------------------------

  /**
   * Read the user identity shown in the sidebar footer. Returns null if
   * the sidebar footer hasn't rendered identity yet (Phase 0 quirk).
   */
  async readIdentityFromFooter(): Promise<{ fullName?: string; upn?: string } | null> {
    try {
      const frame = this.codeAppFrame();
      const footer = frame.locator('[data-slot="sidebar-footer"]').first();
      const text = await footer.textContent({ timeout: 2000 });
      if (!text) return null;
      // The Sidebar.tsx writes fullName then UPN on separate lines.
      const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      return { fullName: lines[0], upn: lines[1] };
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation by hash
  // ---------------------------------------------------------------------------

  /** Navigate to a hash route in the Code App (#/locations, #/tasks, etc.). */
  async goToHash(hash: string): Promise<void> {
    const frame = this.codeAppFrameRaw();
    await frame.evaluate((h) => {
      window.location.hash = h.startsWith('#') ? h : `#${h}`;
    }, hash);
    // Allow React Router to render
    await this.page.waitForTimeout(500);
  }

  /** Returns the current hash route inside the Code App iframe. */
  async currentHash(): Promise<string> {
    return this.codeAppFrameRaw().evaluate(() => window.location.hash);
  }

  // ---------------------------------------------------------------------------
  // Screenshots
  // ---------------------------------------------------------------------------

  /**
   * Take a full-page screenshot of the Power Apps shell (which contains the
   * Code App iframe). Better than `page.screenshot({ fullPage: true })`
   * because it captures the iframe contents reliably.
   */
  async screenshotFullPage(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }
}
