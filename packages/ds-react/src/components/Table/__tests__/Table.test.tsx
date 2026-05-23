// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Table, TableCaption, TableHead, TableBody, TableFooter, TableRow, TableHeaderCell, TableCell } from "../Table";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Table — unit", () => {
  it("renders with default props", () => {
    render(<Table data-testid="table">content</Table>);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Table data-testid="table">content</Table>);
    expect(screen.getByTestId("table")).toHaveClass("table");
  });

  it("merges custom className", () => {
    render(<Table data-testid="table" className="custom">content</Table>);
    expect(screen.getByTestId("table")).toHaveClass("table", "custom");
  });
});

describe("Table — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Table aria-label="Test Table">content</Table></>);
    const results = await axe(container) as unknown as { violations: Array<{ id: string }> };
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
//
// CODEGEN-TABLE-COMPOUND-PARTS-REALIZATION-01 — Layer 2 runtime DOM
// tests. Layer 1 (source-string) tests in
// packages/ds-codegen/src/frameworks/table-native-realization.test.ts
// assert the *emitted source* uses native tags. These tests render
// the composed Table tree and assert the *rendered DOM* matches the
// realized native mapping documented in the slice's recon doc.

describe("Table — runtime DOM realization", () => {
  it("renders a fully-composed native table tree", () => {
    const { container } = render(
      <Table ariaLabel="Orders">
        <TableCaption>Recent orders</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Total</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Paid</TableCell>
            <TableCell>$42.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>1 order</TableCell>
            <TableCell>$42.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    const wrapper = container.querySelector("div.table");
    expect(wrapper).not.toBeNull();
    const table = wrapper!.querySelector("table.table__container");
    expect(table).not.toBeNull();
    expect(table!.getAttribute("aria-label")).toBe("Orders");

    const caption = table!.querySelector("caption.table__caption");
    expect(caption?.textContent).toBe("Recent orders");

    const thead = table!.querySelector("thead.table__head");
    const tbody = table!.querySelector("tbody.table__body");
    const tfoot = table!.querySelector("tfoot.table__footer");
    expect(thead).not.toBeNull();
    expect(tbody).not.toBeNull();
    expect(tfoot).not.toBeNull();

    const headRows = thead!.querySelectorAll("tr.table__row");
    expect(headRows.length).toBe(1);
    const headerCells = headRows[0].querySelectorAll("th.table__headerCell");
    expect(headerCells.length).toBe(2);
    expect(headerCells[0].textContent).toBe("Status");

    const bodyRows = tbody!.querySelectorAll("tr.table__row");
    expect(bodyRows.length).toBe(1);
    const cells = bodyRows[0].querySelectorAll("td.table__cell");
    expect(cells.length).toBe(2);
    expect(cells[0].textContent).toBe("Paid");

    const footerRows = tfoot!.querySelectorAll("tr.table__row");
    expect(footerRows.length).toBe(1);
  });

  it("emits no .stack layout-primitive wrapper inside the rendered table", () => {
    const { container } = render(
      <Table ariaLabel="t">
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const tableEl = container.querySelector("table.table__container");
    expect(tableEl).not.toBeNull();
    const stackElements = tableEl!.querySelectorAll(".stack");
    expect(stackElements.length).toBe(0);
  });
});
// @custom:end
