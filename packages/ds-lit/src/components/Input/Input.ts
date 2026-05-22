// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { InputBehavior } from './InputBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class InputElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .input {
      --fsds-input-color-bg-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-input-color-text-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-input-color-border-default: var(--fsds-semantic-color-border-default, #aeaeae);
      --fsds-input-size-height-default: var(--fsds-semantic-control-size-lg-height, 48px);
      --fsds-input-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-input-space-inline-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-input-color-focus-default: var(--fsds-semantic-color-border-focus, #d9292b);
      --fsds-input-color-invalid-default: var(--fsds-semantic-color-border-danger, #ae0001);
    }
    
    .input {
      background-color: var(--fsds-input-color-bg-default);
      color: var(--fsds-input-color-text-default);
      border-color: var(--fsds-input-color-border-default);
      min-height: var(--fsds-input-size-height-default);
      border-radius: var(--fsds-input-size-radius-default);
      padding: var(--fsds-input-space-inline-default);
    
      &:focus-visible {
        border-color: var(--fsds-input-color-focus-default);
      }
    }
    
    .input__invalid {
      border-color: var(--fsds-input-color-invalid-default);
    }
  `;

  @property({ type: String }) type?: string;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ type: String }) placeholder?: string;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) invalid?: boolean;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: String }) name?: string;
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
    return html`<input class="${this.computeClasses()}" role="textbox" .value=${this.behavior.value} @change=${(e: Event) => this.handleValueChange(e)} ?disabled=${this.disabled ?? false} aria-invalid=${ifDefined(this.invalid === undefined ? undefined : (this.invalid ? 'true' : 'false'))} type=${ifDefined(this.type)} />`;
  }
}

customElements.define('fsds-input', InputElement);
// @generated:end

// @custom:start trailing

// @custom:end