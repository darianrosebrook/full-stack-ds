// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { FieldComponent } from "../Field.component";
// @generated:end

// @generated:start tests
describe("Field — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FieldComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(FieldComponent);
    expect(fixture.componentInstance).toBeInstanceOf(FieldComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(FieldComponent);
    expect(classTokens(fixture.componentInstance)).toContain("field");
  });

  it("applies status=idle variant class", () => {
    const fixture = TestBed.createComponent(FieldComponent);
    fixture.componentInstance.status = "idle";
    expect(classTokens(fixture.componentInstance)).toContain("field--idle");
  });

  it("applies status=validating variant class", () => {
    const fixture = TestBed.createComponent(FieldComponent);
    fixture.componentInstance.status = "validating";
    expect(classTokens(fixture.componentInstance)).toContain("field--validating");
  });

  it("applies status=valid variant class", () => {
    const fixture = TestBed.createComponent(FieldComponent);
    fixture.componentInstance.status = "valid";
    expect(classTokens(fixture.componentInstance)).toContain("field--valid");
  });

  it("applies status=invalid variant class", () => {
    const fixture = TestBed.createComponent(FieldComponent);
    fixture.componentInstance.status = "invalid";
    expect(classTokens(fixture.componentInstance)).toContain("field--invalid");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
