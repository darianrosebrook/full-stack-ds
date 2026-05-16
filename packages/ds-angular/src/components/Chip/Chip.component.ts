// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ChipType = "button" | "submit" | "reset";
export type ChipVariant = "default" | "selected" | "dismissible";
export type ChipSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-chip",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<button [ngClass]="classes()" [type]="type" [disabled]="disabled" [attr.aria-label]="ariaLabel" [attr.aria-expanded]="ariaExpanded" [attr.aria-pressed]="ariaPressed">
  <ng-container *ngIf="icon">
    <span [ngClass]="'chip__icon'" aria-hidden="true"></span>
  </ng-container>
  <span [ngClass]="'chip__text'">
    <ng-content />
  </span>
</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  @Input() type?: ChipType;
  @Input() variant?: ChipVariant;
  @Input() size?: ChipSize;
  @Input() disabled?: boolean;
  @Input() icon?: unknown;
  @Input() title?: string;
  @Input() ariaLabel?: string;
  @Input() ariaExpanded?: boolean;
  @Input() ariaPressed?: boolean;
  @Input() class?: string;

  classes(): string {
    return [
      "chip",
      this.variant ? `chip--${this.variant}` : null,
      this.size ? `chip--${this.size}` : null,
      this.disabled ? "chip--disabled" : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
