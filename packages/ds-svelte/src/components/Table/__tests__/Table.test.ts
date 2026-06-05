// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Table from "../Table.svelte";
// @generated:end

// @generated:start tests
describe("Table — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Table as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Table as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("table");
  });

  it("merges custom class", () => {
    const { container } = render(Table as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("table");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("Table — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Table as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Table" } });
    const results = await axe(container);
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
import TableCell from "../TableCell.svelte";
import TableHeaderCell from "../TableHeaderCell.svelte";

// SHOWCASE-CONSUMPTION-03 A1 — the Svelte cell/header SFCs own their <td>/<th>,
// so they must forward the HTML attributes a real data table needs.
describe("Table — cell attribute forwarding", () => {
  it("TableCell forwards colspan/id/style onto the <td>", () => {
    const { container } = render(
      TableCell as unknown as Component<Record<string, unknown>>,
      { props: { colSpan: 4, id: "cell-1", style: "text-align: center" } },
    );
    const td = container.querySelector("td")!;
    expect(td).not.toBeNull();
    expect(td.getAttribute("colspan")).toBe("4");
    expect(td.getAttribute("id")).toBe("cell-1");
    expect(td.getAttribute("style") ?? "").toContain("text-align");
  });

  it("TableHeaderCell forwards scope/rowspan onto the <th>", () => {
    const { container } = render(
      TableHeaderCell as unknown as Component<Record<string, unknown>>,
      { props: { scope: "col", rowSpan: 2 } },
    );
    const th = container.querySelector("th")!;
    expect(th.getAttribute("scope")).toBe("col");
    expect(th.getAttribute("rowspan")).toBe("2");
  });

  it("omits unset attributes (no empty colspan/id)", () => {
    const { container } = render(
      TableCell as unknown as Component<Record<string, unknown>>,
      { props: {} },
    );
    const td = container.querySelector("td")!;
    expect(td.hasAttribute("colspan")).toBe(false);
    expect(td.hasAttribute("id")).toBe(false);
  });
});
// @custom:end
