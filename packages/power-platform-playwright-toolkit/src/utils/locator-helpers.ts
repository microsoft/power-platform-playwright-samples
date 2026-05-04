// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Locator Helper Utilities
 * Utilities for finding elements with Playwright built-in locators, with CSS-selector fallbacks.
 */

import { Page, Locator, FrameLocator } from '@playwright/test';

/** Union of Page and FrameLocator — both support the full getBy* API. */
type LocatorContext = Page | FrameLocator;

/** Extract Playwright's AriaRole type without importing it separately. */
type AriaRole = Parameters<Page['getByRole']>[0];

/**
 * Discriminated union describing a single locator attempt.
 *
 * Put built-in specs first in the array passed to {@link findLocator} so that stable,
 * semantically-meaningful selectors are tried before internal CSS attributes.
 *
 * @example
 * ```typescript
 * // Prefer ARIA role → label → CSS fallback
 * const btn = await findLocator(page, [
 *   { by: 'role', role: 'button', name: 'Save' },
 *   { by: 'label', name: 'Save' },
 *   { by: 'css',   selector: 'button[aria-label="Save"]' },
 * ]);
 * ```
 */
export type LocatorSpec =
  | { by: 'role'; role: AriaRole; name?: string | RegExp; exact?: boolean }
  | { by: 'label'; name: string | RegExp; exact?: boolean }
  | { by: 'text'; text: string | RegExp; exact?: boolean }
  | { by: 'title'; title: string | RegExp; exact?: boolean }
  | { by: 'placeholder'; placeholder: string | RegExp; exact?: boolean }
  | { by: 'testId'; testId: string | RegExp }
  | { by: 'css'; selector: string };

/**
 * Find a visible element by trying each {@link LocatorSpec} in order.
 *
 * **Prefer built-in locator specs first** (`role`, `label`, `text`, `title`,
 * `placeholder`, `testId`) — they are resilient to DOM restructuring and align with
 * WCAG semantics. Add `css` specs at the end as a last-resort fallback for elements
 * that lack stable ARIA attributes.
 *
 * Works with both {@link Page} and {@link FrameLocator} so it can be used inside
 * cross-origin Canvas-player iframes.
 *
 * @param context  - `Page` or `FrameLocator` to search within.
 * @param specs    - Ordered array of locator specs to try. Built-in specs should come first.
 * @param opts     - `timeout` per probe in ms (default 1 000); does NOT set overall timeout.
 * @returns The first spec that resolves to a visible element.
 * @throws Error listing all attempted specs when none match.
 *
 * @example
 * ```typescript
 * // Inside a Canvas frame, prefer built-in then fall back to data-control-name
 * const frame = canvasApp.getCanvasFrame();
 * const saveBtn = await findLocator(frame, [
 *   { by: 'role', role: 'button', name: 'Save record' },
 *   { by: 'label', name: 'Save record' },
 *   { by: 'css',  selector: '[data-control-name="SaveBtn"] [role="button"]' },
 * ]);
 * await saveBtn.click();
 * ```
 */
export async function findLocator(
  context: LocatorContext,
  specs: LocatorSpec[],
  opts: { timeout?: number } = {}
): Promise<Locator> {
  let lastError: Error | undefined;
  const probeTimeout = opts.timeout ?? 1_000;

  for (const spec of specs) {
    try {
      let locator: Locator;
      switch (spec.by) {
        case 'role':
          locator = context.getByRole(spec.role, { name: spec.name, exact: spec.exact });
          break;
        case 'label':
          locator = context.getByLabel(spec.name, { exact: spec.exact });
          break;
        case 'text':
          locator = context.getByText(spec.text, { exact: spec.exact });
          break;
        case 'title':
          locator = context.getByTitle(spec.title, { exact: spec.exact });
          break;
        case 'placeholder':
          locator = context.getByPlaceholder(spec.placeholder, { exact: spec.exact });
          break;
        case 'testId':
          locator = context.getByTestId(spec.testId);
          break;
        case 'css':
          locator = context.locator(spec.selector);
          break;
      }
      await locator.waitFor({ state: 'visible', timeout: probeTimeout });
      return locator;
    } catch (err) {
      lastError = err as Error;
    }
  }

  const descriptions = specs.map((s) => {
    switch (s.by) {
      case 'role':
        return `role="${s.role}"${s.name ? ` name="${s.name}"` : ''}`;
      case 'label':
        return `label="${s.name}"`;
      case 'text':
        return `text="${s.text}"`;
      case 'title':
        return `title="${s.title}"`;
      case 'placeholder':
        return `placeholder="${s.placeholder}"`;
      case 'testId':
        return `testId="${s.testId}"`;
      case 'css':
        return `css: ${s.selector}`;
    }
  });

  throw new Error(
    `findLocator: all ${specs.length} spec(s) failed:\n` +
      descriptions.map((d) => `  • ${d}`).join('\n') +
      `\nLast error: ${lastError?.message ?? 'Unknown'}`
  );
}

/**
 * Find an element using multiple fallback CSS selectors.
 * Tries each selector in order until one is found visible.
 *
 * @deprecated Prefer {@link findLocator} with built-in specs (`role`, `label`, etc.)
 * first and `css` specs as fallbacks. `findWithFallback` accepts only CSS strings and
 * cannot express ARIA-based queries.
 *
 * @param page      - Playwright page.
 * @param selectors - CSS selector strings to try in order.
 * @param opts      - `timeout` per probe in ms (default 1 000).
 *
 * @example
 * ```typescript
 * // Prefer: use findLocator instead
 * const btn = await findLocator(page, [
 *   { by: 'role', role: 'button', name: 'Add page' },
 *   { by: 'css',  selector: '#add-new-page-in-canvas-placeholder' },
 *   { by: 'css',  selector: '#add-new-page-in-command-bar' },
 * ]);
 * ```
 */
export async function findWithFallback(
  page: Page,
  selectors: string[],
  opts: { timeout?: number } = {}
): Promise<Locator> {
  return findLocator(
    page,
    selectors.map((selector) => ({ by: 'css', selector })),
    opts
  );
}

/**
 * Find an element using multiple fallback ARIA-role queries.
 * Similar to {@link findWithFallback} but for role-based queries.
 *
 * @deprecated Prefer {@link findLocator} which handles both role-based and CSS specs
 * in a single call and supports all built-in Playwright locator types.
 *
 * @param page        - Playwright page.
 * @param roleQueries - Role + name pairs to try in order.
 * @param opts        - `timeout` per probe in ms (default 1 000).
 *
 * @example
 * ```typescript
 * // Prefer: use findLocator instead
 * const link = await findLocator(page, [
 *   { by: 'role', role: 'menuitem', name: 'Apps' },
 *   { by: 'role', role: 'link',     name: 'Apps' },
 * ]);
 * ```
 */
export async function findWithFallbackRole(
  page: Page,
  roleQueries: Array<{ role: 'link' | 'menuitem' | 'button'; name: string; exact?: boolean }>,
  opts: { timeout?: number } = {}
): Promise<Locator> {
  return findLocator(
    page,
    roleQueries.map((q) => ({ by: 'role', role: q.role, name: q.name, exact: q.exact ?? true })),
    opts
  );
}
