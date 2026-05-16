// @generated:start imports
import { describe, expect, it } from "@jest/globals";
import { TableComponent } from "../Table.component";
// @generated:end

// @generated:start tests
describe("Table — unit", () => {
  it("creates the component class", () => {
    expect(new TableComponent()).toBeInstanceOf(TableComponent);
  });

  it("applies the base CSS class", () => {
    const component = new TableComponent();
    expect(classTokens(component)).toContain("table");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
