// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Page, Locator, FrameLocator } from '@playwright/test';
import {
  waitForCanvasReady,
  clickCanvasButton,
  fillCanvasInput,
  scrollGalleryToItem,
  confirmCanvasDialog,
} from '../../utils/canvas-helpers';

/**
 * Options for confirming a Canvas dialog.
 */
export interface CanvasDialogOptions {
  /** Selector for the dialog text element — used to wait for the dialog to appear and disappear. */
  dialogSelector: string;
  /** Selector for the confirm button inside the dialog. */
  confirmSelector: string;
  /** Optional selector for the cancel button. */
  cancelSelector?: string;
  /** Timeout in milliseconds (default: 15 000). */
  timeout?: number;
}

/**
 * Options for scrolling a Canvas gallery to a target item.
 */
export interface GalleryScrollOptions {
  /** Maximum number of wheel-scroll steps before giving up (default: 30). */
  maxScrolls?: number;
  /** Pixels to scroll per step (default: 250). */
  scrollDelta?: number;
  /** Milliseconds to pause between scroll steps (default: 300). */
  stepDelay?: number;
}

/**
 * Runtime interaction helpers for a **published Canvas App** running in Play mode.
 *
 * @remarks
 * **Play mode only.** This class targets a Canvas app that has been published and
 * launched via a play URL (e.g. `https://apps.powerapps.com/play/...`). It does not
 * apply to Power Apps Studio (Edit mode) — use {@link CanvasAppPage} for authoring
 * scenarios.
 *
 * All methods delegate to the utilities in `canvas-helpers.ts`, which handle:
 * - Cross-origin iframe boundaries between MDA and the Canvas player
 * - Gallery virtualisation (items outside the viewport are absent from the DOM)
 * - Canvas overlay elements that intercept standard Playwright `click()`
 * - Power Fx `OnChange` triggering via `page.keyboard.type` instead of `fill()`
 *
 * @example
 * ```typescript
 * // In a fixture file:
 * build: async (page) => new CanvasAppRuntimePage(page),
 *
 * // In a test:
 * const frame = canvasApp.getCanvasFrame();
 * await canvasApp.waitForAppReady('[title="New record"]');
 * await canvasApp.clickButton(frame.locator('[data-control-name="SaveBtn"] [role="button"]'));
 * ```
 */
export class CanvasAppRuntimePage {
  constructor(protected readonly page: Page) {}

  // ─── Frame access ─────────────────────────────────────────────────────────

  /**
   * Returns a `FrameLocator` scoped to the Canvas player iframe.
   *
   * Canvas apps launched inside a Model-Driven App are served from
   * `https://apps.powerapps.com`, which is cross-origin from the MDA shell
   * (`crm.dynamics.com`). All Canvas control locators must be resolved through
   * this frame locator.
   *
   * @param iframeSelector - CSS selector for the iframe element.
   *   Defaults to `iframe[src*="apps.powerapps.com"]`.
   */
  getCanvasFrame(iframeSelector = 'iframe[src*="apps.powerapps.com"]'): FrameLocator {
    return this.page.frameLocator(iframeSelector);
  }

  // ─── Readiness ────────────────────────────────────────────────────────────

  /**
   * Waits for a DOM element to become visible, signalling that the Canvas app
   * has initialised and is ready for interaction.
   *
   * Prefer a stable, always-present control as the readiness selector (e.g. a
   * toolbar button or the gallery root) rather than a loading spinner, which
   * may never appear on fast connections.
   *
   * @param readinessSelector - CSS selector visible when the app is ready.
   * @param timeout - Maximum wait in milliseconds (default: 60 000).
   */
  async waitForAppReady(readinessSelector: string, timeout = 60_000): Promise<void> {
    await waitForCanvasReady(this.page, readinessSelector, { timeout });
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  /**
   * Types a value into a Canvas text input, triggering Power Fx `OnChange`.
   *
   * Canvas's Power Fx formula engine listens to global DOM keyboard events.
   * Playwright's `fill()` and `pressSequentially()` update the HTML value but
   * do **not** fire `OnChange` — use this method instead.
   *
   * @param locator - The input element locator (resolved inside the canvas frame).
   * @param value - The string value to type.
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await fillCanvasInput(this.page, locator, value);
  }

  // ─── Buttons ──────────────────────────────────────────────────────────────

  /**
   * Clicks a Canvas button, retrying with `{ force: true }` when an overlay
   * element intercepts the pointer event.
   *
   * Canvas galleries render invisible overlay elements over their items.
   * Standard `click()` fails with "element intercepts pointer events" in these
   * cases. This method catches the intercept error and retries with force.
   *
   * @param locator - The button element locator.
   * @param timeout - Maximum wait in milliseconds (default: 10 000).
   */
  async clickButton(locator: Locator, timeout?: number): Promise<void> {
    await clickCanvasButton(locator, { timeout });
  }

  // ─── Gallery ──────────────────────────────────────────────────────────────

  /**
   * Scrolls a virtualised Canvas gallery until a target item becomes visible.
   *
   * Canvas galleries only render items inside the viewport. Items above or
   * below the scroll position are absent from the DOM. This method uses
   * `page.mouse.wheel()` to scroll in steps until the target locator is visible,
   * always resetting to the top first so newly-created items (which sort to the
   * front) are not missed.
   *
   * @param gallerySelector - CSS selector for any visible gallery item, used as
   *   the scroll anchor (e.g. `'[role="listitem"][data-control-part="gallery-item"]'`).
   * @param itemLocator - Locator for the specific item to scroll into view.
   * @param options - Scroll behaviour overrides.
   */
  async scrollGalleryToItem(
    gallerySelector: string,
    itemLocator: Locator,
    options?: GalleryScrollOptions
  ): Promise<void> {
    await scrollGalleryToItem(this.page, gallerySelector, itemLocator, options);
  }

  // ─── Dialogs ──────────────────────────────────────────────────────────────

  /**
   * Waits for a Canvas confirmation dialog to appear, clicks the confirm button,
   * then waits for the dialog to dismiss.
   *
   * @param options - Dialog selectors and timeout configuration.
   */
  async confirmDialog(options: CanvasDialogOptions): Promise<void> {
    await confirmCanvasDialog(this.page, options);
  }
}
