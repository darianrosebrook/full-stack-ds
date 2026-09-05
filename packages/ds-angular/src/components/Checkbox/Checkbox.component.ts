// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useCheckbox } from "./useCheckbox.js";
import { FieldAssociationService } from "../../primitives/index.js";
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
  host: { "data-fsds-component": "checkbox" },
  template: `<label [ngClass]="classes()">
  <input [ngClass]="'checkbox__input'" type="checkbox" (change)="handleCheckedChange($event)" [checked]="behavior.checked()" [disabled]="disabled" [name]="name" [value]="value" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledby" [attr.aria-checked]="(indeterminate ? 'mixed' : behavior.checked())" [indeterminate]="indeterminate" [attr.id]="fieldAssociation?.current?.controlId" [attr.aria-describedby]="fieldAssociation?.current?.describedBy" />
  <span [ngClass]="'checkbox__indicator'" aria-hidden="true"></span>
</label>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  @Input() size?: CheckboxSize = "md";
  @Input() checked?: boolean;
  @Input() defaultChecked?: boolean;
  @Input() onChange?: (checked: boolean) => void;
  @Input() indeterminate?: boolean;
  @Input() disabled?: boolean;
  @Input() name?: string;
  @Input() value?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledby?: string;
  @Input() class?: string;
  protected fieldAssociation = inject(FieldAssociationService, { optional: true });

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
      (this.size ?? "md") ? `checkbox--${(this.size ?? "md")}` : null,
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
