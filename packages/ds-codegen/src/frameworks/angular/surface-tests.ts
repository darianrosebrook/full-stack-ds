/**
 * Angular behavioral tests for the Anchored Presence Surface family.
 *
 * Parity with React (499ed17), Vue (38454fe), Svelte (43863a0,
 * 29f3fb4), and Lit (c4ed447). Covers default-host vs directive-based
 * host adoption, ARIA wiring, controlled/uncontrolled state, disabled
 * suppression, closeOn* opt-outs, grace path, unmount cleanup, and
 * the consumer-preventDefault opt-out.
 *
 * Stack: Jest + jest-preset-angular + TestBed. Native event dispatch.
 */
import type { ComponentIR } from "../../ir.js";

export function generateAngularSurfaceTest(ir: ComponentIR): string {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateAngularSurfaceTest called on ${ir.name} without ir.surface`,
    );
  }
  if (surface.kind !== "tooltip") {
    throw new Error(
      `Angular surface test emitter only supports kind "tooltip" in F-2C-4 (got "${surface.kind}").`,
    );
  }
  return emitTooltipTests(ir);
}

function kebab(name: string): string {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
}

function emitTooltipTests(ir: ComponentIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const rootTag = `fsds-${kebab(name)}`;
  const triggerTag = `${rootTag}-trigger`;
  const contentTag = `${rootTag}-content`;

  const importsBody = [
    `import { describe, expect, it, beforeEach, jest } from "@jest/globals";`,
    `import { Component } from "@angular/core";`,
    `import { TestBed } from "@angular/core/testing";`,
    `import { ${name}Component } from "../${name}.component";`,
    `import { ${name}TriggerComponent } from "../${name}Trigger.component";`,
    `import { ${name}TriggerDirective } from "../${name}Trigger.directive";`,
    `import { ${name}ContentComponent } from "../${name}Content.component";`,
    ``,
    `// jsdom doesn't ship PointerEvent. Polyfill via MouseEvent so the`,
    `// substrate's pointerenter/pointerleave listeners receive an event`,
    `// object with the right \`type\`, \`relatedTarget\`, \`cancelable\`, and`,
    `// \`defaultPrevented\` semantics. We only need the relatedTarget +`,
    `// defaultPrevented surface, so MouseEvent suffices.`,
    `if (typeof globalThis.PointerEvent === "undefined") {`,
    `  (globalThis as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = MouseEvent as unknown as typeof PointerEvent;`,
    `}`,
  ].join("\n");

  const testsBody = `function mount(setup: (host: TooltipFixture) => void = () => {}) {
  const fixture = TestBed.createComponent(TooltipFixture);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

async function settle(): Promise<void> {
  // Resolve queued microtasks (substrate open-triggers defer via
  // queueMicrotask for consumer-preventDefault support).
  await Promise.resolve();
  await Promise.resolve();
}

function getAnchor(host: HTMLElement, adopted: boolean): HTMLElement {
  if (adopted) return host.querySelector("[data-testid='anchor']") as HTMLElement;
  // Default-host: <fsds-tooltip-trigger> renders a <button> inside
  // itself, which the directive registers as the anchor.
  return host.querySelector("[data-testid='trigger-host'] button") as HTMLElement;
}

function getContentEl(host: HTMLElement): HTMLElement | null {
  const el = host.querySelector("[data-testid='content']") as HTMLElement | null;
  return el?.hasAttribute("data-${cssPrefix}-content") ? el : null;
}

beforeEach(() => {
  TestBed.configureTestingModule({ imports: [TooltipFixture] });
});

describe("${name} — compound API surface (default-host)", () => {
  it("renders the trigger but not the content when closed", () => {
    const fixture = mount();
    const host = fixture.nativeElement as HTMLElement;
    expect(getAnchor(host, false)).toBeTruthy();
    expect(getContentEl(host)).toBeNull();
  });

  it("renders the content when defaultOpen=true", () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    expect(getContentEl(host)).toBeTruthy();
    expect(getContentEl(host)?.getAttribute("role")).toBe("tooltip");
  });

  it("opens on pointerenter (hover) over the default <button>", async () => {
    const fixture = mount();
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("opens on focus over the default <button>", async () => {
    const fixture = mount();
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new FocusEvent("focus"));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("closes on pointerleave from the anchor (no grace path into content)", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, relatedTarget: document.body }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("closes on Escape", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("closes on focus leaving the surface boundary (focusout)", async () => {
    // Boundary semantics: the substrate listens via focusout
    // (which bubbles, unlike blur) for focus leaving the anchor +
    // content surface. Focus moving from anchor to an outside node
    // dismisses; focus moving from anchor INTO content does not.
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("wires aria-describedby from anchor to content when open", () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    const content = getContentEl(host)!;
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(anchor.getAttribute("aria-describedby")).toBe(id);
  });

  it("does NOT set aria-describedby when closed", () => {
    const fixture = mount();
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    expect(anchor.getAttribute("aria-describedby")).toBeNull();
  });

  it("fires onOpenChange on uncontrolled open", async () => {
    const spy = jest.fn();
    const fixture = mount((c) => { c.onOpenChange = spy; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — pointerenter does not open", async () => {
    const fixture = mount((c) => { c.disabled = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("disabled root does not fire onOpenChange on hover", async () => {
    const spy = jest.fn();
    const fixture = mount((c) => { c.disabled = true; c.onOpenChange = spy; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle();
    expect(spy).not.toHaveBeenCalled();
  });

  it("controlled open prop overrides internal state", async () => {
    // Phase 1: mount with open=false; verify pointerenter does NOT open.
    const fixture = mount((c) => { c.open = false; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
    // Phase 2: mount a fresh fixture with open=true; verify content is
    // rendered. We mount fresh instead of mutating because jest-preset-
    // angular's strict change-detection rejects post-detectChanges
    // mutation of consumer @Input bindings.
    fixture.destroy();
    const fixture2 = mount((c) => { c.open = true; });
    const host2 = fixture2.nativeElement as HTMLElement;
    expect(getContentEl(host2)).toBeTruthy();
  });

  it("pointerleave INTO content does not close (grace path)", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    const content = getContentEl(host)!;
    anchor.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, relatedTarget: content }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("closeOnEscape=false prevents Escape dismissal", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; c.closeOnEscape = false; });
    const host = fixture.nativeElement as HTMLElement;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("closeOnBlur=false prevents boundary-focusout dismissal", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; c.closeOnBlur = false; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("destroying the fixture removes document-level listeners", async () => {
    const spy = jest.fn();
    const fixture = mount((c) => { c.defaultOpen = true; c.onOpenChange = spy; });
    fixture.destroy();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("${name} — directive-based host adoption", () => {
  it("uses the adopted <a> as the actual anchor (no nested button)", () => {
    const fixture = mount((c) => { c.adopted = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    expect(anchor.tagName).toBe("A");
    expect(anchor.hasAttribute("data-${cssPrefix}-trigger")).toBe(true);
    // There should be NO <button> rendered alongside it because we
    // chose the adopted path.
    expect(host.querySelector("button")).toBeNull();
  });

  it("adopted host opens on pointerenter", async () => {
    const fixture = mount((c) => { c.adopted = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("adopted host opens on focus", async () => {
    const fixture = mount((c) => { c.adopted = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    anchor.dispatchEvent(new FocusEvent("focus"));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("adopted host receives aria-describedby when open", () => {
    const fixture = mount((c) => { c.adopted = true; c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    const content = getContentEl(host)!;
    expect(anchor.getAttribute("aria-describedby")).toBe(content.getAttribute("id"));
  });

  it("consumer event.preventDefault() suppresses the surface handler", async () => {
    const surfaceSpy = jest.fn();
    const fixture = mount((c) => {
      c.adopted = true;
      c.onOpenChange = surfaceSpy;
      c.onConsumerPointerEnter = (e) => e.preventDefault();
    });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    anchor.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, cancelable: true }));
    await settle();
    fixture.detectChanges();
    expect(surfaceSpy).not.toHaveBeenCalled();
    expect(getContentEl(host)).toBeNull();
  });
});`;

  return [
    `// @generated:start imports`,
    importsBody,
    `import { NgIf } from "@angular/common";`,
    `// @generated:end`,
    ``,
    `// @generated:start fixture`,
    // Use the corrected version (without the duplicate imports block)
    `@Component({`,
    `  selector: "${rootTag}-fixture",`,
    `  standalone: true,`,
    `  imports: [`,
    `    NgIf,`,
    `    ${name}Component,`,
    `    ${name}TriggerComponent,`,
    `    ${name}TriggerDirective,`,
    `    ${name}ContentComponent,`,
    `  ],`,
    `  template: \``,
    `    <${rootTag}`,
    `      [open]="open"`,
    `      [defaultOpen]="defaultOpen"`,
    `      [disabled]="disabled"`,
    `      [closeOnEscape]="closeOnEscape"`,
    `      [closeOnBlur]="closeOnBlur"`,
    `      [onOpenChange]="onOpenChange"`,
    `    >`,
    `      <ng-container *ngIf="adopted">`,
    `        <a fsds${name}Trigger href="#help" data-testid="anchor" (pointerenter)="onConsumerPointerEnter && onConsumerPointerEnter($event)">Save</a>`,
    `      </ng-container>`,
    `      <ng-container *ngIf="!adopted">`,
    `        <${triggerTag} data-testid="trigger-host">Save</${triggerTag}>`,
    `      </ng-container>`,
    `      <${contentTag} data-testid="content">Help text</${contentTag}>`,
    `    </${rootTag}>`,
    `  \`,`,
    `})`,
    `class TooltipFixture {`,
    `  open?: boolean;`,
    `  defaultOpen?: boolean;`,
    `  disabled?: boolean;`,
    `  closeOnEscape?: boolean;`,
    `  closeOnBlur?: boolean;`,
    `  adopted = false;`,
    `  onOpenChange?: (v: boolean) => void;`,
    `  onConsumerPointerEnter?: (e: PointerEvent) => void;`,
    `}`,
    `// @generated:end`,
    ``,
    `// @generated:start tests`,
    testsBody,
    `// @generated:end`,
    ``,
    `// @custom:start tests`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
