// Hand-authored Layer 2 runtime DOM proof for Angular Table.
// CODEGEN-TABLE-NATIVE-REALIZATION-ANGULAR-L2-01.
//
// Layer 1 (source-string) gate lives in
//   packages/ds-codegen/src/frameworks/table-native-realization.test.ts
// Companion runtime proof in React lives in
//   packages/ds-react/src/components/Table/__tests__/Table.test.tsx
//   (inside the @custom:start tests block).
//
// This file is NOT codegen-managed — it sits alongside the generated
// Table.test.ts and exercises the Angular framework's view engine to
// confirm attribute-selector directives (tr[fsdsTableRow] etc.) preserve
// the underlying native host element at render time. The Layer 1 gate
// can only prove the emitted source string contains the right selector;
// only Layer 2 proves the rendered DOM matches.
import { describe, expect, it, beforeEach } from "@jest/globals";
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  TableComponent,
  TableCaptionComponent,
  TableHeadComponent,
  TableBodyComponent,
  TableFooterComponent,
  TableRowComponent,
  TableHeaderCellComponent,
  TableCellComponent,
} from "../Table.component";

@Component({
  selector: "fsds-table-fixture",
  standalone: true,
  imports: [
    TableComponent,
    TableCaptionComponent,
    TableHeadComponent,
    TableBodyComponent,
    TableFooterComponent,
    TableRowComponent,
    TableHeaderCellComponent,
    TableCellComponent,
  ],
  template: `
    <fsds-table ariaLabel="Orders">
      <caption fsdsTableCaption>Recent orders</caption>
      <thead fsdsTableHead>
        <tr fsdsTableRow>
          <th fsdsTableHeaderCell>Status</th>
          <th fsdsTableHeaderCell>Total</th>
        </tr>
      </thead>
      <tbody fsdsTableBody>
        <tr fsdsTableRow>
          <td fsdsTableCell>Paid</td>
          <td fsdsTableCell>$42.00</td>
        </tr>
      </tbody>
      <tfoot fsdsTableFooter>
        <tr fsdsTableRow>
          <td fsdsTableCell>1 order</td>
          <td fsdsTableCell>$42.00</td>
        </tr>
      </tfoot>
    </fsds-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TableFixture {}

describe("Table — runtime DOM realization (Angular)", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableFixture] });
  });

  it("renders a fully-composed native table tree", () => {
    const fixture = TestBed.createComponent(TableFixture);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const tableHost = host.querySelector("fsds-table");
    expect(tableHost).not.toBeNull();

    const wrapper = tableHost!.querySelector("div.table");
    expect(wrapper).not.toBeNull();

    const table = wrapper!.querySelector("table.table__container");
    expect(table).not.toBeNull();
    expect(table!.getAttribute("aria-label")).toBe("Orders");

    const caption = table!.querySelector("caption.table__caption");
    expect(caption).not.toBeNull();
    expect(caption!.textContent?.trim()).toBe("Recent orders");

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
    expect(headerCells[0].textContent?.trim()).toBe("Status");
    expect(headerCells[1].textContent?.trim()).toBe("Total");

    const bodyRows = tbody!.querySelectorAll("tr.table__row");
    expect(bodyRows.length).toBe(1);
    const cells = bodyRows[0].querySelectorAll("td.table__cell");
    expect(cells.length).toBe(2);
    expect(cells[0].textContent?.trim()).toBe("Paid");
    expect(cells[1].textContent?.trim()).toBe("$42.00");

    const footerRows = tfoot!.querySelectorAll("tr.table__row");
    expect(footerRows.length).toBe(1);
    const footerCells = footerRows[0].querySelectorAll("td.table__cell");
    expect(footerCells.length).toBe(2);
  });

  it("emits no .stack layout-primitive wrapper inside the rendered table", () => {
    const fixture = TestBed.createComponent(TableFixture);
    fixture.detectChanges();

    const table = (fixture.nativeElement as HTMLElement).querySelector(
      "table.table__container",
    );
    expect(table).not.toBeNull();
    const stackElements = table!.querySelectorAll(".stack");
    expect(stackElements.length).toBe(0);
  });
});

// SHOWCASE-CONSUMPTION-03 A1 — Angular realizes the cell/header parts as
// attribute directives on the consumer's OWN native host element. So unlike
// React/Vue/Svelte (where the subcomponent forwards an explicit prop), the
// native colspan/rowspan/scope/id/style live directly on the consumer's
// <td>/<th>/<tr>. This proves the class-binding directive does not strip
// them — the capability holds structurally, no generated prop required.
@Component({
  selector: "fsds-table-attrs-fixture",
  standalone: true,
  imports: [
    TableComponent,
    TableHeadComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeaderCellComponent,
    TableCellComponent,
  ],
  template: `
    <fsds-table ariaLabel="Tokens">
      <thead fsdsTableHead>
        <tr fsdsTableRow>
          <th fsdsTableHeaderCell scope="col" colspan="2">Grouped</th>
        </tr>
      </thead>
      <tbody fsdsTableBody>
        <tr fsdsTableRow id="row-anchor">
          <td fsdsTableCell colspan="4" id="cell-1" style="text-align: center">
            Section
          </td>
        </tr>
      </tbody>
    </fsds-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TableCellAttrsFixture {}

describe("Table — native cell attributes pass through the directive (Angular)", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableCellAttrsFixture] });
  });

  it("preserves colspan/id/style/scope authored on the consumer's host cells", () => {
    const fixture = TestBed.createComponent(TableCellAttrsFixture);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    // Scope to tbody — the thead also has a tr.table__row (without an id).
    const row = host.querySelector("tbody tr.table__row")!;
    expect(row.getAttribute("id")).toBe("row-anchor");

    const cell = host.querySelector("td.table__cell")! as HTMLTableCellElement;
    expect(cell.getAttribute("colspan")).toBe("4");
    expect(cell.getAttribute("id")).toBe("cell-1");
    expect(cell.style.textAlign).toBe("center");

    const th = host.querySelector("th.table__headerCell")!;
    expect(th.getAttribute("scope")).toBe("col");
    expect(th.getAttribute("colspan")).toBe("2");
  });
});
