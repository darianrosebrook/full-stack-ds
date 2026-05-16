// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { AnimatedTextComponent } from "../AnimatedText.component";
// @generated:end

// @generated:start tests
describe("AnimatedText — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AnimatedTextComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    expect(fixture.componentInstance).toBeInstanceOf(AnimatedTextComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    expect(classTokens(fixture.componentInstance)).toContain("animated-text");
  });

  it("applies as=h1 variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "h1";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--h1");
  });

  it("applies as=h2 variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "h2";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--h2");
  });

  it("applies as=h3 variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "h3";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--h3");
  });

  it("applies as=h4 variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "h4";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--h4");
  });

  it("applies as=h5 variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "h5";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--h5");
  });

  it("applies as=h6 variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "h6";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--h6");
  });

  it("applies as=p variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "p";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--p");
  });

  it("applies as=span variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "span";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--span");
  });

  it("applies as=div variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.as = "div";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--div");
  });

  it("applies variant=blur-in variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.variant = "blur-in";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--blur-in");
  });

  it("applies variant=fade-up variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.variant = "fade-up";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--fade-up");
  });

  it("applies variant=slide-in variant class", () => {
    const fixture = TestBed.createComponent(AnimatedTextComponent);
    fixture.componentInstance.variant = "slide-in";
    expect(classTokens(fixture.componentInstance)).toContain("animated-text--slide-in");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
