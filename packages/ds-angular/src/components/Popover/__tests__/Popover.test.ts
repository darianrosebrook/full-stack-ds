// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { PopoverComponent } from "../Popover.component";
import { PopoverTriggerComponent } from "../PopoverTrigger.component";
import { PopoverTriggerDirective } from "../PopoverTrigger.directive";
import { PopoverContentComponent } from "../PopoverContent.component";
import { NgIf } from "@angular/common";
// @generated:end

// @generated:start fixture
@Component({
  selector: "fsds-popover-fixture",
  standalone: true,
  imports: [
    NgIf,
    PopoverComponent,
    PopoverTriggerComponent,
    PopoverTriggerDirective,
    PopoverContentComponent,
  ],
  template: `
    <fsds-popover
      [open]="open"
      [defaultOpen]="defaultOpen"
      [disabled]="disabled"
      [closeOnEscape]="closeOnEscape"
      [closeOnBlur]="closeOnBlur"
      [closeOnOutsideClick]="closeOnOutsideClick"
      [onOpenChange]="onOpenChange"
    >
      <ng-container *ngIf="adopted">
        <a fsdsPopoverTrigger href="#open" data-testid="anchor" (click)="onConsumerClick && onConsumerClick($event)">Open</a>
      </ng-container>
      <ng-container *ngIf="!adopted">
        <fsds-popover-trigger data-testid="trigger-host">Open</fsds-popover-trigger>
      </ng-container>
      <fsds-popover-content data-testid="content">Body</fsds-popover-content>
    </fsds-popover>
  `,
})
class PopoverFixture {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  closeOnOutsideClick?: boolean;
  adopted = false;
  onOpenChange?: (v: boolean) => void;
  onConsumerClick?: (e: MouseEvent) => void;
}
// @generated:end

// @generated:start tests
function mount(setup: (host: PopoverFixture) => void = () => {}) {
  const fixture = TestBed.createComponent(PopoverFixture);
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
  // Default-host: <fsds-popover-trigger> renders a <button> inside
  // itself, which the directive registers as the anchor.
  return host.querySelector("[data-testid='trigger-host'] button") as HTMLElement;
}

function getContentEl(host: HTMLElement): HTMLElement | null {
  const el = host.querySelector("[data-testid='content']") as HTMLElement | null;
  return el?.hasAttribute("data-popover-content") ? el : null;
}

beforeEach(() => {
  TestBed.configureTestingModule({ imports: [PopoverFixture] });
});

describe("Popover — compound API surface (default-host)", () => {
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
  });

  it("opens on click of the default <button>", async () => {
    const fixture = mount();
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("toggles closed on a second click of the default <button>", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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

  it("closes on outside-click", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("click inside content does not count as outside-click", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const content = getContentEl(host)!;
    content.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("focus moving from anchor into content stays open (boundary)", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    const content = getContentEl(host)!;
    anchor.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: content }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("focus moving from content to outside closes (boundary-focusout)", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const content = getContentEl(host)!;
    content.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("focus moving from anchor to outside closes (boundary-focusout)", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("wires aria-controls + aria-expanded on the anchor when open", () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    const content = getContentEl(host)!;
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(anchor.getAttribute("aria-controls")).toBe(id);
    expect(anchor.getAttribute("aria-expanded")).toBe("true");
  });

  it("aria-expanded reflects closed state", () => {
    const fixture = mount();
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    expect(anchor.getAttribute("aria-expanded")).toBe("false");
  });

  it("content has no forced ARIA role (policy: defaultContentRole=null)", () => {
    const fixture = mount((c) => { c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const content = getContentEl(host)!;
    expect(content.getAttribute("role")).toBeNull();
  });

  it("fires onOpenChange on uncontrolled open", async () => {
    const spy = jest.fn();
    const fixture = mount((c) => { c.onOpenChange = spy; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — click does not open", async () => {
    const fixture = mount((c) => { c.disabled = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeNull();
  });

  it("controlled open prop overrides internal state", async () => {
    // Phase 1: mount with open=false; verify click does NOT open.
    const fixture = mount((c) => { c.open = false; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, false);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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

  it("closeOnEscape=false prevents Escape dismissal", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; c.closeOnEscape = false; });
    const host = fixture.nativeElement as HTMLElement;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("closeOnOutsideClick=false prevents outside-click dismissal", async () => {
    const fixture = mount((c) => { c.defaultOpen = true; c.closeOnOutsideClick = false; });
    const host = fixture.nativeElement as HTMLElement;
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
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

describe("Popover — directive-based host adoption", () => {
  it("uses the adopted <a> as the actual anchor (no nested button)", () => {
    const fixture = mount((c) => { c.adopted = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    expect(anchor.tagName).toBe("A");
    expect(anchor.hasAttribute("data-popover-trigger")).toBe(true);
    expect(host.querySelector("button")).toBeNull();
  });

  it("adopted host opens on click", async () => {
    const fixture = mount((c) => { c.adopted = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await settle();
    fixture.detectChanges();
    expect(getContentEl(host)).toBeTruthy();
  });

  it("adopted host receives aria-controls + aria-expanded when open", () => {
    const fixture = mount((c) => { c.adopted = true; c.defaultOpen = true; });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    const content = getContentEl(host)!;
    expect(anchor.getAttribute("aria-controls")).toBe(content.getAttribute("id"));
    expect(anchor.getAttribute("aria-expanded")).toBe("true");
  });

  it("consumer event.preventDefault() suppresses the surface handler", async () => {
    const surfaceSpy = jest.fn();
    const fixture = mount((c) => {
      c.adopted = true;
      c.onOpenChange = surfaceSpy;
      c.onConsumerClick = (e) => e.preventDefault();
    });
    const host = fixture.nativeElement as HTMLElement;
    const anchor = getAnchor(host, true);
    anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await settle();
    fixture.detectChanges();
    expect(surfaceSpy).not.toHaveBeenCalled();
    expect(getContentEl(host)).toBeNull();
  });
});
// @generated:end

// @custom:start tests

// @custom:end
