/**
 * FormComponent
 * Handles all form operations for Model-Driven Apps
 *
 * Provides methods for:
 * - Form navigation and loading
 * - Field get/set operations
 * - Form save and validation
 * - Tab and section navigation
 * - Header field operations
 *
 * @example
 * ```typescript
 * const modelDrivenApp = new ModelDrivenAppPage(page);
 *
 * // Get form context
 * const context = await modelDrivenApp.form.getContext();
 * console.log('Entity:', context.entityName);
 *
 * // Get field value
 * const orderNumber = await modelDrivenApp.form.getAttribute('nwind_ordernumber');
 *
 * // Set field value
 * await modelDrivenApp.form.setAttribute('nwind_ordernumber', 'TEST-12345');
 *
 * // Save form
 * await modelDrivenApp.form.save();
 * ```
 */

import { Page } from '@playwright/test';
import {
  FormContextData,
  getFormContext,
  getEntityAttribute,
  setEntityAttribute,
  getAllEntityAttributes,
  saveForm,
  isFormDirty,
  isFormValid,
  refreshForm,
  executeInFormContext,
} from './form.context';

/**
 * Form save options
 */
export interface FormSaveOptions {
  /** Save mode: undefined (default), 'saveandclose', or 'saveandnew' */
  saveMode?: 'saveandclose' | 'saveandnew';
}

/**
 * Form tab navigation options
 */
export interface FormTabOptions {
  /** Tab data-id or label */
  tab: string;
  /** Expand the tab (default: true) */
  expand?: boolean;
}

/**
 * Form section navigation options
 */
export interface FormSectionOptions {
  /** Section data-id or label */
  section: string;
  /** Expand the section (default: true) */
  expand?: boolean;
}

/**
 * Field control types in Model-Driven Apps
 */
export enum FieldControlType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  DateTime = 'datetime',
  Lookup = 'lookup',
  OptionSet = 'optionset',
  TwoOptions = 'twooptions',
  MultiSelectOptionSet = 'multiselectoptionset',
  Currency = 'currency',
  Decimal = 'decimal',
  WholeNumber = 'wholenumber',
  FloatingPoint = 'floatingpoint',
  Duration = 'duration',
  Phone = 'phone',
  Email = 'email',
  URL = 'url',
  Ticker = 'ticker',
  RichText = 'richtext',
  MultiLine = 'multiline',
}

export class FormComponent {
  constructor(private page: Page) {}

  /**
   * Get form context information
   * Returns entity name, ID, attributes, and form state
   *
   * @returns FormContext data
   *
   * @example
   * ```typescript
   * const context = await form.getContext();
   * console.log('Entity:', context.entityName);
   * console.log('Record ID:', context.entityId);
   * console.log('Is Dirty:', context.isDirty);
   * ```
   */
  async getContext(): Promise<FormContextData> {
    return await getFormContext(this.page);
  }

  /**
   * Get attribute value from form
   *
   * @param attributeName - Logical name of the attribute
   * @returns Attribute value
   *
   * @example
   * ```typescript
   * const orderNumber = await form.getAttribute('nwind_ordernumber');
   * const status = await form.getAttribute('statuscode');
   * const customer = await form.getAttribute('customerid'); // Returns lookup object
   * ```
   */
  async getAttribute(attributeName: string): Promise<any> {
    return await getEntityAttribute(this.page, attributeName);
  }

  /**
   * Set attribute value on form
   *
   * @param attributeName - Logical name of the attribute
   * @param value - Value to set
   *
   * @example
   * ```typescript
   * // Set text field
   * await form.setAttribute('nwind_ordernumber', 'TEST-12345');
   *
   * // Set number field
   * await form.setAttribute('nwind_orderamount', 1500.50);
   *
   * // Set date field
   * await form.setAttribute('nwind_orderdate', new Date());
   *
   * // Set lookup field
   * await form.setAttribute('customerid', [{
   *   id: 'guid-here',
   *   name: 'Customer Name',
   *   entityType: 'account'
   * }]);
   * ```
   */
  async setAttribute(attributeName: string, value: any): Promise<void> {
    await setEntityAttribute(this.page, attributeName, value);
  }

  /**
   * Get all attribute values from form
   *
   * @returns Object with all attribute names and values
   *
   * @example
   * ```typescript
   * const allData = await form.getAllAttributes();
   * console.log('Order Number:', allData.nwind_ordernumber);
   * console.log('Status:', allData.statuscode);
   * ```
   */
  async getAllAttributes(): Promise<Record<string, any>> {
    return await getAllEntityAttributes(this.page);
  }

  /**
   * Save the form
   *
   * @param options - Save options
   *
   * @example
   * ```typescript
   * // Save and stay on form
   * await form.save();
   *
   * // Save and close
   * await form.save({ saveMode: 'saveandclose' });
   *
   * // Save and create new
   * await form.save({ saveMode: 'saveandnew' });
   * ```
   */
  async save(options?: FormSaveOptions): Promise<void> {
    await saveForm(this.page, options);
  }

  /**
   * Check if form has unsaved changes
   *
   * @returns true if form has unsaved changes
   *
   * @example
   * ```typescript
   * const hasChanges = await form.isDirty();
   * if (hasChanges) {
   *   await form.save();
   * }
   * ```
   */
  async isDirty(): Promise<boolean> {
    return await isFormDirty(this.page);
  }

  /**
   * Check if form data is valid
   *
   * @returns true if all form data is valid
   *
   * @example
   * ```typescript
   * const valid = await form.isValid();
   * if (!valid) {
   *   console.log('Form has validation errors');
   * }
   * ```
   */
  async isValid(): Promise<boolean> {
    return await isFormValid(this.page);
  }

  /**
   * Refresh form data without reloading the page
   *
   * @param save - Whether to save before refreshing
   *
   * @example
   * ```typescript
   * // Refresh without saving
   * await form.refresh();
   *
   * // Save and refresh
   * await form.refresh(true);
   * ```
   */
  async refresh(save: boolean = false): Promise<void> {
    await refreshForm(this.page, save);
  }

  /**
   * Execute JavaScript in Model-Driven App context with access to Xrm
   *
   * @param fn - Function to execute in browser context (receives Xrm object)
   * @returns Result from the executed function
   *
   * @example
   * ```typescript
   * // Get current user info
   * const userInfo = await form.execute((Xrm) => {
   *   return {
   *     userId: Xrm.Utility.getGlobalContext().userSettings.userId,
   *     userName: Xrm.Utility.getGlobalContext().userSettings.userName,
   *   };
   * });
   *
   * // Show notification
   * await form.execute((Xrm) => {
   *   Xrm.Page.ui.setFormNotification('Record updated', 'INFO', 'test-notification');
   * });
   * ```
   */
  async execute<T>(fn: (Xrm: any) => T): Promise<T> {
    return await executeInFormContext(this.page, fn);
  }

  /**
   * Navigate to a specific tab on the form
   *
   * @param options - Tab navigation options
   *
   * @example
   * ```typescript
   * // Navigate to Details tab
   * await form.navigateToTab({ tab: 'DETAILS_TAB' });
   *
   * // Navigate to tab by label
   * await form.navigateToTab({ tab: 'Details' });
   * ```
   */
  async navigateToTab(options: FormTabOptions): Promise<void> {
    const { tab, expand = true } = options;

    await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const tabControl = formContext.ui.tabs.get(tab);

      if (!tabControl) {
        throw new Error(`Tab "${tab}" not found on form`);
      }

      if (expand) {
        tabControl.setDisplayState('expanded');
      }
      tabControl.setFocus();
    });

    console.log(`[FormComponent] Navigated to tab: ${tab}`);
  }

  /**
   * Navigate to a specific section on the form
   *
   * @param options - Section navigation options
   *
   * @example
   * ```typescript
   * // Navigate to section
   * await form.navigateToSection({ section: 'ACCOUNT_INFORMATION' });
   * ```
   */
  async navigateToSection(options: FormSectionOptions): Promise<void> {
    const { section, expand = true } = options;

    await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const tabs = formContext.ui.tabs.get();

      let sectionControl: any = null;

      // Search for section across all tabs
      for (const tab of tabs) {
        const sections = tab.sections.get();
        for (const sec of sections) {
          if (sec.getName() === section || sec.getLabel() === section) {
            sectionControl = sec;
            break;
          }
        }
        if (sectionControl) break;
      }

      if (!sectionControl) {
        throw new Error(`Section "${section}" not found on form`);
      }

      if (expand) {
        sectionControl.setVisible(true);
      }
    });

    console.log(`[FormComponent] Navigated to section: ${section}`);
  }

  /**
   * Wait for form to be fully loaded
   *
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   *
   * @example
   * ```typescript
   * await form.waitForLoad();
   * ```
   */
  async waitForLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const Xrm = (window as any).Xrm;
        if (!Xrm || !Xrm.Page) return false;

        try {
          // Check if formContext is available and form is ready
          const formContext = Xrm.Page;
          const entity = formContext.data.entity;
          return entity && entity.getEntityName() !== null;
        } catch {
          return false;
        }
      },
      { timeout }
    );

    console.log('[FormComponent] Form loaded successfully');
  }

  /**
   * Get field control type
   *
   * @param attributeName - Logical name of the attribute
   * @returns Field control type
   *
   * @example
   * ```typescript
   * const controlType = await form.getFieldControlType('nwind_ordernumber');
   * console.log('Control type:', controlType);
   * ```
   */
  async getFieldControlType(attributeName: string): Promise<string> {
    return await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const attribute = formContext.data.entity.attributes.get(attributeName);

      if (!attribute) {
        throw new Error(`Attribute "${attributeName}" not found on form`);
      }

      return attribute.getAttributeType();
    });
  }

  /**
   * Get field required level
   *
   * @param attributeName - Logical name of the attribute
   * @returns Required level: 'none', 'required', or 'recommended'
   *
   * @example
   * ```typescript
   * const requiredLevel = await form.getFieldRequiredLevel('nwind_ordernumber');
   * console.log('Required level:', requiredLevel);
   * ```
   */
  async getFieldRequiredLevel(attributeName: string): Promise<string> {
    return await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const attribute = formContext.data.entity.attributes.get(attributeName);

      if (!attribute) {
        throw new Error(`Attribute "${attributeName}" not found on form`);
      }

      return attribute.getRequiredLevel();
    });
  }

  /**
   * Set field required level
   *
   * @param attributeName - Logical name of the attribute
   * @param level - Required level: 'none', 'required', or 'recommended'
   *
   * @example
   * ```typescript
   * await form.setFieldRequiredLevel('nwind_ordernumber', 'required');
   * ```
   */
  async setFieldRequiredLevel(
    attributeName: string,
    level: 'none' | 'required' | 'recommended'
  ): Promise<void> {
    await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const attribute = formContext.data.entity.attributes.get(attributeName);

      if (!attribute) {
        throw new Error(`Attribute "${attributeName}" not found on form`);
      }

      attribute.setRequiredLevel(level);
    });

    console.log(`[FormComponent] Set required level for ${attributeName}: ${level}`);
  }

  /**
   * Show/hide field on form
   *
   * @param attributeName - Logical name of the attribute
   * @param visible - true to show, false to hide
   *
   * @example
   * ```typescript
   * await form.setFieldVisibility('nwind_ordernumber', false);
   * ```
   */
  async setFieldVisibility(attributeName: string, visible: boolean): Promise<void> {
    await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const control = formContext.getControl(attributeName);

      if (!control) {
        throw new Error(`Control for attribute "${attributeName}" not found on form`);
      }

      control.setVisible(visible);
    });

    console.log(`[FormComponent] Set visibility for ${attributeName}: ${visible}`);
  }

  /**
   * Enable/disable field on form
   *
   * @param attributeName - Logical name of the attribute
   * @param disabled - true to disable, false to enable
   *
   * @example
   * ```typescript
   * await form.setFieldDisabled('nwind_ordernumber', true);
   * ```
   */
  async setFieldDisabled(attributeName: string, disabled: boolean): Promise<void> {
    await this.execute((Xrm) => {
      const formContext = Xrm.Page;
      const control = formContext.getControl(attributeName);

      if (!control) {
        throw new Error(`Control for attribute "${attributeName}" not found on form`);
      }

      control.setDisabled(disabled);
    });

    console.log(`[FormComponent] Set disabled for ${attributeName}: ${disabled}`);
  }

  /**
   * Show form notification
   *
   * @param message - Notification message
   * @param level - Notification level: 'INFO', 'WARNING', 'ERROR'
   * @param uniqueId - Unique identifier for the notification
   *
   * @example
   * ```typescript
   * await form.showNotification('Record updated successfully', 'INFO', 'update-notification');
   * ```
   */
  async showNotification(
    message: string,
    level: 'INFO' | 'WARNING' | 'ERROR',
    uniqueId: string
  ): Promise<void> {
    await this.execute((Xrm) => {
      Xrm.Page.ui.setFormNotification(message, level, uniqueId);
    });

    console.log(`[FormComponent] Showed notification: ${message}`);
  }

  /**
   * Clear form notification
   *
   * @param uniqueId - Unique identifier of the notification to clear
   *
   * @example
   * ```typescript
   * await form.clearNotification('update-notification');
   * ```
   */
  async clearNotification(uniqueId: string): Promise<void> {
    await this.execute((Xrm) => {
      Xrm.Page.ui.clearFormNotification(uniqueId);
    });

    console.log(`[FormComponent] Cleared notification: ${uniqueId}`);
  }

  /**
   * Get form type
   *
   * @returns Form type: 0=Undefined, 1=Create, 2=Update, 3=Read Only, 4=Disabled, 6=Bulk Edit
   *
   * @example
   * ```typescript
   * const formType = await form.getFormType();
   * console.log('Form type:', formType);
   * ```
   */
  async getFormType(): Promise<number> {
    return await this.execute((Xrm) => {
      return Xrm.Page.ui.getFormType();
    });
  }
}
