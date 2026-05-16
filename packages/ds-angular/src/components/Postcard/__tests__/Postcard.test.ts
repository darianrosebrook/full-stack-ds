// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { PostcardComponent } from "../Postcard.component";
// @generated:end

// @generated:start tests
describe("Postcard — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PostcardComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(PostcardComponent);
    expect(fixture.componentInstance).toBeInstanceOf(PostcardComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(PostcardComponent);
    expect(classTokens(fixture.componentInstance)).toContain("postcard");
  });

  it("applies type=image variant class", () => {
    const fixture = TestBed.createComponent(PostcardComponent);
    fixture.componentInstance.type = "image";
    expect(classTokens(fixture.componentInstance)).toContain("postcard--image");
  });

  it("applies type=video variant class", () => {
    const fixture = TestBed.createComponent(PostcardComponent);
    fixture.componentInstance.type = "video";
    expect(classTokens(fixture.componentInstance)).toContain("postcard--video");
  });

  it("applies type=audio variant class", () => {
    const fixture = TestBed.createComponent(PostcardComponent);
    fixture.componentInstance.type = "audio";
    expect(classTokens(fixture.componentInstance)).toContain("postcard--audio");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
