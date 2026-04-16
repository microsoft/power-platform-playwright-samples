// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * FormContext Helper
 * Utilities for accessing and interacting with Model-Driven App formContext
 *
 * The formContext object provides access to form data, entity information, and form controls
 * in Model-Driven Apps. This helper allows Playwright tests to interact with formContext
 * through page.evaluate() calls.
 *
 * @see https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/formcontext-data
 *
 * @example
 * ```typescript
 * import { getFormContext, getEntityAttribute, setEntityAttribute } from 'power-platform-playwright-toolkit';
 *
 * // Get formContext object
 * const formContext = await getFormContext(page);
 * console.log('Entity Name:', formContext.entityName);
 * console.log('Entity ID:', formContext.entityId);
 *
 * // Get attribute value
 * const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
 *
 * // Set attribute value
 * await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-12345');
 *
 * // Save the form
 * await saveForm(page);
 * ```
 */

import { Page } from '@playwright/test';

/**
 * Wait until Xrm.Page.data.entity is non-null AND its attributes collection is
 * populated (form fully loaded in UCI).
 *
 * There is a brief window after navigation where entity exists but attributes.get()
 * returns an empty array because form controls have not yet bound to the entity.
 * Waiting for attributes.length > 0 ensures all attribute controls are registered.
 *
 * @internal Used only by isFormDirty / isFormValid which do NOT access attributes.
 *           All functions that read/write attributes must use waitForEntityAttributes instead.
 */
async function waitForEntityContext(page: Page, timeout = 30_000): Promise<void> {
  // NOTE: page.waitForFunction(fn, arg, options) — the options object MUST be the
  // third argument. Passing it as the second argument treats it as the page-function
  // argument and the page's default timeout is used instead.
  await page.waitForFunction(
    () => {
      const entity = (window as any).Xrm?.Page?.data?.entity;
      if (!entity) return false;
      try {
        // In Dynamics 365 v9.2+, Xrm.Page.data.entity exists once form navigation
        // begins. Checking getEntityName() ensures the entity API is functional
        // without relying on attribute collection population timing.
        //
        // NOTE: do NOT add an attribute-count check here. attributes.forEach() may
        // return 0 during the polling loop even when attributes are fully bound —
        // it only works reliably in a one-shot page.evaluate() call. Checking only
        // getEntityName() keeps this guard fast and CI-safe.
        const name = entity.getEntityName?.();
        return typeof name === 'string' && name.length > 0;
      } catch {
        return false;
      }
    },
    undefined, // arg (pageFunction receives no argument)
    { timeout } // options — timeout in the correct 3rd-argument position
  );
}

/**
 * Wait until the entity attributes collection is populated and ready for access.
 *
 * This is the solid-proof readiness guard for all functions that read or write
 * form attributes (getFormContext, getEntityAttribute, setEntityAttribute,
 * getAllEntityAttributes).
 *
 * ## Why this uses page.evaluate polling, NOT page.waitForFunction
 *
 * In Dynamics 365 v9.2+, `entity.attributes.forEach()` does NOT work reliably
 * inside `page.waitForFunction` polling bodies — the Xrm.Page legacy shim always
 * returns 0 items during repeated polling, even when the form is fully loaded.
 * Only one-shot `page.evaluate()` calls see the live collection correctly.
 *
 * Polling with `page.evaluate + page.waitForTimeout` is the only CI-safe way to
 * wait for the attribute collection to be populated.
 *
 * ## Sign-in dialog handling
 *
 * A "Sign in to continue" dialog can appear mid-session for embedded sub-components
 * (Canvas Apps, Power BI, etc.) and temporarily disrupts the Xrm attributes
 * collection. This function dismisses the dialog if present, then continues polling.
 *
 * ## Read-only / inactive records
 *
 * For deactivated or read-only records, `Xrm.Page.data.entity.attributes` is
 * intentionally empty (D365 does not bind attributes in read-only form mode).
 * This function waits up to `attributeBindMs` for attributes to appear, then
 * RETURNS SILENTLY rather than throwing — individual callers (setEntityAttribute,
 * getEntityAttribute) will throw a fast "Attribute not found" error at that point,
 * which is the correct behaviour. This avoids hanging for 30 s on every read-only
 * record access.
 *
 * @param page - Playwright page object
 * @param entityReadyTimeout - Max ms to wait for entity context (default: 30 000)
 * @param attributeBindMs - Max ms to wait for attributes after entity ready (default: 10 000)
 *
 * @internal
 */
async function waitForEntityAttributes(
  page: Page,
  entityReadyTimeout = 30_000,
  attributeBindMs = 10_000
): Promise<void> {
  // Phase 1: Fast wait for the entity name using waitForFunction.
  // This is CI-safe because it only checks getEntityName(), not the
  // attributes collection (see waitForEntityContext for the reasoning).
  await waitForEntityContext(page, entityReadyTimeout);

  // Phase 2: Dismiss "Sign in to continue" dialog if present.
  // This dialog can appear for embedded sub-components and may temporarily
  // clear the Xrm attributes collection. Dismissing it allows the form to
  // finish initialising.
  try {
    const dialog = page.getByRole('dialog', { name: 'Sign in to continue' });
    if (await dialog.isVisible({ timeout: 300 })) {
      await dialog.getByRole('button', { name: 'Close' }).click({ timeout: 1_000 });
      // Give the form a moment to recover after the dialog closes.
      await page.waitForTimeout(1_000);
    }
  } catch {
    // Dialog not present — continue.
  }

  // Phase 3: Poll using page.evaluate until the attributes collection is populated
  // or until attributeBindMs elapses. Does NOT throw on timeout — read-only /
  // inactive records will never have attributes bound, and individual operations
  // should fail fast with a clear "Attribute not found" error instead.
  //
  // Polling interval: 500 ms.
  const deadline = Date.now() + attributeBindMs;

  while (Date.now() < deadline) {
    const ready = await page.evaluate(() => {
      const entity = (window as any).Xrm?.Page?.data?.entity;
      if (!entity) return false;
      try {
        // Count attributes via forEach (the only reliable API in D365 v9.2+).
        // get() with no arguments returns an empty array; forEach iterates the
        // live collection correctly in a one-shot page.evaluate call.
        let count = 0;
        entity.attributes.forEach(() => {
          count++;
        });
        return count > 0;
      } catch {
        return false;
      }
    });

    if (ready) return;

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await page.waitForTimeout(Math.min(500, remaining));
  }

  // Attribute binding timed out — this is expected for read-only / inactive
  // records. Proceed silently; individual callers handle empty attributes.
}

/**
 * FormContext data structure returned from Model-Driven App
 */
export interface FormContextData {
  /** Entity logical name (e.g., 'account', 'nwind_order') */
  entityName: string;
  /** Entity GUID */
  entityId: string;
  /** Primary attribute value (usually the record name) */
  primaryAttributeValue: string;
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Whether all form data is valid */
  isValid: boolean;
  /** All attribute names on the form */
  attributeNames: string[];
}

/**
 * Get formContext information from Model-Driven App
 *
 * This method extracts key information from the formContext object available
 * in the Model-Driven App client-side context.
 *
 * @param page - Playwright page object
 * @returns FormContext data including entity name, ID, and attributes
 *
 * @example
 * ```typescript
 * const formContext = await getFormContext(page);
 * console.log('Editing:', formContext.entityName);
 * console.log('Record ID:', formContext.entityId);
 * console.log('Form dirty:', formContext.isDirty);
 * ```
 */
export async function getFormContext(page: Page): Promise<FormContextData> {
  await waitForEntityAttributes(page);
  return await page.evaluate(() => {
    // Access Xrm.Page (legacy) or pass formContext from event handler
    // In UCI, formContext is available via Xrm.Page for compatibility
    const formContext = (window as any).Xrm?.Page;

    if (!formContext) {
      throw new Error(
        'formContext not available. Make sure you are on a Model-Driven App form page.'
      );
    }

    const entity = formContext.data.entity;

    // Use forEach (Xrm Collection API) instead of get().map() — in Dynamics 365 v9.2+,
    // get() with no arguments may return an empty array even when attributes are present,
    // while forEach iterates the live collection correctly.
    const attributeNames: string[] = [];
    entity.attributes.forEach((attr: any) => {
      attributeNames.push(attr.getName());
    });

    return {
      entityName: entity.getEntityName(),
      entityId: entity.getId().replace(/^\{|\}$/g, ''),
      primaryAttributeValue: entity.getPrimaryAttributeValue(),
      isDirty: entity.getIsDirty(),
      isValid: entity.isValid(),
      attributeNames,
    };
  });
}

/**
 * Get attribute value from form
 *
 * @param page - Playwright page object
 * @param attributeName - Logical name of the attribute (e.g., 'nwind_ordernumber')
 * @returns Attribute value (can be string, number, boolean, Date, lookup object, etc.)
 *
 * @example
 * ```typescript
 * const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
 * const status = await getEntityAttribute(page, 'statuscode');
 * const customer = await getEntityAttribute(page, 'customerid'); // Returns lookup object
 * ```
 */
export async function getEntityAttribute(page: Page, attributeName: string): Promise<any> {
  await waitForEntityAttributes(page);
  return await page.evaluate((attrName) => {
    const formContext = (window as any).Xrm?.Page;
    if (!formContext) {
      throw new Error('formContext not available');
    }

    const attribute = formContext.data.entity.attributes.get(attrName);
    if (!attribute) {
      throw new Error(`Attribute "${attrName}" not found on form`);
    }

    return attribute.getValue();
  }, attributeName);
}

/**
 * Set attribute value on form
 *
 * @param page - Playwright page object
 * @param attributeName - Logical name of the attribute
 * @param value - Value to set (type depends on attribute type)
 *
 * @example
 * ```typescript
 * // Set text field
 * await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-12345');
 *
 * // Set number field
 * await setEntityAttribute(page, 'nwind_orderamount', 1500.50);
 *
 * // Set date field
 * await setEntityAttribute(page, 'nwind_orderdate', new Date());
 *
 * // Set lookup field
 * await setEntityAttribute(page, 'customerid', [{
 *   id: 'guid-here',
 *   name: 'Customer Name',
 *   entityType: 'account'
 * }]);
 * ```
 */
export async function setEntityAttribute(
  page: Page,
  attributeName: string,
  value: any
): Promise<void> {
  await waitForEntityAttributes(page);
  await page.evaluate(
    ({ attrName, val }) => {
      const formContext = (window as any).Xrm?.Page;
      if (!formContext) {
        throw new Error('formContext not available');
      }

      const attribute = formContext.data.entity.attributes.get(attrName);
      if (!attribute) {
        throw new Error(`Attribute "${attrName}" not found on form`);
      }

      attribute.setValue(val);
    },
    { attrName: attributeName, val: value }
  );
}

/**
 * Get all attribute values from form
 *
 * @param page - Playwright page object
 * @returns Object with all attribute names and values
 *
 * @example
 * ```typescript
 * const allData = await getAllEntityAttributes(page);
 * console.log('Order Number:', allData.nwind_ordernumber);
 * console.log('Status:', allData.statuscode);
 * ```
 */
export async function getAllEntityAttributes(page: Page): Promise<Record<string, any>> {
  // waitForEntityAttributes polls until BOTH entity name AND the attributes
  // collection are ready (up to 30 s). This replaces the old retry loop and
  // is CI-safe because it uses page.evaluate, not waitForFunction.
  await waitForEntityAttributes(page);

  return await page.evaluate(() => {
    const formContext = (window as any).Xrm?.Page;
    if (!formContext) {
      throw new Error('formContext not available');
    }
    const result: Record<string, any> = {};
    // Use forEach (Xrm Collection API) — works in Dynamics 365 v9.2+ where
    // get() with no arguments may return an empty array.
    formContext.data.entity.attributes.forEach((attr: any) => {
      result[attr.getName()] = attr.getValue();
    });
    return result;
  });
}

/**
 * Save the form
 *
 * @param page - Playwright page object
 * @param options - Save options
 * @param options.saveMode - Save mode: 'saveandclose' or 'saveandnew'
 *
 * @example
 * ```typescript
 * // Save and stay on form
 * await saveForm(page);
 *
 * // Save and close
 * await saveForm(page, { saveMode: 'saveandclose' });
 *
 * // Save and create new
 * await saveForm(page, { saveMode: 'saveandnew' });
 * ```
 */
export async function saveForm(
  page: Page,
  options?: { saveMode?: 'saveandclose' | 'saveandnew' }
): Promise<void> {
  await page.evaluate((opts) => {
    const formContext = (window as any).Xrm?.Page;
    if (!formContext) {
      throw new Error('formContext not available');
    }

    // Build save options
    const saveOptions: any = {};
    if (opts?.saveMode) {
      saveOptions.saveMode =
        opts.saveMode === 'saveandclose' ? 2 : opts.saveMode === 'saveandnew' ? 1 : undefined;
    }

    formContext.data.entity.save(saveOptions);
  }, options);

  // Wait for save to complete
  await page.waitForTimeout(2000);
}

/**
 * Check if form is dirty (has unsaved changes)
 *
 * @param page - Playwright page object
 * @returns true if form has unsaved changes
 *
 * @example
 * ```typescript
 * const hasChanges = await isFormDirty(page);
 * if (hasChanges) {
 *   await saveForm(page);
 * }
 * ```
 */
export async function isFormDirty(page: Page): Promise<boolean> {
  await waitForEntityContext(page);
  return await page.evaluate(() => {
    const formContext = (window as any).Xrm?.Page;
    if (!formContext) {
      throw new Error('formContext not available');
    }
    return formContext.data.entity.getIsDirty();
  });
}

/**
 * Check if form data is valid
 *
 * @param page - Playwright page object
 * @returns true if all form data is valid
 *
 * @example
 * ```typescript
 * const valid = await isFormValid(page);
 * if (!valid) {
 *   console.log('Form has validation errors');
 * }
 * ```
 */
export async function isFormValid(page: Page): Promise<boolean> {
  await waitForEntityContext(page);
  return await page.evaluate(() => {
    const formContext = (window as any).Xrm?.Page;
    if (!formContext) {
      throw new Error('formContext not available');
    }
    return formContext.data.entity.isValid();
  });
}

/**
 * Refresh form data without reloading the page
 *
 * @param page - Playwright page object
 * @param save - Whether to save before refreshing
 *
 * @example
 * ```typescript
 * // Refresh without saving
 * await refreshForm(page);
 *
 * // Save and refresh
 * await refreshForm(page, true);
 * ```
 */
export async function refreshForm(page: Page, save: boolean = false): Promise<void> {
  await page.evaluate((shouldSave) => {
    const formContext = (window as any).Xrm?.Page;
    if (!formContext) {
      throw new Error('formContext not available');
    }
    formContext.data.refresh(shouldSave);
  }, save);

  // Wait for refresh to complete
  await page.waitForTimeout(2000);
}

/**
 * Execute JavaScript in Model-Driven App context with access to Xrm
 *
 * This is a low-level method that allows running arbitrary JavaScript
 * in the Model-Driven App context where Xrm and formContext are available.
 *
 * @param page - Playwright page object
 * @param fn - Function to execute in browser context (receives Xrm object)
 * @returns Result from the executed function
 *
 * @example
 * ```typescript
 * // Get current user info
 * const userInfo = await executeInFormContext(page, (Xrm) => {
 *   return {
 *     userId: Xrm.Utility.getGlobalContext().userSettings.userId,
 *     userName: Xrm.Utility.getGlobalContext().userSettings.userName,
 *   };
 * });
 *
 * // Show notification
 * await executeInFormContext(page, (Xrm) => {
 *   Xrm.Page.ui.setFormNotification('Record updated', 'INFO', 'test-notification');
 * });
 * ```
 */
export async function executeInFormContext<T>(page: Page, fn: (Xrm: any) => T): Promise<T> {
  return await page.evaluate((fnString) => {
    const Xrm = (window as any).Xrm;
    if (!Xrm) {
      throw new Error('Xrm object not available');
    }

    // Reconstruct function from string and execute
    const func = new Function('Xrm', `return (${fnString})(Xrm);`);
    return func(Xrm);
  }, fn.toString());
}
