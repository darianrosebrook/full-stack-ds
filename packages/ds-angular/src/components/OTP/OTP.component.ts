// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useOTP } from "./useOTP.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type OTPMode = "numeric" | "alphanumeric";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-otp",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()" role="group" [attr.aria-label]="label" aria-describedby="otp-error-id">
  <div [ngClass]="'otp__group'">
    <input [ngClass]="'otp__field'" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" [disabled]="disabled" [attr.aria-readonly]="readOnly" />
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OTPComponent {
  @Input() length?: number = 6;
  @Input() value?: string;
  @Input() defaultValue?: string;
  @Input() mode?: OTPMode = "numeric";
  @Input() disabled?: boolean;
  @Input() readOnly?: boolean;
  @Input() label?: string = "One-time password";
  @Input() class?: string;
  @Input() onChange?: (value: string) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useOTP({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "otp",
      this.mode ? `otp--${this.mode}` : null,
      this.disabled ? "otp--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: "fsds-otpgroup",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OTPGroupComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["otp__group", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
