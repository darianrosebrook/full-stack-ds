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
  static override styles = css`
    :host { display: contents; }
    .otp {
      --fsds-otp-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-otp-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-otp-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-otp-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-otp-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-otp-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    
      &:focus-visible {
        --fsds-otp-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      }
    }
    
    .otp {
      background-color: var(--fsds-otp-color-background-default);
      color: var(--fsds-otp-color-foreground-secondary);
      border-color: var(--fsds-otp-color-border-default);
      padding: var(--fsds-otp-size-padding-default);
      border-radius: var(--fsds-otp-size-radius-default);
    
      &:focus-visible {
        border-color: var(--fsds-otp-color-border-accent);
      }
    }
  `;

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
  static override styles = css`
    :host { display: contents; }
    .otp {
      --fsds-otp-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-otp-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-otp-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-otp-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-otp-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-otp-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    
      &:focus-visible {
        --fsds-otp-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      }
    }
    
    .otp {
      background-color: var(--fsds-otp-color-background-default);
      color: var(--fsds-otp-color-foreground-secondary);
      border-color: var(--fsds-otp-color-border-default);
      padding: var(--fsds-otp-size-padding-default);
      border-radius: var(--fsds-otp-size-radius-default);
    
      &:focus-visible {
        border-color: var(--fsds-otp-color-border-accent);
      }
    }
  `;

  override render() {
    return html`<fsds-stack class="otp__group"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-otpgroup', OTPGroupElement);
// @generated:end

// @custom:start trailing

// @custom:end