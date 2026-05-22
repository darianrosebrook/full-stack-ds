// @generated:start imports
import { describe, expect, it } from "@jest/globals";
import { CardComponent } from "../Card.component";
// @generated:end

// @generated:start tests
describe("Card — unit", () => {
  it("creates the component class", () => {
    expect(new CardComponent()).toBeInstanceOf(CardComponent);
  });

  it("applies the base CSS class", () => {
    const component = new CardComponent();
    expect(classTokens(component)).toContain("card");
  });

  it("applies status=completed variant class", () => {
    const component = new CardComponent();
    component.status = "completed";
    expect(classTokens(component)).toContain("card--completed");
  });

  it("applies status=in-progress variant class", () => {
    const component = new CardComponent();
    component.status = "in-progress";
    expect(classTokens(component)).toContain("card--in-progress");
  });

  it("applies status=planned variant class", () => {
    const component = new CardComponent();
    component.status = "planned";
    expect(classTokens(component)).toContain("card--planned");
  });

  it("applies status=deprecated variant class", () => {
    const component = new CardComponent();
    component.status = "deprecated";
    expect(classTokens(component)).toContain("card--deprecated");
  });

  it("applies status=category variant class", () => {
    const component = new CardComponent();
    component.status = "category";
    expect(classTokens(component)).toContain("card--category");
  });

  it("applies status=complexity variant class", () => {
    const component = new CardComponent();
    component.status = "complexity";
    expect(classTokens(component)).toContain("card--complexity");
  });

  it("applies density=default variant class", () => {
    const component = new CardComponent();
    component.density = "default";
    expect(classTokens(component)).toContain("card--default");
  });

  it("applies density=inset variant class", () => {
    const component = new CardComponent();
    component.density = "inset";
    expect(classTokens(component)).toContain("card--inset");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
