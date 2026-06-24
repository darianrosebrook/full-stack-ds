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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
      --fsds-otp-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-otp-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-otp-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-otp-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-otp-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-otp-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-otp-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-otp-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-otp-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-otp-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .otp {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: inline-flex;
      align-items: center;
    }

    .otp__group {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .otp__field {
      display: block;
      width: 40px;
      height: 40px;
      text-align: center;
      font-size: 1rem;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-otp-size-radius-default);
      border-color: var(--fsds-otp-color-border-default);
      background-color: var(--fsds-otp-color-background-default);
      color: var(--fsds-otp-color-foreground-primary);
    }

    .otp__field:focus-visible {
      border-color: var(--fsds-otp-color-border-accent);
      outline-width: var(--fsds-otp-focus-ring-width);
      outline-color: var(--fsds-otp-focus-ring-color);
      outline-style: var(--fsds-otp-focus-ring-style);
      outline-offset: var(--fsds-otp-focus-ring-offset);
    }

    .otp__field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ type: Number }) length?: number = 6;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ attribute: false }) onChange?: (value: string) => void;
  @property({ attribute: false }) onComplete?: (value: string) => void;
  @property({ type: String }) mode?: OTPMode = "numeric";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) readOnly?: boolean;
  @property({ type: String }) label?: string = "One-time password";

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
    ${Array.from({ length: this.length ?? 0 }, (_, index) => html`
    <input class=${'otp__field'} type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" ?disabled=${this.disabled ?? false} aria-readonly=${ifDefined(this.readOnly === undefined ? undefined : (this.readOnly ? 'true' : 'false'))} data-otp-index=${index} />
    `)}
  </div>
</div>`;
  }
}

customElements.define('fsds-otp', OTPElement);

export class OTPGroupElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .otp {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-box-model-max-height: none;
      --fsds-otp-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-otp-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-otp-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-otp-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-otp-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-otp-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-otp-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-otp-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-otp-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-otp-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .otp {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: inline-flex;
      align-items: center;
    }

    .otp__group {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .otp__field {
      display: block;
      width: 40px;
      height: 40px;
      text-align: center;
      font-size: 1rem;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-otp-size-radius-default);
      border-color: var(--fsds-otp-color-border-default);
      background-color: var(--fsds-otp-color-background-default);
      color: var(--fsds-otp-color-foreground-primary);
    }

    .otp__field:focus-visible {
      border-color: var(--fsds-otp-color-border-accent);
      outline-width: var(--fsds-otp-focus-ring-width);
      outline-color: var(--fsds-otp-focus-ring-color);
      outline-style: var(--fsds-otp-focus-ring-style);
      outline-offset: var(--fsds-otp-focus-ring-offset);
    }

    .otp__field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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