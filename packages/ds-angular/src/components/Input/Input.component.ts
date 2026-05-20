// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useInput } from "./useInput.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-input",
  standalone: true,
  imports: [NgClass],
  template: `<input [ngClass]="classes()" [value]="behavior.value()" (change)="handleValueChange($event)" [disabled]="disabled" [attr.aria-invalid]="invalid" [type]="type" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @Input() type?: string;
  @Input() value?: string;
  @Input() defaultValue?: string;
  @Input() placeholder?: string;
  @Input() disabled?: boolean;
  @Input() invalid?: boolean;
  @Input() required?: boolean;
  @Input() name?: string;
  @Input() class?: string;
  @Input() onChange?: (value: string) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useInput({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "input",
      this.disabled ? "input--disabled" : null,
      this.invalid ? "input--invalid" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
