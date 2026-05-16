// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { DialogComponent } from "../Dialog.component";
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    expect(fixture.componentInstance).toBeInstanceOf(DialogComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    expect(classTokens(fixture.componentInstance)).toContain("dialog");
  });

  it("applies size=sm variant class", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    fixture.componentInstance.size = "sm";
    expect(classTokens(fixture.componentInstance)).toContain("dialog--sm");
  });

  it("applies size=md variant class", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    fixture.componentInstance.size = "md";
    expect(classTokens(fixture.componentInstance)).toContain("dialog--md");
  });

  it("applies size=lg variant class", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    fixture.componentInstance.size = "lg";
    expect(classTokens(fixture.componentInstance)).toContain("dialog--lg");
  });

  it("applies size=xl variant class", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    fixture.componentInstance.size = "xl";
    expect(classTokens(fixture.componentInstance)).toContain("dialog--xl");
  });

  it("applies size=full variant class", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    fixture.componentInstance.size = "full";
    expect(classTokens(fixture.componentInstance)).toContain("dialog--full");
  });
});

describe("Dialog — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    const onOpenChangeSpy = jest.fn();
    fixture.componentInstance.open = true;
    fixture.componentInstance.onOpenChange = onOpenChangeSpy;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Dialog — overlay-click dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogComponent] });
  });

  it("closes on overlay click", () => {
    const fixture = TestBed.createComponent(DialogComponent);
    const onOpenChangeSpy = jest.fn();
    fixture.componentInstance.open = true;
    fixture.componentInstance.onOpenChange = onOpenChangeSpy;
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('[role="presentation"]') as HTMLElement;
    overlay?.click();
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
