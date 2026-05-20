/**
 * Lit behavioral tests for the Anchored Presence Surface family.
 *
 * Parity with React (499ed17), Vue (38454fe), and Svelte (43863a0,
 * 29f3fb4). Tests cover the same semantic surface: hover/focus open,
 * pointer-leave/blur/escape close, aria-describedby wiring on the
 * adopted anchor, disabled suppression, controlled/uncontrolled
 * state, default-host vs slot-adoption modes, and unmount listener
 * cleanup.
 */
import type { ComponentIR } from "../../ir.js";
import { isAnchoredPresenceKind } from "../../semantics.js";

export function generateLitSurfaceTest(ir: ComponentIR): string {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateLitSurfaceTest called on ${ir.name} without ir.surface`,
    );
  }
  if (!isAnchoredPresenceKind(surface.kind)) {
    throw new Error(
      `Lit surface test emitter expected an anchored-presence kind (got "${surface.kind}"). ` +
        `Add the kind to ANCHORED_PRESENCE_KINDS in semantics.ts when its substrate is ready.`,
    );
  }
  // Test-body shape is kind-specific (Tooltip's hover/focus contract
  // vs Popover's click contract). Each kind has its own scaffold
  // function; dispatch on kind here. Body emission is realization,
  // not policy.
  if (surface.kind === "popover") {
    return emitPopoverTests(ir);
  }
  return emitTooltipTests(ir);
}

function tagFor(name: string): string {
  return `fsds-${name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")}`;
}

function emitTooltipTests(ir: ComponentIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const rootTag = tagFor(name);
  const triggerTag = `${rootTag}-trigger`;
  const contentTag = `${rootTag}-content`;

  const importsBody = [
    `import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";`,
    `import { axe } from "vitest-axe";`,
    `import "../${name}.js";`,
    ``,
    `declare module "vitest" {`,
    `  interface Assertion<T> {`,
    `    toHaveNoViolations(): void;`,
    `  }`,
    `}`,
    ``,
    `/**`,
    ` * Settle Lit updates and microtasks. Custom elements queue work`,
    ` * through Promise.resolve().then(...) for context propagation,`,
    ` * so awaiting updateComplete alone is not enough.`,
    ` */`,
    `async function settle(el: Element): Promise<void> {`,
    `  await (el as Element & { updateComplete?: Promise<unknown> }).updateComplete;`,
    `  await Promise.resolve();`,
    `  await Promise.resolve();`,
    `}`,
  ].join("\n");

  const helpersBody = `interface MountOptions {
  defaultOpen?: boolean;
  open?: boolean;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, slot a <a href="#help"> as the consumer-rendered
   *  host. Otherwise the default-host <button> path is exercised. */
  withSlottedHost?: boolean;
}

async function mountTooltip(opts: MountOptions = {}): Promise<HTMLElement> {
  await Promise.all([
    customElements.whenDefined("${rootTag}"),
    customElements.whenDefined("${triggerTag}"),
    customElements.whenDefined("${contentTag}"),
  ]);
  const root = document.createElement("${rootTag}") as HTMLElement;
  const props = root as unknown as Record<string, unknown>;
  if (opts.defaultOpen !== undefined) props.defaultOpen = opts.defaultOpen;
  if (opts.open !== undefined) props.open = opts.open;
  if (opts.disabled !== undefined) props.disabled = opts.disabled;
  if (opts.closeOnEscape !== undefined) props.closeOnEscape = opts.closeOnEscape;
  if (opts.closeOnBlur !== undefined) props.closeOnBlur = opts.closeOnBlur;
  if (opts.onOpenChange) props.onOpenChange = opts.onOpenChange;

  const trigger = document.createElement("${triggerTag}") as HTMLElement;
  trigger.setAttribute("data-testid", "trigger-wrapper");
  if (opts.withSlottedHost) {
    const a = document.createElement("a");
    a.setAttribute("href", "#help");
    a.setAttribute("data-testid", "slotted-host");
    a.textContent = "Save";
    trigger.appendChild(a);
  }

  const content = document.createElement("${contentTag}") as HTMLElement;
  content.setAttribute("data-testid", "content");
  content.textContent = "Help text";

  root.appendChild(trigger);
  root.appendChild(content);
  document.body.appendChild(root);

  await settle(root);
  await settle(trigger);
  await settle(content);
  return root;
}

function getAnchor(root: HTMLElement, withSlottedHost: boolean): HTMLElement {
  if (withSlottedHost) {
    return root.querySelector("[data-testid='slotted-host']") as HTMLElement;
  }
  const trigger = root.querySelector("${triggerTag}") as HTMLElement;
  return trigger.shadowRoot!.querySelector("button") as HTMLElement;
}

function getContentEl(root: HTMLElement): HTMLElement | null {
  // The content host element reflects open state by setting/removing
  // its own [data-${cssPrefix}-content] attribute (and id/role). When
  // closed the attribute is absent and the host renders nothing.
  const host = root.querySelector("${contentTag}") as HTMLElement;
  return host.hasAttribute("data-${cssPrefix}-content") ? host : null;
}

afterEach(() => {
  document.body.innerHTML = "";
});`;

  const testsBody = `describe("${name} — compound API surface (default-host)", () => {
  it("renders the trigger but not the content when closed", async () => {
    const root = await mountTooltip();
    expect(getAnchor(root, false)).toBeTruthy();
    expect(getContentEl(root)).toBeNull();
  });

  it("renders the content when defaultOpen=true", async () => {
    const root = await mountTooltip({ defaultOpen: true });
    const content = getContentEl(root);
    expect(content).toBeTruthy();
    expect(content?.getAttribute("role")).toBe("tooltip");
  });

  it("opens on pointerenter (hover) over the default <button>", async () => {
    const root = await mountTooltip();
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("opens on focus over the default <button>", async () => {
    const root = await mountTooltip();
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new FocusEvent("focus"));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("closes on pointerleave from the anchor (no grace path into content)", async () => {
    const root = await mountTooltip({ defaultOpen: true });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, relatedTarget: document.body }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("closes on Escape", async () => {
    const root = await mountTooltip({ defaultOpen: true });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("closes on focus leaving the surface boundary (focusout)", async () => {
    // Boundary semantics: the substrate listens via focusout
    // (which bubbles, unlike blur) for focus leaving the anchor +
    // content surface. Focus moving from anchor to an outside node
    // dismisses; focus moving from anchor INTO content does not.
    const root = await mountTooltip({ defaultOpen: true });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("wires aria-describedby from anchor to content when open", async () => {
    const root = await mountTooltip({ defaultOpen: true });
    const anchor = getAnchor(root, false);
    const content = getContentEl(root)!;
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(anchor.getAttribute("aria-describedby")).toBe(id);
  });

  it("does NOT set aria-describedby when closed", async () => {
    const root = await mountTooltip();
    const anchor = getAnchor(root, false);
    expect(anchor.getAttribute("aria-describedby")).toBeNull();
  });

  it("fires onOpenChange on uncontrolled open", async () => {
    const spy = vi.fn();
    const root = await mountTooltip({ onOpenChange: spy });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle(root);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — pointerenter does not open", async () => {
    const root = await mountTooltip({ disabled: true });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("disabled root does not fire onOpenChange on hover", async () => {
    const spy = vi.fn();
    const root = await mountTooltip({ disabled: true, onOpenChange: spy });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle(root);
    expect(spy).not.toHaveBeenCalled();
  });

  it("controlled open prop overrides internal state", async () => {
    const root = await mountTooltip({ open: false });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
    (root as unknown as Record<string, unknown>).open = true;
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("pointerleave INTO content does not close (grace path)", async () => {
    const root = await mountTooltip({ defaultOpen: true });
    const anchor = getAnchor(root, false);
    const content = getContentEl(root)!;
    anchor.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, relatedTarget: content }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("closeOnEscape=false prevents Escape dismissal", async () => {
    const root = await mountTooltip({ defaultOpen: true, closeOnEscape: false });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("closeOnBlur=false prevents boundary-focusout dismissal", async () => {
    const root = await mountTooltip({ defaultOpen: true, closeOnBlur: false });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("disconnecting the root removes document-level listeners", async () => {
    const spy = vi.fn();
    const root = await mountTooltip({ defaultOpen: true, onOpenChange: spy });
    root.remove();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("${name} — slot-based host adoption", () => {
  it("uses the slotted <a> as the trigger host (no nested default button is the anchor)", async () => {
    const root = await mountTooltip({ withSlottedHost: true });
    const anchor = getAnchor(root, true);
    expect(anchor.tagName).toBe("A");
    expect(anchor.hasAttribute("data-${cssPrefix}-trigger")).toBe(true);
  });

  it("slotted host opens on pointerenter", async () => {
    const root = await mountTooltip({ withSlottedHost: true });
    const anchor = getAnchor(root, true);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("slotted host opens on focus", async () => {
    const root = await mountTooltip({ withSlottedHost: true });
    const anchor = getAnchor(root, true);
    anchor.dispatchEvent(new FocusEvent("focus"));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("slotted host receives aria-describedby when open", async () => {
    const root = await mountTooltip({ withSlottedHost: true, defaultOpen: true });
    const anchor = getAnchor(root, true);
    const content = getContentEl(root)!;
    expect(anchor.getAttribute("aria-describedby")).toBe(content.getAttribute("id"));
  });

  it("consumer event.preventDefault() suppresses the surface handler", async () => {
    const surfaceSpy = vi.fn();
    const root = await mountTooltip({ withSlottedHost: true, onOpenChange: surfaceSpy });
    const anchor = getAnchor(root, true);
    anchor.addEventListener("pointerenter", (e) => e.preventDefault());
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, cancelable: true }));
    await settle(root);
    expect(surfaceSpy).not.toHaveBeenCalled();
    expect(getContentEl(root)).toBeNull();
  });

  it("removing the slotted host clears its ARIA + data marker", async () => {
    const root = await mountTooltip({ withSlottedHost: true, defaultOpen: true });
    const anchor = getAnchor(root, true);
    expect(anchor.hasAttribute("data-${cssPrefix}-trigger")).toBe(true);
    anchor.remove();
    await settle(root);
    // After removal, the previous anchor's marker was cleared by
    // TooltipTriggerElement's _updateAnchor before disconnecting it.
    expect(anchor.hasAttribute("data-${cssPrefix}-trigger")).toBe(false);
  });
});

describe("${name} — accessibility", () => {
  it("has no unexpected axe violations when closed", async () => {
    const root = await mountTooltip({ withSlottedHost: true });
    const results = (await axe(root)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  it("has no unexpected axe violations when open", async () => {
    const root = await mountTooltip({ withSlottedHost: true, defaultOpen: true });
    const results = (await axe(root)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});`;

  return [
    `// @generated:start imports`,
    importsBody,
    `// @generated:end`,
    ``,
    `// @generated:start tests`,
    helpersBody,
    ``,
    testsBody,
    `// @generated:end`,
    ``,
    `// @custom:start tests`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}

/**
 * Lit Popover test scaffold. Mirrors React/Vue/Svelte Popover atom
 * coverage: contract-essential behavioral coverage (click opens,
 * click toggles, Escape closes, outside-click closes, aria-controls
 * + aria-expanded wiring, onOpenChange, disabled suppression,
 * unmount cleanup) plus slot-based host adoption. Lit registers the
 * anchor through `slot.assignedElements` capture, so the adopted
 * <a> host receives DOM listeners directly from the substrate.
 */
function emitPopoverTests(ir: ComponentIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const rootTag = tagFor(name);
  const triggerTag = `${rootTag}-trigger`;
  const contentTag = `${rootTag}-content`;

  const importsBody = [
    `import { describe, it, expect, vi, afterEach } from "vitest";`,
    `import { axe } from "vitest-axe";`,
    `import "../${name}.js";`,
    ``,
    `declare module "vitest" {`,
    `  interface Assertion<T> {`,
    `    toHaveNoViolations(): void;`,
    `  }`,
    `}`,
    ``,
    `async function settle(el: Element): Promise<void> {`,
    `  await (el as Element & { updateComplete?: Promise<unknown> }).updateComplete;`,
    `  await Promise.resolve();`,
    `  await Promise.resolve();`,
    `}`,
  ].join("\n");

  const helpersBody = `interface MountOptions {
  defaultOpen?: boolean;
  open?: boolean;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  closeOnOutsideClick?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, slot an <a href="#open"> as the consumer-rendered
   *  host. Otherwise the default-host <button> path is exercised. */
  withSlottedHost?: boolean;
}

async function mountPopover(opts: MountOptions = {}): Promise<HTMLElement> {
  await Promise.all([
    customElements.whenDefined("${rootTag}"),
    customElements.whenDefined("${triggerTag}"),
    customElements.whenDefined("${contentTag}"),
  ]);
  const root = document.createElement("${rootTag}") as HTMLElement;
  const props = root as unknown as Record<string, unknown>;
  if (opts.defaultOpen !== undefined) props.defaultOpen = opts.defaultOpen;
  if (opts.open !== undefined) props.open = opts.open;
  if (opts.disabled !== undefined) props.disabled = opts.disabled;
  if (opts.closeOnEscape !== undefined) props.closeOnEscape = opts.closeOnEscape;
  if (opts.closeOnBlur !== undefined) props.closeOnBlur = opts.closeOnBlur;
  if (opts.closeOnOutsideClick !== undefined) props.closeOnOutsideClick = opts.closeOnOutsideClick;
  if (opts.onOpenChange) props.onOpenChange = opts.onOpenChange;

  const trigger = document.createElement("${triggerTag}") as HTMLElement;
  trigger.setAttribute("data-testid", "trigger-wrapper");
  if (opts.withSlottedHost) {
    const a = document.createElement("a");
    a.setAttribute("href", "#open");
    a.setAttribute("data-testid", "slotted-host");
    a.textContent = "Open";
    trigger.appendChild(a);
  }

  const content = document.createElement("${contentTag}") as HTMLElement;
  content.setAttribute("data-testid", "content");
  content.textContent = "Body";

  root.appendChild(trigger);
  root.appendChild(content);
  document.body.appendChild(root);

  await settle(root);
  await settle(trigger);
  await settle(content);
  return root;
}

function getAnchor(root: HTMLElement, withSlottedHost: boolean): HTMLElement {
  if (withSlottedHost) {
    return root.querySelector("[data-testid='slotted-host']") as HTMLElement;
  }
  const trigger = root.querySelector("${triggerTag}") as HTMLElement;
  return trigger.shadowRoot!.querySelector("button") as HTMLElement;
}

function getContentEl(root: HTMLElement): HTMLElement | null {
  const host = root.querySelector("${contentTag}") as HTMLElement;
  return host.hasAttribute("data-${cssPrefix}-content") ? host : null;
}

afterEach(() => {
  document.body.innerHTML = "";
});`;

  const testsBody = `describe("${name} — compound API surface (default-host)", () => {
  it("renders the trigger but not the content when closed", async () => {
    const root = await mountPopover();
    expect(getAnchor(root, false)).toBeTruthy();
    expect(getContentEl(root)).toBeNull();
  });

  it("renders the content when defaultOpen=true", async () => {
    const root = await mountPopover({ defaultOpen: true });
    const content = getContentEl(root);
    expect(content).toBeTruthy();
  });

  it("opens on click of the default <button>", async () => {
    const root = await mountPopover();
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("toggles closed on a second click of the default <button>", async () => {
    const root = await mountPopover({ defaultOpen: true });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("closes on Escape", async () => {
    const root = await mountPopover({ defaultOpen: true });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("closes on outside-click", async () => {
    const root = await mountPopover({ defaultOpen: true });
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("click on content does not count as outside-click", async () => {
    const root = await mountPopover({ defaultOpen: true });
    const content = getContentEl(root)!;
    content.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("wires aria-controls + aria-expanded on the anchor when open", async () => {
    const root = await mountPopover({ defaultOpen: true });
    const anchor = getAnchor(root, false);
    const content = getContentEl(root)!;
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(anchor.getAttribute("aria-controls")).toBe(id);
    expect(anchor.getAttribute("aria-expanded")).toBe("true");
  });

  it("aria-expanded reflects closed state", async () => {
    const root = await mountPopover();
    const anchor = getAnchor(root, false);
    expect(anchor.getAttribute("aria-expanded")).toBe("false");
  });

  it("fires onOpenChange on uncontrolled open", async () => {
    const spy = vi.fn();
    const root = await mountPopover({ onOpenChange: spy });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle(root);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — click does not open", async () => {
    const root = await mountPopover({ disabled: true });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
  });

  it("controlled open prop overrides internal state", async () => {
    const root = await mountPopover({ open: false });
    const anchor = getAnchor(root, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeNull();
    (root as unknown as Record<string, unknown>).open = true;
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("closeOnEscape=false prevents Escape dismissal", async () => {
    const root = await mountPopover({ defaultOpen: true, closeOnEscape: false });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("closeOnOutsideClick=false prevents outside-click dismissal", async () => {
    const root = await mountPopover({ defaultOpen: true, closeOnOutsideClick: false });
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("disconnecting the root removes document-level listeners", async () => {
    const spy = vi.fn();
    const root = await mountPopover({ defaultOpen: true, onOpenChange: spy });
    root.remove();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("${name} — slot-based host adoption", () => {
  it("captures the slotted <a> as the anchor", async () => {
    const root = await mountPopover({ withSlottedHost: true });
    const anchor = getAnchor(root, true);
    expect(anchor.tagName).toBe("A");
    expect(anchor.hasAttribute("data-${cssPrefix}-trigger")).toBe(true);
  });

  it("click on the slotted anchor opens the popover", async () => {
    const root = await mountPopover({ withSlottedHost: true });
    const anchor = getAnchor(root, true);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle(root);
    expect(getContentEl(root)).toBeTruthy();
  });

  it("aria-controls + aria-expanded wire to the slotted anchor when open", async () => {
    const root = await mountPopover({ withSlottedHost: true, defaultOpen: true });
    const anchor = getAnchor(root, true);
    const content = getContentEl(root)!;
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(anchor.getAttribute("aria-controls")).toBe(id);
    expect(anchor.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("${name} — accessibility", () => {
  it("has no unexpected axe violations when closed", async () => {
    const root = await mountPopover({ withSlottedHost: true });
    const results = (await axe(root)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  it("has no unexpected axe violations when open", async () => {
    const root = await mountPopover({ withSlottedHost: true, defaultOpen: true });
    const results = (await axe(root)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});`;

  return [
    `// @generated:start imports`,
    importsBody,
    `// @generated:end`,
    ``,
    `// @generated:start tests`,
    helpersBody,
    ``,
    testsBody,
    `// @generated:end`,
    ``,
    `// @custom:start tests`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
