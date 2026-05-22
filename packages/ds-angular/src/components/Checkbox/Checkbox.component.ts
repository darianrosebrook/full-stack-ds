// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useCheckbox } from "./useCheckbox.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CheckboxSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-checkbox",
  standalone: true,
  imports: [NgClass],
  template: `<input [ngClass]="classes()" type="checkbox" (change)="handleCheckedChange($event)" [checked]="behavior.checked()" [disabled]="disabled" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  @Input() size?: CheckboxSize = "md";
  @Input() checked?: boolean;
  @Input() defaultChecked?: boolean;
  @Input() indeterminate?: boolean;
  @Input() disabled?: boolean;
  @Input() name?: string;
  @Input() value?: string;
  @Input() class?: string;
  @Input() onChange?: (value: boolean) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useCheckbox({
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "checkbox",
      this.size ? `checkbox--${this.size}` : null,
      this.behavior.checked() ? "checkbox--checked" : null,
      this.disabled ? "checkbox--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleCheckedChange(event: Event): void {
    this.behavior.setChecked((event.target as HTMLInputElement).checked);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
