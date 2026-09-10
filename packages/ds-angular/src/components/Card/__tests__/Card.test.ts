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
