// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { CommandComponent } from "../Command.component";
// @generated:end

// @generated:start tests
describe("Command — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CommandComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(CommandComponent);
    expect(fixture.componentInstance).toBeInstanceOf(CommandComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(CommandComponent);
    expect(classTokens(fixture.componentInstance)).toContain("command");
  });
});

describe("Command — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CommandComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(CommandComponent);
    const onOpenChangeSpy = jest.fn();
    fixture.componentInstance.open = true;
    fixture.componentInstance.onOpenChange = onOpenChangeSpy;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Command — overlay-click dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CommandComponent] });
  });

  it("closes on overlay click", () => {
    const fixture = TestBed.createComponent(CommandComponent);
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
