// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { OTPBehavior } from './OTPBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type OTPMode = "numeric" | "alphanumeric";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class OTPElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Number }) length?: number = 6;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ attribute: false }) mode?: OTPMode = "numeric";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) readOnly?: boolean;
  @property({ type: String }) label?: string = "One-time password";
  @property({ attribute: false }) onChange?: (value: string) => void;

  private behavior = new OTPBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  private computeClasses(): string {
    return [
      "otp",
      this.mode ? `otp--${this.mode}` : null,
      this.disabled ? "otp--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="group" aria-label=${ifDefined(this.label)} aria-describedby="otp-error-id">
  <div class=${'otp__group'}>
    <input class=${'otp__field'} type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" ?disabled=${this.disabled ?? false} aria-readonly=${ifDefined(this.readOnly === undefined ? undefined : (this.readOnly ? 'true' : 'false'))} />
  </div>
</div>`;
  }
}

customElements.define('fsds-otp', OTPElement);

export class OTPGroupElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="otp__group"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-otpgroup', OTPGroupElement);
// @generated:end

// @custom:start trailing

// @custom:end