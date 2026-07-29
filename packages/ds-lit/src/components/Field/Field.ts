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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-field-gap-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-gap-meta: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-field-pad-x: var(--fsds-semantic-spacing-density-compact-md, 12px);
      --fsds-field-pad-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-color-bg: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-field-color-borderBold: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-field-color-focus-border: var(--fsds-semantic-color-border-focus, #0566fe);
      --fsds-field-color-invalid-border: var(--fsds-semantic-color-border-danger, #b31b1b);
      --fsds-field-color-invalid-text: var(--fsds-semantic-color-foreground-danger, #d92d2e);
      --fsds-field-color-valid-border: var(--fsds-semantic-color-feedback-border-success, #3a6614);
      --fsds-field-color-validating-border: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-field-color-validating-text: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-field-color-valid-text: var(--fsds-semantic-color-foreground-success, #497f21);
      --fsds-field-spacing-indicator: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-label-fontSize: var(--fsds-semantic-typography-body-small-font-size, 14px);
      --fsds-field-label-color: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .field--idle {
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .field--validating {
      --fsds-field-color-border: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .field--valid {
      --fsds-field-color-border: var(--fsds-semantic-color-feedback-border-success, #3a6614);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-success, #497f21);
    }

    .field--invalid {
      --fsds-field-color-border: var(--fsds-semantic-color-border-danger, #b31b1b);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-danger, #d92d2e);
    }

    .field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-field-gap-y, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-radius: var(--fsds-field-radius, 6px);
    }

    .field__label {
      display: inline-block;
      font-size: var(--fsds-field-label-fontSize, 14px);
      font-weight: 500;
      color: var(--fsds-field-label-color, #5c5b5c);
    }

    .field__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fsds-field-gap-meta, 4px);
    }

    .field__control {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-field-radius, 6px);
      border-color: var(--fsds-field-color-border, #d0d0d0);
      background-color: var(--fsds-field-color-bg, #ffffff);
      padding: var(--fsds-field-pad-x, 12px);
    }

    .field__help {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-fg, #141414);
    }

    .field__error {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-invalid-text, #d92d2e);
    }

    .field__meta {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-field-gap-meta, 4px);
    }

    .field__validatingIndicator {
      display: inline-flex;
      width: 1em;
      height: 1em;
      color: var(--fsds-field-color-fg, #141414);
    }

    .field__control:focus-within:not([aria-disabled="true"]) {
      border-color: var(--fsds-field-color-focus-border, #0566fe);
      outline-width: var(--fsds-field-focus-ring-width, 2px);
      outline-color: var(--fsds-field-focus-ring-color, #0566fe);
      outline-style: var(--fsds-field-focus-ring-style, solid);
      outline-offset: var(--fsds-field-focus-ring-offset, 2px);
    }

    .field--invalid .field__control {
      border-color: var(--fsds-field-color-invalid-border, #b31b1b);
    }

    .field--disabled .field__control {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .field--valid .field__control {
      border-color: var(--fsds-field-color-valid-border, #3a6614);
    }
  `;

  @property({ type: String }) name!: string;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) readOnly?: boolean;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ attribute: false }) onChange?: (value: string) => void;
  @property({ attribute: false }) validate?: ((value: string, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  @property({ type: String }) status?: FieldStatus;
  @property({ type: Boolean }) validating?: boolean;

  private behavior = new FieldBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "field");
  }

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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-input-size-medium-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-box-model-max-height: none;
      --fsds-field-gap-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-gap-meta: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-field-pad-x: var(--fsds-semantic-spacing-density-compact-md, 12px);
      --fsds-field-pad-y: var(--fsds-semantic-spacing-density-compact-sm, 8px);
      --fsds-field-color-bg: var(--fsds-semantic-color-background-elevated, #ffffff);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-field-color-borderBold: var(--fsds-semantic-color-border-bold, #888889);
      --fsds-field-color-focus-border: var(--fsds-semantic-color-border-focus, #0566fe);
      --fsds-field-color-invalid-border: var(--fsds-semantic-color-border-danger, #b31b1b);
      --fsds-field-color-invalid-text: var(--fsds-semantic-color-foreground-danger, #d92d2e);
      --fsds-field-color-valid-border: var(--fsds-semantic-color-feedback-border-success, #3a6614);
      --fsds-field-color-validating-border: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-field-color-validating-text: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-field-color-valid-text: var(--fsds-semantic-color-foreground-success, #497f21);
      --fsds-field-spacing-indicator: var(--fsds-core-spacing-size-03, 4px);
      --fsds-field-label-fontSize: var(--fsds-semantic-typography-body-small-font-size, 14px);
      --fsds-field-label-color: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }

    .field--idle {
      --fsds-field-color-border: var(--fsds-semantic-color-border-subtle, #d0d0d0);
    }

    .field--validating {
      --fsds-field-color-border: var(--fsds-semantic-color-border-accent, #d92d2e);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
    }

    .field--valid {
      --fsds-field-color-border: var(--fsds-semantic-color-feedback-border-success, #3a6614);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-success, #497f21);
    }

    .field--invalid {
      --fsds-field-color-border: var(--fsds-semantic-color-border-danger, #b31b1b);
      --fsds-field-color-fg: var(--fsds-semantic-color-foreground-danger, #d92d2e);
    }

    .field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-field-gap-y, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
      border-radius: var(--fsds-field-radius, 6px);
    }

    .field__label {
      display: inline-block;
      font-size: var(--fsds-field-label-fontSize, 14px);
      font-weight: 500;
      color: var(--fsds-field-label-color, #5c5b5c);
    }

    .field__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fsds-field-gap-meta, 4px);
    }

    .field__control {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      border-width: 1px;
      border-radius: var(--fsds-field-radius, 6px);
      border-color: var(--fsds-field-color-border, #d0d0d0);
      background-color: var(--fsds-field-color-bg, #ffffff);
      padding: var(--fsds-field-pad-x, 12px);
    }

    .field__help {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-fg, #141414);
    }

    .field__error {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-field-color-invalid-text, #d92d2e);
    }

    .field__meta {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-field-gap-meta, 4px);
    }

    .field__validatingIndicator {
      display: inline-flex;
      width: 1em;
      height: 1em;
      color: var(--fsds-field-color-fg, #141414);
    }

    .field__control:focus-within:not([aria-disabled="true"]) {
      border-color: var(--fsds-field-color-focus-border, #0566fe);
      outline-width: var(--fsds-field-focus-ring-width, 2px);
      outline-color: var(--fsds-field-focus-ring-color, #0566fe);
      outline-style: var(--fsds-field-focus-ring-style, solid);
      outline-offset: var(--fsds-field-focus-ring-offset, 2px);
    }

    .field--invalid .field__control {
      border-color: var(--fsds-field-color-invalid-border, #b31b1b);
    }

    .field--disabled .field__control {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .field--valid .field__control {
      border-color: var(--fsds-field-color-valid-border, #3a6614);
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