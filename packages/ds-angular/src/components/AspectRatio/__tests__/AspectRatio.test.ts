// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { AspectRatioComponent } from "../AspectRatio.component";
// @generated:end

// @generated:start tests
describe("AspectRatio — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AspectRatioComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(AspectRatioComponent);
    expect(fixture.componentInstance).toBeInstanceOf(AspectRatioComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(AspectRatioComponent);
    expect(classTokens(fixture.componentInstance)).toContain("aspect-ratio");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
