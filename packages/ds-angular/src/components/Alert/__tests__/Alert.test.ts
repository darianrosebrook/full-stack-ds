// @generated:start imports
import { describe, expect, it } from "@jest/globals";
import { AlertComponent } from "../Alert.component";
// @generated:end

// @generated:start tests
describe("Alert — unit", () => {
  it("creates the component class", () => {
    expect(new AlertComponent()).toBeInstanceOf(AlertComponent);
  });

  it("applies the base CSS class", () => {
    const component = new AlertComponent();
    expect(classTokens(component)).toContain("alert");
  });

  it("applies intent=info variant class", () => {
    const component = new AlertComponent();
    component.intent = "info";
    expect(classTokens(component)).toContain("alert--info");
  });

  it("applies intent=success variant class", () => {
    const component = new AlertComponent();
    component.intent = "success";
    expect(classTokens(component)).toContain("alert--success");
  });

  it("applies intent=warning variant class", () => {
    const component = new AlertComponent();
    component.intent = "warning";
    expect(classTokens(component)).toContain("alert--warning");
  });

  it("applies intent=danger variant class", () => {
    const component = new AlertComponent();
    component.intent = "danger";
    expect(classTokens(component)).toContain("alert--danger");
  });

  it("applies level=inline variant class", () => {
    const component = new AlertComponent();
    component.level = "inline";
    expect(classTokens(component)).toContain("alert--inline");
  });

  it("applies level=section variant class", () => {
    const component = new AlertComponent();
    component.level = "section";
    expect(classTokens(component)).toContain("alert--section");
  });

  it("applies level=page variant class", () => {
    const component = new AlertComponent();
    component.level = "page";
    expect(classTokens(component)).toContain("alert--page");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
