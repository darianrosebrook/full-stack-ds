// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { BrandSwitcherComponent } from "../BrandSwitcher.component";
// @generated:end

// @generated:start tests
describe("BrandSwitcher — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BrandSwitcherComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(BrandSwitcherComponent);
    expect(fixture.componentInstance).toBeInstanceOf(BrandSwitcherComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(BrandSwitcherComponent);
    expect(classTokens(fixture.componentInstance)).toContain("brand-switcher");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
