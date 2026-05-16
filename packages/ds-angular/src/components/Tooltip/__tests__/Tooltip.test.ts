// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { TooltipComponent } from "../Tooltip.component";
// @generated:end

// @generated:start tests
describe("Tooltip — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TooltipComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    expect(fixture.componentInstance).toBeInstanceOf(TooltipComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    expect(classTokens(fixture.componentInstance)).toContain("tooltip");
  });

  it("applies placement=top variant class", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentInstance.placement = "top";
    expect(classTokens(fixture.componentInstance)).toContain("tooltip--top");
  });

  it("applies placement=bottom variant class", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentInstance.placement = "bottom";
    expect(classTokens(fixture.componentInstance)).toContain("tooltip--bottom");
  });

  it("applies placement=left variant class", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentInstance.placement = "left";
    expect(classTokens(fixture.componentInstance)).toContain("tooltip--left");
  });

  it("applies placement=right variant class", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentInstance.placement = "right";
    expect(classTokens(fixture.componentInstance)).toContain("tooltip--right");
  });

  it("applies placement=auto variant class", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
    fixture.componentInstance.placement = "auto";
    expect(classTokens(fixture.componentInstance)).toContain("tooltip--auto");
  });
});

describe("Tooltip — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TooltipComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(TooltipComponent);
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
