// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Table from "../Table.vue";
// @generated:end

// @generated:start tests
describe("Table — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Table as Component, { props: {}, attrs: { "data-testid": "table" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Table as Component, { props: {}, attrs: { "data-testid": "table" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("table");
  });

  it("merges custom class", () => {
    const wrapper = mount(Table as Component, { props: {}, attrs: { "data-testid": "table", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("table");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Table — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Table as Component, { props: {}, attrs: { "data-testid": "table", "aria-label": "Test Table" }, slots: { default: "content" } });
    const results = await axe(wrapper.element);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "list",
      "region",
      "role-img-alt",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import TableCell from "../TableCell.vue";
import TableHeaderCell from "../TableHeaderCell.vue";

// SHOWCASE-CONSUMPTION-03 A1 — the Vue cell/header SFCs own their <td>/<th>,
// so they must forward the HTML attributes a real data table needs.
describe("Table — cell attribute forwarding", () => {
  it("TableCell forwards colspan/id/style onto the <td>", () => {
    const wrapper = mount(TableCell as Component, {
      props: { colSpan: 4, id: "cell-1", style: "text-align: center" },
      slots: { default: "Section" },
    });
    expect(wrapper.element.tagName).toBe("TD");
    expect(wrapper.attributes("colspan")).toBe("4");
    expect(wrapper.attributes("id")).toBe("cell-1");
    expect(wrapper.attributes("style") ?? "").toContain("text-align");
  });

  it("TableHeaderCell forwards scope/rowspan onto the <th>", () => {
    const wrapper = mount(TableHeaderCell as Component, {
      props: { scope: "col", rowSpan: 2 },
      slots: { default: "H" },
    });
    expect(wrapper.element.tagName).toBe("TH");
    expect(wrapper.attributes("scope")).toBe("col");
    expect(wrapper.attributes("rowspan")).toBe("2");
  });

  it("omits unset attributes (no empty colspan/id)", () => {
    const wrapper = mount(TableCell as Component, { slots: { default: "x" } });
    expect(wrapper.attributes("colspan")).toBeUndefined();
    expect(wrapper.attributes("id")).toBeUndefined();
  });
});
// @custom:end
