// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { PopoverComponent } from "../Popover.component";
// @generated:end

// @generated:start tests
describe("Popover — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PopoverComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    expect(fixture.componentInstance).toBeInstanceOf(PopoverComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    expect(classTokens(fixture.componentInstance)).toContain("popover");
  });

  it("applies placement=top variant class", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentInstance.placement = "top";
    expect(classTokens(fixture.componentInstance)).toContain("popover--top");
  });

  it("applies placement=bottom variant class", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentInstance.placement = "bottom";
    expect(classTokens(fixture.componentInstance)).toContain("popover--bottom");
  });

  it("applies placement=left variant class", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentInstance.placement = "left";
    expect(classTokens(fixture.componentInstance)).toContain("popover--left");
  });

  it("applies placement=right variant class", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentInstance.placement = "right";
    expect(classTokens(fixture.componentInstance)).toContain("popover--right");
  });

  it("applies placement=auto variant class", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    fixture.componentInstance.placement = "auto";
    expect(classTokens(fixture.componentInstance)).toContain("popover--auto");
  });
});

describe("Popover — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PopoverComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(PopoverComponent);
    const onOpenChangeSpy = jest.fn();
    fixture.componentInstance.open = true;
    fixture.componentInstance.onOpenChange = onOpenChangeSpy;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
