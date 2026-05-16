// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { AccordionComponent } from "../Accordion.component";
// @generated:end

// @generated:start tests
describe("Accordion — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AccordionComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    expect(fixture.componentInstance).toBeInstanceOf(AccordionComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    expect(classTokens(fixture.componentInstance)).toContain("accordion");
  });

  it("applies type=single variant class", () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    fixture.componentInstance.type = "single";
    expect(classTokens(fixture.componentInstance)).toContain("accordion--single");
  });

  it("applies type=multiple variant class", () => {
    const fixture = TestBed.createComponent(AccordionComponent);
    fixture.componentInstance.type = "multiple";
    expect(classTokens(fixture.componentInstance)).toContain("accordion--multiple");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
