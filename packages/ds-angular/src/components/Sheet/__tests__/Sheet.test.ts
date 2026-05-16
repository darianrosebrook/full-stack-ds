// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { SheetComponent } from "../Sheet.component";
// @generated:end

// @generated:start tests
describe("Sheet — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SheetComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    expect(fixture.componentInstance).toBeInstanceOf(SheetComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    expect(classTokens(fixture.componentInstance)).toContain("sheet");
  });

  it("applies side=top variant class", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    fixture.componentInstance.side = "top";
    expect(classTokens(fixture.componentInstance)).toContain("sheet--top");
  });

  it("applies side=right variant class", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    fixture.componentInstance.side = "right";
    expect(classTokens(fixture.componentInstance)).toContain("sheet--right");
  });

  it("applies side=bottom variant class", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    fixture.componentInstance.side = "bottom";
    expect(classTokens(fixture.componentInstance)).toContain("sheet--bottom");
  });

  it("applies side=left variant class", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    fixture.componentInstance.side = "left";
    expect(classTokens(fixture.componentInstance)).toContain("sheet--left");
  });
});

describe("Sheet — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SheetComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(SheetComponent);
    const onOpenChangeSpy = jest.fn();
    fixture.componentInstance.open = true;
    fixture.componentInstance.onOpenChange = onOpenChangeSpy;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — overlay-click dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SheetComponent] });
  });

  it("closes on overlay click", () => {
    const fixture = TestBed.createComponent(SheetComponent);
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
