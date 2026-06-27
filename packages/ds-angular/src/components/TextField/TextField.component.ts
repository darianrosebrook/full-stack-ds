// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useTextField } from "./useTextField.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-text-field",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()">
  <label [ngClass]="'text-field__label'">
    <ng-content select="[slot=label]" />
  </label>
  <input [ngClass]="'text-field__field'" (change)="handleValueChange($event)" [type]="type" [value]="behavior.value()" [disabled]="disabled" [name]="name" [required]="required" [attr.aria-invalid]="invalid" [attr.aria-describedby]="ariaDescribedby" />
  <span [ngClass]="'text-field__description'">
    <ng-content select="[slot=description]" />
  </span>
  <span [ngClass]="'text-field__error'" role="alert">
    <ng-content select="[slot=error]" />
  </span>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent {
  @Input() type?: string;
  @Input() value?: string;
  @Input() defaultValue?: string;
  @Input() onChange?: (value: string) => void;
  @Input() invalid?: boolean;
  @Input() disabled?: boolean;
  @Input() required?: boolean;
  @Input() name?: string;
  @Input() ariaDescribedby?: string;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useTextField({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "text-field",
      this.invalid ? "text-field--invalid" : null,
      this.disabled ? "text-field--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: "fsds-text-field-description",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="p" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldDescriptionComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["text-field__description", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
