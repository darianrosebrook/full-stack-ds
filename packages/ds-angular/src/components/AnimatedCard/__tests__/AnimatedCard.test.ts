// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { AnimatedCardComponent } from "../AnimatedCard.component";
// @generated:end

// @generated:start tests
describe("AnimatedCard — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AnimatedCardComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(AnimatedCardComponent);
    expect(fixture.componentInstance).toBeInstanceOf(AnimatedCardComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(AnimatedCardComponent);
    expect(classTokens(fixture.componentInstance)).toContain("animated-card");
  });

  it("applies as=article variant class", () => {
    const fixture = TestBed.createComponent(AnimatedCardComponent);
    fixture.componentInstance.as = "article";
    expect(classTokens(fixture.componentInstance)).toContain("animated-card--article");
  });

  it("applies as=div variant class", () => {
    const fixture = TestBed.createComponent(AnimatedCardComponent);
    fixture.componentInstance.as = "div";
    expect(classTokens(fixture.componentInstance)).toContain("animated-card--div");
  });

  it("applies as=li variant class", () => {
    const fixture = TestBed.createComponent(AnimatedCardComponent);
    fixture.componentInstance.as = "li";
    expect(classTokens(fixture.componentInstance)).toContain("animated-card--li");
  });

  it("applies as=a variant class", () => {
    const fixture = TestBed.createComponent(AnimatedCardComponent);
    fixture.componentInstance.as = "a";
    expect(classTokens(fixture.componentInstance)).toContain("animated-card--a");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
