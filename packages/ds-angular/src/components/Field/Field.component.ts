// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useField } from "./useField.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type FieldStatus = "idle" | "validating" | "valid" | "invalid";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-field",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <div [ngClass]="'field__header'">
    <ng-container *ngIf="label">
      <label [ngClass]="'field__label'">
        <ng-content />
      </label>
    </ng-container>
  </div>
  <div [ngClass]="'field__control'">
    <ng-content />
  </div>
  <div [ngClass]="'field__meta'">
    <ng-container *ngIf="helpText">
      <span [ngClass]="'field__help'"></span>
    </ng-container>
    <ng-container *ngIf="error">
      <span [ngClass]="'field__error'"></span>
    </ng-container>
    <ng-container *ngIf="validating">
      <span [ngClass]="'field__validatingIndicator'"></span>
    </ng-container>
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent {
  @Input() name!: string;
  @Input() id?: string;
  @Input() required?: boolean;
  @Input() disabled?: boolean;
  @Input() readOnly?: boolean;
  @Input() value?: unknown;
  @Input() defaultValue?: unknown;
  @Input() onChange?: (value: unknown) => void;
  @Input() validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  @Input() label?: unknown;
  @Input() helpText?: unknown;
  @Input() error?: string;
  @Input() status?: FieldStatus;
  @Input() validating?: boolean;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useField({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "field",
      this.status ? `field--${this.status}` : null,
      this.disabled ? "field--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
}

@Component({
  selector: "fsds-field-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["field__header", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
