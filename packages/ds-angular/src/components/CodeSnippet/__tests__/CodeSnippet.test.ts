// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { CodeSnippetComponent } from "../CodeSnippet.component";
// @generated:end

// @generated:start tests
describe("CodeSnippet — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CodeSnippetComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(CodeSnippetComponent);
    expect(fixture.componentInstance).toBeInstanceOf(CodeSnippetComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(CodeSnippetComponent);
    expect(classTokens(fixture.componentInstance)).toContain("code-snippet");
  });

  it("applies as=code variant class", () => {
    const fixture = TestBed.createComponent(CodeSnippetComponent);
    fixture.componentInstance.as = "code";
    expect(classTokens(fixture.componentInstance)).toContain("code-snippet--code");
  });

  it("applies as=kbd variant class", () => {
    const fixture = TestBed.createComponent(CodeSnippetComponent);
    fixture.componentInstance.as = "kbd";
    expect(classTokens(fixture.componentInstance)).toContain("code-snippet--kbd");
  });

  it("applies as=samp variant class", () => {
    const fixture = TestBed.createComponent(CodeSnippetComponent);
    fixture.componentInstance.as = "samp";
    expect(classTokens(fixture.componentInstance)).toContain("code-snippet--samp");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
