/**
 * FormContext Example
 * Demonstrates how to use formContext helpers to interact with Model-Driven App forms
 *
 * This example shows various ways to access and manipulate form data using the
 * formContext API through Playwright.
 */

import { test, expect, Page } from '@playwright/test';
import {
  getFormContext,
  getEntityAttribute,
  setEntityAttribute,
  getAllEntityAttributes,
  saveForm,
  isFormDirty,
  isFormValid,
  refreshForm,
  executeInFormContext,
} from 'power-platform-playwright-toolkit';

/**
 * Example 1: Get FormContext Information
 * Retrieve basic information about the form and entity
 */
async function exampleGetFormContext(page: Page) {
  console.log('\n=== Example 1: Get FormContext ===');

  const formContext = await getFormContext(page);

  console.log('Entity Name:', formContext.entityName);
  console.log('Entity ID:', formContext.entityId);
  console.log('Primary Attribute:', formContext.primaryAttributeValue);
  console.log('Is Dirty:', formContext.isDirty);
  console.log('Is Valid:', formContext.isValid);
  console.log('Available Attributes:', formContext.attributeNames);

  return formContext;
}

/**
 * Example 2: Get Individual Attribute Values
 * Read specific field values from the form
 */
async function exampleGetAttributes(page: Page) {
  console.log('\n=== Example 2: Get Attribute Values ===');

  // Get single attribute
  const orderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
  console.log('Order Number:', orderNumber);

  const status = await getEntityAttribute(page, 'statuscode');
  console.log('Status Code:', status);

  const orderDate = await getEntityAttribute(page, 'nwind_orderdate');
  console.log('Order Date:', orderDate);

  // Get lookup attribute (returns object with id, name, entityType)
  try {
    const customer = await getEntityAttribute(page, 'customerid');
    console.log('Customer:', customer);
  } catch (error) {
    console.log('Customer field not on form or has no value');
  }

  return { orderNumber, status, orderDate };
}

/**
 * Example 3: Set Attribute Values
 * Update field values on the form
 */
async function exampleSetAttributes(page: Page) {
  console.log('\n=== Example 3: Set Attribute Values ===');

  // Set text field
  await setEntityAttribute(page, 'nwind_ordernumber', 'TEST-AUTOMATED-001');
  console.log('✅ Set Order Number');

  // Set number field
  await setEntityAttribute(page, 'nwind_orderamount', 1500.5);
  console.log('✅ Set Order Amount');

  // Set date field
  await setEntityAttribute(page, 'nwind_orderdate', new Date());
  console.log('✅ Set Order Date');

  // Set lookup field
  // await setEntityAttribute(page, 'customerid', [{
  //   id: '{customer-guid}',
  //   name: 'Acme Corporation',
  //   entityType: 'account'
  // }]);
  // console.log('✅ Set Customer');

  // Check if form is dirty after changes
  const isDirty = await isFormDirty(page);
  console.log('Form has unsaved changes:', isDirty);
}

/**
 * Example 4: Get All Attributes at Once
 * Retrieve all form data in a single call
 */
async function exampleGetAllAttributes(page: Page) {
  console.log('\n=== Example 4: Get All Attributes ===');

  const allData = await getAllEntityAttributes(page);

  console.log('All Form Data:');
  Object.entries(allData).forEach(([key, value]) => {
    console.log(`  ${key}:`, value);
  });

  return allData;
}

/**
 * Example 5: Save Form with Different Options
 * Demonstrate various save operations
 */
async function exampleSaveForm(page: Page) {
  console.log('\n=== Example 5: Save Form ===');

  // Check if form is valid before saving
  const isValid = await isFormValid(page);
  console.log('Form is valid:', isValid);

  if (!isValid) {
    console.log('⚠️ Form has validation errors, cannot save');
    return;
  }

  // Option 1: Save and stay on form
  await saveForm(page);
  console.log('✅ Saved (stay on form)');

  // Option 2: Save and close
  // await saveForm(page, { saveMode: 'saveandclose' });
  // console.log('✅ Saved and closed');

  // Option 3: Save and create new
  // await saveForm(page, { saveMode: 'saveandnew' });
  // console.log('✅ Saved and opening new form');
}

/**
 * Example 6: Check Form State
 * Monitor form dirty and validation state
 */
async function exampleCheckFormState(page: Page) {
  console.log('\n=== Example 6: Check Form State ===');

  const isDirty = await isFormDirty(page);
  console.log('Has unsaved changes:', isDirty);

  const isValid = await isFormValid(page);
  console.log('All data is valid:', isValid);

  if (isDirty && isValid) {
    console.log('✅ Form can be saved');
  } else if (isDirty && !isValid) {
    console.log('⚠️ Form has unsaved changes but validation errors');
  } else {
    console.log('ℹ️ No changes to save');
  }
}

/**
 * Example 7: Refresh Form Data
 * Reload form data without refreshing the page
 */
async function exampleRefreshForm(page: Page) {
  console.log('\n=== Example 7: Refresh Form ===');

  // Refresh without saving
  await refreshForm(page, false);
  console.log('✅ Refreshed form data');

  // Refresh and save
  // await refreshForm(page, true);
  // console.log('✅ Saved and refreshed form data');
}

/**
 * Example 8: Execute Custom JavaScript in Form Context
 * Run arbitrary code with access to Xrm object
 */
async function exampleExecuteInFormContext(page: Page) {
  console.log('\n=== Example 8: Execute Custom JavaScript ===');

  // Get current user information
  const userInfo = await executeInFormContext(page, (Xrm) => {
    const userSettings = Xrm.Utility.getGlobalContext().userSettings;
    return {
      userId: userSettings.userId,
      userName: userSettings.userName,
      userRoles: userSettings.roles.get().map((role: any) => role.name),
    };
  });

  console.log('Current User:');
  console.log('  ID:', userInfo.userId);
  console.log('  Name:', userInfo.userName);
  console.log('  Roles:', userInfo.userRoles);

  // Show form notification
  await executeInFormContext(page, (Xrm) => {
    Xrm.Page.ui.setFormNotification(
      'Form accessed via Playwright automation',
      'INFO',
      'playwright-notification'
    );
  });
  console.log('✅ Displayed form notification');

  // Get organization information
  const orgInfo = await executeInFormContext(page, (Xrm) => {
    const context = Xrm.Utility.getGlobalContext();
    return {
      orgName: context.organizationSettings.uniqueName,
      orgId: context.organizationSettings.organizationId,
      version: context.getVersion(),
    };
  });

  console.log('Organization:');
  console.log('  Name:', orgInfo.orgName);
  console.log('  ID:', orgInfo.orgId);
  console.log('  Version:', orgInfo.version);
}

/**
 * Example 9: Complete Form Automation Workflow
 * Demonstrates a typical form automation scenario
 */
async function exampleCompleteWorkflow(page: Page) {
  console.log('\n=== Example 9: Complete Workflow ===');

  // Step 1: Get current form context
  const formContext = await getFormContext(page);
  console.log(`📋 Editing ${formContext.entityName} record`);
  console.log(`   Record: ${formContext.primaryAttributeValue || 'New Record'}`);

  // Step 2: Read current values
  console.log('\n📖 Reading current values...');
  const currentOrderNumber = await getEntityAttribute(page, 'nwind_ordernumber');
  console.log(`   Current Order Number: ${currentOrderNumber}`);

  // Step 3: Update values
  console.log('\n✏️ Updating values...');
  const newOrderNumber = `AUTO-${Date.now()}`;
  await setEntityAttribute(page, 'nwind_ordernumber', newOrderNumber);
  console.log(`   New Order Number: ${newOrderNumber}`);

  // Step 4: Validate changes
  console.log('\n✅ Validating...');
  const isDirty = await isFormDirty(page);
  const isValid = await isFormValid(page);
  console.log(`   Has changes: ${isDirty}`);
  console.log(`   Is valid: ${isValid}`);

  // Step 5: Save if valid
  if (isDirty && isValid) {
    console.log('\n💾 Saving...');
    await saveForm(page);
    console.log('   ✅ Saved successfully');

    // Step 6: Verify save
    await page.waitForTimeout(1000);
    const afterSave = await isFormDirty(page);
    console.log(`   Dirty after save: ${afterSave}`);
  } else {
    console.log('\n⚠️ Cannot save: form is invalid or has no changes');
  }

  console.log('\n🎉 Workflow completed!');
}

/**
 * Main Test Example
 * Run all examples in sequence
 */
test.describe('FormContext Examples', () => {
  test('should demonstrate formContext usage', async ({ page }) => {
    // NOTE: You need to navigate to a Model-Driven App form first
    // This is just an example structure

    // Navigate to your Model-Driven App form
    // await page.goto('https://your-org.crm.dynamics.com/main.aspx?...');

    // Wait for form to load
    await page.waitForTimeout(5000);

    try {
      // Run examples
      await exampleGetFormContext(page);
      await exampleGetAttributes(page);
      await exampleGetAllAttributes(page);
      await exampleCheckFormState(page);

      // Uncomment to test write operations
      // await exampleSetAttributes(page);
      // await exampleSaveForm(page);
      // await exampleRefreshForm(page);

      await exampleExecuteInFormContext(page);

      // Uncomment for complete workflow
      // await exampleCompleteWorkflow(page);

      console.log('\n✅ All examples completed successfully!');
    } catch (error) {
      console.error('Error running examples:', error);
      throw error;
    }
  });
});

// Export examples for use in other tests
export {
  exampleGetFormContext,
  exampleGetAttributes,
  exampleSetAttributes,
  exampleGetAllAttributes,
  exampleSaveForm,
  exampleCheckFormState,
  exampleRefreshForm,
  exampleExecuteInFormContext,
  exampleCompleteWorkflow,
};
