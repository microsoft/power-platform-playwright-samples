// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Page, Locator } from '@playwright/test';

// Canvas engine doesn't fire Power Fx OnChange from fill() or pressSequentially —
// page.keyboard.type fires global DOM events that the Canvas runtime's OnChange listens to.
// Ctrl+A selects existing text; a 150ms pause lets the selection settle so that the
// first typed character isn't lost to a race between selection establishment and typing.
// Delete is intentionally omitted — Canvas global keyboard handlers intercept it and
// can trigger delete-record flows before typing begins.
export async function fillCanvasInput(
  page: Page,
  locator: Locator,
  value: string,
  options: { delay?: number } = {}
): Promise<void> {
  await locator.click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(150); // Let selection settle before typing replaces it
  await page.keyboard.type(value);
}

// Canvas galleries render invisible overlay elements that intercept standard click().
// Retries with force:true when Playwright reports a pointer-intercept error.
export async function clickCanvasButton(
  locator: Locator,
  options: { timeout?: number } = {}
): Promise<void> {
  const timeout = options.timeout ?? 10_000;
  await locator.waitFor({ state: 'visible', timeout });
  try {
    await locator.click({ timeout });
  } catch (err) {
    const msg = (err as Error).message ?? '';
    if (msg.includes('intercept') || msg.includes('pointer') || msg.includes('outside')) {
      await locator.click({ force: true, timeout });
    } else {
      throw err;
    }
  }
}

// Canvas galleries virtualize rows — items outside the viewport are absent from the DOM.
// Scrolls via wheel events until the target item becomes visible, or throws after maxScrolls.
export async function scrollGalleryToItem(
  page: Page,
  gallerySelector: string,
  itemLocator: Locator,
  options: { maxScrolls?: number; scrollDelta?: number; stepDelay?: number } = {}
): Promise<void> {
  const maxScrolls = options.maxScrolls ?? 30;
  const scrollDelta = options.scrollDelta ?? 250;
  const stepDelay = options.stepDelay ?? 300;

  // Gallery fetches data asynchronously after navigation — wait for at least one row.
  await page.locator(gallerySelector).first().waitFor({ state: 'visible', timeout: 30_000 });

  // Scroll to the top first — newly created items sort to the front and the gallery
  // may be mid-scroll from a prior interaction, placing them above the viewport.
  const anchorForReset = page.locator(gallerySelector).first();
  const resetBox = await anchorForReset.boundingBox().catch(() => null);
  if (resetBox) {
    await page.mouse.move(resetBox.x + resetBox.width / 2, resetBox.y + resetBox.height / 2);
    for (let u = 0; u < 15; u++) {
      await page.mouse.wheel(0, -scrollDelta);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(stepDelay);
  }

  for (let i = 0; i < maxScrolls; i++) {
    const visible = await itemLocator.isVisible({ timeout: 500 }).catch(() => false);
    if (visible) return;

    const anchor = page.locator(gallerySelector).first();
    const box = await anchor.boundingBox().catch(() => null);
    if (!box) {
      await page.waitForTimeout(stepDelay);
      continue;
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, scrollDelta);
    await page.waitForTimeout(stepDelay);
  }

  const found = await itemLocator.isVisible({ timeout: 1000 }).catch(() => false);
  if (!found) {
    throw new Error(
      `scrollGalleryToItem: item not found after ${maxScrolls} scroll steps ` +
        `(gallerySelector="${gallerySelector}")`
    );
  }
}

// Canvas engine initialises async — transient failures on first click/focus after navigation.
export async function retryAction<T>(
  action: () => Promise<T>,
  options: { retries?: number; delayMs?: number; label?: string } = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  const delayMs = options.delayMs ?? 500;
  const label = options.label ?? 'retryAction';

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(`${label}: failed after ${retries + 1} attempts — ${lastError?.message}`);
}

// Waits for a readiness selector to appear — use instead of waitForTimeout after canvas navigation.
export async function waitForCanvasReady(
  page: Page,
  readinessSelector: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const timeout = options.timeout ?? 60_000;
  await page.locator(readinessSelector).waitFor({ state: 'visible', timeout });
}

// Waits for a canvas confirmation dialog, clicks confirm, then waits for it to dismiss.
export async function confirmCanvasDialog(
  page: Page,
  options: {
    dialogSelector: string;
    confirmSelector: string;
    cancelSelector?: string;
    timeout?: number;
  }
): Promise<void> {
  const timeout = options.timeout ?? 15_000;
  await page.locator(options.dialogSelector).waitFor({ state: 'visible', timeout });
  await page.locator(options.confirmSelector).waitFor({ state: 'visible', timeout: 5_000 });
  await page.locator(options.confirmSelector).click();
  await page.locator(options.dialogSelector).waitFor({ state: 'hidden', timeout });
}
