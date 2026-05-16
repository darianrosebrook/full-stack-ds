// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { ToastComponent } from "../Toast.component";
// @generated:end

// @generated:start tests
describe("Toast — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(fixture.componentInstance).toBeInstanceOf(ToastComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(classTokens(fixture.componentInstance)).toContain("toast");
  });

  it("applies variant=info variant class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentInstance.variant = "info";
    expect(classTokens(fixture.componentInstance)).toContain("toast--info");
  });

  it("applies variant=success variant class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentInstance.variant = "success";
    expect(classTokens(fixture.componentInstance)).toContain("toast--success");
  });

  it("applies variant=warning variant class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentInstance.variant = "warning";
    expect(classTokens(fixture.componentInstance)).toContain("toast--warning");
  });

  it("applies variant=error variant class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentInstance.variant = "error";
    expect(classTokens(fixture.componentInstance)).toContain("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentInstance.politeness = "polite";
    expect(classTokens(fixture.componentInstance)).toContain("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentInstance.politeness = "assertive";
    expect(classTokens(fixture.componentInstance)).toContain("toast--assertive");
  });
});

describe("Toast — Escape dismissal", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastComponent] });
  });

  it("closes on Escape key", () => {
    const fixture = TestBed.createComponent(ToastComponent);
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
