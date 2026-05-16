// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { InputBehavior } from './InputBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class InputElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() type?: string;
  @property() value?: string;
  @property() defaultValue?: string;
  @property() placeholder?: string;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) invalid?: boolean;
  @property({ type: Boolean }) required?: boolean;
  @property() name?: string;
  @property({ attribute: false }) onChange?: (value: string) => void;

  private behavior = new InputBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  private handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }

  private computeClasses(): string {
    return [
      "input",
      this.disabled ? "input--disabled" : null,
      this.invalid ? "input--invalid" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<input class="${this.computeClasses()}" role="textbox" .value=${this.behavior.value} @change=${(e: Event) => this.handleValueChange(e)} ?disabled=${this.disabled} aria-invalid=${this.invalid} .type=${this.type} />`;
  }
}

customElements.define('fsds-input', InputElement);
// @generated:end

// @custom:start trailing

// @custom:end