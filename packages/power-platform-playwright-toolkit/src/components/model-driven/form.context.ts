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
        // begins. Check entity name first (fast path), then confirm at least one
        // attribute is accessible via forEach — guards against the brief window
        // where entity name is available but attribute bindings are not yet complete.
        const name = entity.getEntityName?.();
        if (typeof name !== 'string' || name.length === 0) return false;
        let attrCount = 0;
        entity.attributes.forEach(() => {
          attrCount++;
        });
        return attrCount > 0;
      } catch {
        return false;
      }
    },
    undefined, // arg (pageFunction receives no argument)
    { timeout } // options — timeout in the correct 3rd-argument position
  );
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
  await waitForEntityContext(page);
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
  await waitForEntityContext(page);
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
  await waitForEntityContext(page);
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
  await waitForEntityContext(page);
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
