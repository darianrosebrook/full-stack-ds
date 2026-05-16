// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { AnimatedSectionComponent } from "../AnimatedSection.component";
// @generated:end

// @generated:start tests
describe("AnimatedSection — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AnimatedSectionComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    expect(fixture.componentInstance).toBeInstanceOf(AnimatedSectionComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    expect(classTokens(fixture.componentInstance)).toContain("animated-section");
  });

  it("applies as=section variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "section";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--section");
  });

  it("applies as=div variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "div";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--div");
  });

  it("applies as=article variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "article";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--article");
  });

  it("applies as=main variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "main";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--main");
  });

  it("applies as=aside variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "aside";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--aside");
  });

  it("applies as=header variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "header";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--header");
  });

  it("applies as=footer variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.as = "footer";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--footer");
  });

  it("applies variant=fade-up variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.variant = "fade-up";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--fade-up");
  });

  it("applies variant=fade-in variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.variant = "fade-in";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--fade-in");
  });

  it("applies variant=slide-in variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.variant = "slide-in";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--slide-in");
  });

  it("applies variant=stagger-children variant class", () => {
    const fixture = TestBed.createComponent(AnimatedSectionComponent);
    fixture.componentInstance.variant = "stagger-children";
    expect(classTokens(fixture.componentInstance)).toContain("animated-section--stagger-children");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
