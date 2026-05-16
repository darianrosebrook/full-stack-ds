// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { SlinkyCursorComponent } from "../SlinkyCursor.component";
// @generated:end

// @generated:start tests
describe("SlinkyCursor — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SlinkyCursorComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(SlinkyCursorComponent);
    expect(fixture.componentInstance).toBeInstanceOf(SlinkyCursorComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(SlinkyCursorComponent);
    expect(classTokens(fixture.componentInstance)).toContain("slinky-cursor");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
