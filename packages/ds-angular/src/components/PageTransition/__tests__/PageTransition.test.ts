// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { PageTransitionComponent } from "../PageTransition.component";
// @generated:end

// @generated:start tests
describe("PageTransition — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PageTransitionComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(PageTransitionComponent);
    expect(fixture.componentInstance).toBeInstanceOf(PageTransitionComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(PageTransitionComponent);
    expect(classTokens(fixture.componentInstance)).toContain("page-transition");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
