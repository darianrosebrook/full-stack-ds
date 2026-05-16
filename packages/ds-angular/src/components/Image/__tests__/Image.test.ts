// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { ImageComponent } from "../Image.component";
// @generated:end

// @generated:start tests
describe("Image — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ImageComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    expect(fixture.componentInstance).toBeInstanceOf(ImageComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    expect(classTokens(fixture.componentInstance)).toContain("image");
  });

  it("applies size=xs variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.size = "xs";
    expect(classTokens(fixture.componentInstance)).toContain("image--xs");
  });

  it("applies size=sm variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.size = "sm";
    expect(classTokens(fixture.componentInstance)).toContain("image--sm");
  });

  it("applies size=md variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.size = "md";
    expect(classTokens(fixture.componentInstance)).toContain("image--md");
  });

  it("applies size=lg variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.size = "lg";
    expect(classTokens(fixture.componentInstance)).toContain("image--lg");
  });

  it("applies size=xl variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.size = "xl";
    expect(classTokens(fixture.componentInstance)).toContain("image--xl");
  });

  it("applies size=full variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.size = "full";
    expect(classTokens(fixture.componentInstance)).toContain("image--full");
  });

  it("applies radius=none variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.radius = "none";
    expect(classTokens(fixture.componentInstance)).toContain("image--none");
  });

  it("applies radius=sm variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.radius = "sm";
    expect(classTokens(fixture.componentInstance)).toContain("image--sm");
  });

  it("applies radius=md variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.radius = "md";
    expect(classTokens(fixture.componentInstance)).toContain("image--md");
  });

  it("applies radius=lg variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.radius = "lg";
    expect(classTokens(fixture.componentInstance)).toContain("image--lg");
  });

  it("applies radius=full variant class", () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentInstance.radius = "full";
    expect(classTokens(fixture.componentInstance)).toContain("image--full");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
