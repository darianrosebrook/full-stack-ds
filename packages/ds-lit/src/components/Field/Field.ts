// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { FieldBehavior } from './FieldBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type FieldStatus = "idle" | "validating" | "valid" | "invalid";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class FieldElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .field {
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
      --fsds-field-gap-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-gap-meta: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-field-pad-x: var(--fsds-semantic-spacing-density-compact-md, 12px);
      --fsds-field-pad-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-color-bg: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-field-color-borderBold: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-field-color-focus-border: var(--fsds-semantic-color-border-focus, #d9292b);
      --fsds-field-color-invalid-border: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-field-color-invalid-text: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-field-color-valid-border: var(--fsds-semantic-color-feedback-border-success, #336006);
      --fsds-field-color-validating-border: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-field-color-validating-text: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-field-color-valid-text: var(--fsds-semantic-color-foreground-success, #336006);
      --fsds-field-spacing-indicator: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-label-fontSize: var(--fsds-semantic-typography-body-small-font-size, 14px);
      --fsds-field-label-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .field--idle {
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }

    .field--validating {
      --fsds-field-color-border: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-secondary, #555555);
    }

    .field--valid {
      --fsds-field-color-border: var(--fsds-semantic-color-feedback-border-success, #336006);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-success, #336006);
    }

    .field--invalid {
      --fsds-field-color-border: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-danger, #d9292b);
    }

    .field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-field-gap-y);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-radius: var(--fsds-field-radius);
    }

    .field__label {
      display: inline-block;
      font-size: var(--fsds-field-label-fontSize);
      font-weight: 500;
      color: var(--fsds-field-label-color);
    }

    .field__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fsds-field-gap-meta);
    }

    .field__control {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-field-radius);
      border-color: var(--fsds-field-color-border);
      background-color: var(--fsds-field-color-bg);
      padding: var(--fsds-field-pad-x);
    }

    .field__help {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-fg);
    }

    .field__error {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-invalid-text);
    }

    .field__meta {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-field-gap-meta);
    }

    .field__validatingIndicator {
      display: inline-flex;
      width: 1em;
      height: 1em;
      color: var(--fsds-field-color-fg);
    }

    .field__control:focus-within {
      border-color: var(--fsds-field-color-focus-border);
      outline-width: var(--fsds-field-focus-ring-width);
      outline-color: var(--fsds-field-focus-ring-color);
      outline-style: var(--fsds-field-focus-ring-style);
      outline-offset: var(--fsds-field-focus-ring-offset);
    }

    .field--invalid .field__control {
      border-color: var(--fsds-field-color-invalid-border);
    }

    .field--disabled .field__control {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .field--valid .field__control {
      border-color: var(--fsds-field-color-valid-border);
    }
  `;

  @property({ type: String }) name!: string;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) readOnly?: boolean;
  @property({ attribute: false }) value?: unknown;
  @property({ attribute: false }) defaultValue?: unknown;
  @property({ attribute: false }) onChange?: (value: unknown) => void;
  @property({ attribute: false }) validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  @property({ type: String }) status?: FieldStatus;
  @property({ type: Boolean }) validating?: boolean;

  private behavior = new FieldBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  private computeClasses(): string {
    return [
      "field",
      this.status ? `field--${this.status}` : null,
      this.disabled ? "field--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="group">
  <div class=${'field__header'}>
    <label class=${'field__label'}>
      <slot name="label"></slot>
    </label>
  </div>
  <div class=${'field__control'}>
    <slot name="control"></slot>
  </div>
  <div class=${'field__meta'}>
    <span class=${'field__help'} id="field-help">
      <slot name="help"></slot>
    </span>
    <span class=${'field__error'} id="field-error">
      <slot name="error"></slot>
    </span>
    ${this.validating ? html`
    <span class=${'field__validatingIndicator'}>
      <slot name="validatingIndicator"></slot>
    </span>
    ` : nothing}
  </div>
</div>`;
  }
}

customElements.define('fsds-field', FieldElement);

export class FieldHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .field {
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
      --fsds-field-gap-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-gap-meta: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-field-pad-x: var(--fsds-semantic-spacing-density-compact-md, 12px);
      --fsds-field-pad-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-color-bg: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-field-color-borderBold: var(--fsds-semantic-color-border-bold, #8f8f8f);
      --fsds-field-color-focus-border: var(--fsds-semantic-color-border-focus, #d9292b);
      --fsds-field-color-invalid-border: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-field-color-invalid-text: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-field-color-valid-border: var(--fsds-semantic-color-feedback-border-success, #336006);
      --fsds-field-color-validating-border: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-field-color-validating-text: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-field-color-valid-text: var(--fsds-semantic-color-foreground-success, #336006);
      --fsds-field-spacing-indicator: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-label-fontSize: var(--fsds-semantic-typography-body-small-font-size, 14px);
      --fsds-field-label-color: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .field--idle {
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #cecece);
    }

    .field--validating {
      --fsds-field-color-border: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-secondary, #555555);
    }

    .field--valid {
      --fsds-field-color-border: var(--fsds-semantic-color-feedback-border-success, #336006);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-success, #336006);
    }

    .field--invalid {
      --fsds-field-color-border: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-danger, #d9292b);
    }

    .field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-field-gap-y);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-radius: var(--fsds-field-radius);
    }

    .field__label {
      display: inline-block;
      font-size: var(--fsds-field-label-fontSize);
      font-weight: 500;
      color: var(--fsds-field-label-color);
    }

    .field__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fsds-field-gap-meta);
    }

    .field__control {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-field-radius);
      border-color: var(--fsds-field-color-border);
      background-color: var(--fsds-field-color-bg);
      padding: var(--fsds-field-pad-x);
    }

    .field__help {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-fg);
    }

    .field__error {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-invalid-text);
    }

    .field__meta {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-field-gap-meta);
    }

    .field__validatingIndicator {
      display: inline-flex;
      width: 1em;
      height: 1em;
      color: var(--fsds-field-color-fg);
    }

    .field__control:focus-within {
      border-color: var(--fsds-field-color-focus-border);
      outline-width: var(--fsds-field-focus-ring-width);
      outline-color: var(--fsds-field-focus-ring-color);
      outline-style: var(--fsds-field-focus-ring-style);
      outline-offset: var(--fsds-field-focus-ring-offset);
    }

    .field--invalid .field__control {
      border-color: var(--fsds-field-color-invalid-border);
    }

    .field--disabled .field__control {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .field--valid .field__control {
      border-color: var(--fsds-field-color-valid-border);
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="field__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-field-header', FieldHeaderElement);
// @generated:end

// @custom:start trailing

// @custom:end