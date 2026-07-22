// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ButtonSize = "small" | "medium" | "large";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "outline";
export type ButtonType = "button" | "submit" | "reset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-button",
  standalone: true,
  imports: [NgClass],
  template: `<button [ngClass]="classes()" (click)="onClick && onClick()" [type]="(type ?? 'button')" [disabled]="disabled" [attr.aria-label]="ariaLabel" [attr.aria-expanded]="ariaExpanded" [attr.aria-pressed]="ariaPressed" [attr.aria-busy]="loading">
  <ng-content />
</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() size?: ButtonSize = "medium";
  @Input() variant?: ButtonVariant = "primary";
  @Input() type?: ButtonType = "button";
  @Input() loading?: boolean;
  @Input() disabled?: boolean;
  @Input() ariaLabel?: string;
  @Input() ariaExpanded?: boolean;
  @Input() ariaPressed?: boolean;
  @Input() title?: string;
  @Input() onClick?: () => void;
  @Input() class?: string;

  classes(): string {
    return [
      "button",
      (this.size ?? "medium") ? `button--${(this.size ?? "medium")}` : null,
      (this.variant ?? "primary") ? `button--${(this.variant ?? "primary")}` : null,
      this.disabled ? "button--disabled" : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
