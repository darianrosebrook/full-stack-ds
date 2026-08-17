// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { MarkdownComponent } from "../Markdown.component";
// @generated:end

// @generated:start tests
describe("Markdown — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MarkdownComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(MarkdownComponent);
    expect(fixture.componentInstance).toBeInstanceOf(MarkdownComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(MarkdownComponent);
    expect(classTokens(fixture.componentInstance)).toContain("markdown");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
