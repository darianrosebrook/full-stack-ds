// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-status",
  standalone: true,
  imports: [NgClass],
  template: `<span [ngClass]="classes()">
  <span [ngClass]="'status__icon'" aria-hidden="true"></span>
  <span [ngClass]="'status__label'">
    <ng-content />
  </span>
</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent {
  @Input() status!: StatusIntent;
  @Input() class?: string;

  classes(): string {
    return [
      "status",
      this.status ? `status--${this.status}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
