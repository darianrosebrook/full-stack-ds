// @generated:start imports
import { describe, expect, it } from "@jest/globals";
import { AlertNoticeComponent } from "../AlertNotice.component";
// @generated:end

// @generated:start tests
describe("AlertNotice — unit", () => {
  it("creates the component class", () => {
    expect(new AlertNoticeComponent()).toBeInstanceOf(AlertNoticeComponent);
  });

  it("applies the base CSS class", () => {
    const component = new AlertNoticeComponent();
    expect(classTokens(component)).toContain("alert-notice");
  });

  it("applies status=info variant class", () => {
    const component = new AlertNoticeComponent();
    component.status = "info";
    expect(classTokens(component)).toContain("alert-notice--info");
  });

  it("applies status=success variant class", () => {
    const component = new AlertNoticeComponent();
    component.status = "success";
    expect(classTokens(component)).toContain("alert-notice--success");
  });

  it("applies status=warning variant class", () => {
    const component = new AlertNoticeComponent();
    component.status = "warning";
    expect(classTokens(component)).toContain("alert-notice--warning");
  });

  it("applies status=error variant class", () => {
    const component = new AlertNoticeComponent();
    component.status = "error";
    expect(classTokens(component)).toContain("alert-notice--error");
  });

  it("applies level=page variant class", () => {
    const component = new AlertNoticeComponent();
    component.level = "page";
    expect(classTokens(component)).toContain("alert-notice--page");
  });

  it("applies level=section variant class", () => {
    const component = new AlertNoticeComponent();
    component.level = "section";
    expect(classTokens(component)).toContain("alert-notice--section");
  });

  it("applies level=inline variant class", () => {
    const component = new AlertNoticeComponent();
    component.level = "inline";
    expect(classTokens(component)).toContain("alert-notice--inline");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
