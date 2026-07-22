import { describe, expect, it, beforeEach } from "@jest/globals";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FieldComponent } from "../Field.component";
import { InputComponent } from "../../Input/Input.component";

/**
 * FEAT-A11Y-LABEL-ID-ASSOCIATION-01 — end-to-end field association
 * (Angular). Pins the cross-component mechanism: Field provides
 * FieldAssociationService at its component injector, the projected Input
 * resolves the same instance through the element-injector chain and binds
 * id / aria-describedby on its root element.
 */
@Component({
  standalone: true,
  imports: [FieldComponent, InputComponent],
  template: `<fsds-field name="email" [status]="status">
    <span slot="label">Email address</span>
    <fsds-input slot="control" data-testid="control"></fsds-input>
    <span slot="help">Help text.</span>
    <span slot="error">That address is not valid.</span>
  </fsds-field>`,
})
class HostComponent {
  status?: "idle" | "validating" | "valid" | "invalid";
}

describe("Field ↔ Input association", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent, InputComponent] });
  });

  function renderHost(status?: "invalid") {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.status = status;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("wires label[for] → projected input id through the service", () => {
    const host = renderHost();
    const label = host.querySelector("label.field__label");
    const input = host.querySelector("input");
    const forId = label?.getAttribute("for");
    expect(forId).toBeTruthy();
    expect(input?.getAttribute("id")).toBe(forId);
  });

  it("delivers the help id to the control's aria-describedby while not invalid", () => {
    const host = renderHost();
    const helpId = host.querySelector(".field__help")?.getAttribute("id");
    expect(helpId).toBeTruthy();
    expect(host.querySelector("input")?.getAttribute("aria-describedby")).toBe(
      helpId,
    );
  });

  it("switches aria-describedby to the error id when status=invalid", () => {
    const host = renderHost("invalid");
    const errorId = host.querySelector(".field__error")?.getAttribute("id");
    expect(errorId).toBeTruthy();
    expect(host.querySelector("input")?.getAttribute("aria-describedby")).toBe(
      errorId,
    );
  });

  it("renders a standalone Input without generated ids (no provider)", () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector("input");
    expect(input?.getAttribute("id")).toBeNull();
    expect(input?.getAttribute("aria-describedby")).toBeNull();
  });
});
