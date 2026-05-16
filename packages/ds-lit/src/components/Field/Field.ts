// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
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
  static override styles = css`:host { display: contents; }`;

  @property() name!: string;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) readOnly?: boolean;
  @property() value?: unknown;
  @property({ type: Boolean }) validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  @property() label?: unknown;
  @property() helpText?: unknown;
  @property() error?: string;
  @property() status?: FieldStatus;
  @property({ type: Boolean }) validating?: boolean;

  private computeClasses(): string {
    return [
      "field",
      this.status ? `field--${this.status}` : null,
      this.disabled ? "field--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <div class=${'field__header'}>
    ${this.label ? html`
    <label class=${'field__label'}>
      <slot></slot>
    </label>
    ` : nothing}
  </div>
  <div class=${'field__control'}>
    <slot></slot>
  </div>
  <div class=${'field__meta'}>
    ${this.helpText ? html`
    <span class=${'field__help'}></span>
    ` : nothing}
    ${this.error ? html`
    <span class=${'field__error'}></span>
    ` : nothing}
    ${this.validating ? html`
    <span class=${'field__validatingIndicator'}></span>
    ` : nothing}
  </div>
</div>`;
  }
}

customElements.define('fsds-field', FieldElement);

export class FieldHeaderElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="field__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-field-header', FieldHeaderElement);
// @generated:end

// @custom:start trailing

// @custom:end