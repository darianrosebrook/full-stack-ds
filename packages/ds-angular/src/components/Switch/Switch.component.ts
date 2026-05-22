// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useSwitch } from "./useSwitch.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SwitchSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-switch",
  standalone: true,
  imports: [NgClass],
  template: `<label [ngClass]="classes()">
  <input [ngClass]="'switch__input'" type="checkbox" role="switch" (change)="handleCheckedChange($event)" [checked]="behavior.checked()" [disabled]="disabled" [name]="name" [value]="value" />
  <span [ngClass]="'switch__track'" aria-hidden="true">
    <span [ngClass]="'switch__thumb'"></span>
  </span>
</label>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  @Input() checked?: boolean;
  @Input() defaultChecked?: boolean;
  @Input() onChange?: (checked: boolean) => void;
  @Input() size?: SwitchSize = "md";
  @Input() disabled?: boolean;
  @Input() name?: string;
  @Input() value?: string;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useSwitch({
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "switch",
      this.size ? `switch--${this.size}` : null,
      this.behavior.checked() ? "switch--checked" : null,
      this.disabled ? "switch--disabled" : null,
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
