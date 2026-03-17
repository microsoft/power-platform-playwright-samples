/**
 * GenUX test utilities
 * Shared helpers for generated Power Apps form testing
 */

import { FrameLocator, Locator, Page } from '@playwright/test';
import { GenUxConstants } from 'power-platform-playwright-toolkit';

export { GenUxConstants };

/**
 * Multi-strategy form field locator for generated Power Apps forms.
 *
 * Tries built-in Playwright locators in priority order:
 *   1. `getByLabel()`       — aria-label, <label>, aria-labeled-by (most accurate)
 *   2. `getByRole('textbox', { name })` — accessible name from any source
 *   3. `getByPlaceholder()` — placeholder text (common in generated forms)
 *   4. `getByTestId()`      — data-testid="${fieldName}" or "${fieldName}-input"
 *   5. `getByLabel(pattern)` — FIELD_PATTERNS regex fallback
 *
 * All strategies use case-insensitive partial matching via RegExp.
 *
 * @param root - Playwright Page or FrameLocator to search within.
 *               Pass `genUxPage.previewFrame` when the generated form is inside the
 *               UCI Preview iframe (the standard GenUX designer layout).
 * @param fieldName - Field key such as "firstName", "email", "phone"
 * @returns Resolved Locator pointing to the visible input element
 * @throws If no matching input is found after exhausting all strategies
 */
export async function findFormInput(
  root: Page | FrameLocator,
  fieldName: string
): Promise<Locator> {
  const namePattern = new RegExp(fieldName, 'i');

  // Strategy 1: getByLabel() — checks aria-label, <label> text, and aria-labeled-by.
  //             Covers plain inputs, MUI TextField, and any accessible form field.
  // Strategy 2: getByRole('textbox') — matches by ARIA role + accessible name.
  //             Catches inputs whose accessible name comes from aria-labeled-by chains.
  // Strategy 3: getByPlaceholder() — for inputs that use placeholder as their only label.
  // Strategy 4: getByTestId() — for inputs with data-testid="${fieldName}" directly on
  //             the <input>, or with a "-input" suffix variant.
  const combined = root
    .getByLabel(namePattern)
    .or(root.getByRole('textbox', { name: namePattern }))
    .or(root.getByPlaceholder(namePattern))
    .or(root.getByTestId(fieldName))
    .or(root.getByTestId(`${fieldName}-input`));

  try {
    await combined.first().waitFor({ state: 'visible', timeout: 5000 });
    return combined.first();
  } catch {
    // Strategy 5: FIELD_PATTERNS regex fallback — handles generated field names
    //             that don't match the simple fieldName string (e.g. "First Name" for "firstName")
    const pattern =
      GenUxConstants.FIELD_PATTERNS[
        fieldName.toUpperCase() as keyof typeof GenUxConstants.FIELD_PATTERNS
      ];

    if (pattern) {
      // getByLabel(pattern) — most accurate for regex-matched accessible names
      // getByRole('textbox', { name: pattern }) — accessible name fallback
      const byPattern = root.getByLabel(pattern).or(root.getByRole('textbox', { name: pattern }));

      try {
        await byPattern.first().waitFor({ state: 'visible', timeout: 5000 });
        return byPattern.first();
      } catch {
        // fall through to throw
      }
    }

    throw new Error(`Could not find form input for field: "${fieldName}"`);
  }
}
