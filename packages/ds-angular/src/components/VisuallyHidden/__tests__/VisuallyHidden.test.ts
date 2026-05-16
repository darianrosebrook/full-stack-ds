// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { VisuallyHiddenComponent } from "../VisuallyHidden.component";
// @generated:end

// @generated:start tests
describe("VisuallyHidden — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [VisuallyHiddenComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(VisuallyHiddenComponent);
    expect(fixture.componentInstance).toBeInstanceOf(VisuallyHiddenComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(VisuallyHiddenComponent);
    expect(classTokens(fixture.componentInstance)).toContain("visually-hidden");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
