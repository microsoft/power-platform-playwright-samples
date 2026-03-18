/**
 * Locator Helper Utilities
 * Utilities for finding elements with fallback selectors
 */

import { Page, Locator } from '@playwright/test';

/**
 * Find an element using multiple fallback selectors
 * Tries each selector in order until one is found
 *
 * @param page - Playwright page
 * @param selectors - Array of selectors to try in order
 * @param opts - Options including timeout
 * @returns The first matching locator
 * @throws Error if none of the selectors match
 *
 * @example
 * ```typescript
 * const login = await findWithFallback(page, [
 *   '#login',
 *   'button:has-text("Log In")',
 *   '[data-test="btn-login"]'
 * ]);
 * await login.click();
 * ```
 */
export async function findWithFallback(
  page: Page,
  selectors: string[],
  opts: { timeout?: number } = {}
): Promise<Locator> {
  let lastError: Error | undefined;

  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout: opts.timeout ?? 1000 });
      return locator;
    } catch (err) {
      lastError = err as Error;
      // Try next selector
    }
  }

  throw new Error(
    `Fallback failed for selectors: ${selectors.join(', ')}\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Find an element using multiple fallback role-based selectors
 * Similar to findWithFallback but for role-based queries
 *
 * @param page - Playwright page
 * @param roleQueries - Array of role query objects to try
 * @param opts - Options including timeout
 * @returns The first matching locator
 * @throws Error if none of the role queries match
 *
 * @example
 * ```typescript
 * const apps = await findWithFallbackRole(page, [
 *   { role: 'menuitem', name: 'Apps' },
 *   { role: 'link', name: 'Apps' }
 * ]);
 * await apps.click();
 * ```
 */
export async function findWithFallbackRole(
  page: Page,
  roleQueries: Array<{ role: 'link' | 'menuitem' | 'button'; name: string; exact?: boolean }>,
  opts: { timeout?: number } = {}
): Promise<Locator> {
  let lastError: Error | undefined;

  for (const query of roleQueries) {
    try {
      const locator = page.getByRole(query.role as any, {
        name: query.name,
        exact: query.exact ?? true,
      });
      await locator.waitFor({ state: 'visible', timeout: opts.timeout ?? 1000 });
      return locator;
    } catch (err) {
      lastError = err as Error;
      // Try next role query
    }
  }

  throw new Error(
    `Fallback failed for role queries: ${roleQueries.map((q) => `${q.role}[name="${q.name}"]`).join(', ')}\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
  );
}
