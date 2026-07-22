// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useToggleSwitch } from "./useToggleSwitch.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToggleSwitchSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-toggle-switch",
  standalone: true,
  imports: [NgClass],
  template: `<button [ngClass]="classes()" type="button" (click)="behavior.setChecked(!behavior.checked())" [attr.aria-checked]="behavior.checked()" [attr.aria-label]="ariaLabel" [attr.aria-describedby]="ariaDescribedby" [disabled]="disabled"></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitchComponent {
  @Input() checked?: boolean;
  @Input() defaultChecked?: boolean;
  @Input() onChange?: (checked: boolean) => void;
  @Input() size?: ToggleSwitchSize = "medium";
  @Input() disabled?: boolean;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedby?: string;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useToggleSwitch({
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "toggle-switch",
      (this.size ?? "medium") ? `toggle-switch--${(this.size ?? "medium")}` : null,
      this.behavior.checked() ? "toggle-switch--checked" : null,
      this.disabled ? "toggle-switch--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
