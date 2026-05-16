// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { IconComponent } from "../Icon.component";
// @generated:end

// @generated:start tests
describe("Icon — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IconComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(IconComponent);
    expect(fixture.componentInstance).toBeInstanceOf(IconComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(IconComponent);
    expect(classTokens(fixture.componentInstance)).toContain("icon");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
