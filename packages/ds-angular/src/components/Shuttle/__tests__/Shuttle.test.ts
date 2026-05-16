// @generated:start imports
import { describe, expect, it } from "@jest/globals";
import { ShuttleComponent } from "../Shuttle.component";
// @generated:end

// @generated:start tests
describe("Shuttle — unit", () => {
  it("creates the component class", () => {
    expect(new ShuttleComponent()).toBeInstanceOf(ShuttleComponent);
  });

  it("applies the base CSS class", () => {
    const component = new ShuttleComponent();
    expect(classTokens(component)).toContain("shuttle");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
