// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerVariant = "ring" | "dots" | "bars";
export type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-spinner",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()">
  <span [ngClass]="'spinner__visual'" aria-hidden="true"></span>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() size?: SpinnerSize;
  @Input() variant?: SpinnerVariant;
  @Input() thickness?: SpinnerThickness;
  @Input() ariaHidden?: boolean;
  @Input() label?: string;
  @Input() inline?: boolean;
  @Input() showAfterMs?: number;
  @Input() class?: string;

  classes(): string {
    return [
      "spinner",
      this.size ? `spinner--${this.size}` : null,
      this.variant ? `spinner--${this.variant}` : null,
      this.thickness ? `spinner--${this.thickness}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
