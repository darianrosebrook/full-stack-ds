// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TextFieldBehavior } from './TextFieldBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TextFieldElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false }) label?: unknown;
  @property({ attribute: false }) description?: unknown;
  @property({ attribute: false }) error?: unknown;
  @property({ type: String }) type?: string;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ type: Boolean }) invalid?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: String }) name?: string;
  @property({ type: String }) ariaDescribedby?: string;
  @property({ attribute: false }) onChange?: (value: string) => void;

  private behavior = new TextFieldBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  private handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }

  private computeClasses(): string {
    return [
      "text-field",
      this.invalid ? "text-field--invalid" : null,
      this.disabled ? "text-field--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  ${this.label ? html`
  <label class=${'text-field__label'}>
    <slot></slot>
  </label>
  ` : nothing}
  <input class=${'text-field__field'} type=${ifDefined(this.type)} .value=${this.behavior.value} @change=${(e: Event) => this.handleValueChange(e)} ?disabled=${this.disabled ?? false} name=${ifDefined(this.name)} ?required=${this.required ?? false} aria-invalid=${ifDefined(this.invalid === undefined ? undefined : (this.invalid ? 'true' : 'false'))} aria-describedby=${ifDefined(this.ariaDescribedby)} />
  ${this.description ? html`
  <span class=${'text-field__description'}>
    <slot></slot>
  </span>
  ` : nothing}
  ${this.error ? html`
  <span class=${'text-field__error'} role="alert">
    <slot></slot>
  </span>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-text-field', TextFieldElement);

export class TextFieldDescriptionElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="p" class="text-field__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-text-field-description', TextFieldDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end