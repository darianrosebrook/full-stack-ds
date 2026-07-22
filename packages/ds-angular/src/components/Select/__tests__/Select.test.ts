// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { SelectComponent } from "../Select.component";
// @generated:end

// @generated:start tests
describe("Select — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SelectComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    expect(fixture.componentInstance).toBeInstanceOf(SelectComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    expect(classTokens(fixture.componentInstance)).toContain("select");
  });

  it("toggles the open channel from the trigger click", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    const seen: boolean[] = [];
    fixture.componentInstance.onOpenChange = (v: boolean) => seen.push(v);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(".select__trigger") as HTMLElement;
    host.click();
    expect(seen).toEqual([false]);
  });

  it("applies size=sm variant class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentInstance.size = "sm";
    expect(classTokens(fixture.componentInstance)).toContain("select--sm");
  });

  it("applies size=md variant class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentInstance.size = "md";
    expect(classTokens(fixture.componentInstance)).toContain("select--md");
  });

  it("applies size=lg variant class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentInstance.size = "lg";
    expect(classTokens(fixture.componentInstance)).toContain("select--lg");
  });

  it("applies position=bottom variant class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentInstance.position = "bottom";
    expect(classTokens(fixture.componentInstance)).toContain("select--bottom");
  });

  it("applies position=top variant class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentInstance.position = "top";
    expect(classTokens(fixture.componentInstance)).toContain("select--top");
  });

  it("applies position=auto variant class", () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentInstance.position = "auto";
    expect(classTokens(fixture.componentInstance)).toContain("select--auto");
  });
});

describe("Select — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SelectComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(SelectComponent);
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
