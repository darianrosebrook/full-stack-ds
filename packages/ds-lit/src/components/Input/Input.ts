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
      --fsds-input-color-bg-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-input-color-bg-disabled: var(--fsds-semantic-interaction-background-disabled, #b8b8b8);
      --fsds-input-color-text-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-input-color-text-placeholder: var(--fsds-semantic-color-foreground-placeholder, #888889);
      --fsds-input-color-text-disabled: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-input-color-border-default: var(--fsds-semantic-color-border-default, #a0a0a1);
      --fsds-input-color-border-hover: var(--fsds-semantic-color-border-hover, #888889);
      --fsds-input-color-border-disabled: var(--fsds-semantic-color-border-disabled, #b8b8b8);
      --fsds-input-size-height-default: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-input-size-padding-block-default: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-input-size-padding-inline-default: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-input-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-input-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-input-space-inline-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-input-color-focus-default: var(--fsds-semantic-color-border-focus, #0566fe);
      --fsds-input-color-invalid-default: var(--fsds-semantic-color-border-danger, #b31b1b);
      --fsds-input-typography-size-default: var(--fsds-semantic-typography-body-02, 1rem);
      --fsds-input-typography-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-input-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-input-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-input-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-input-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-input-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
      --fsds-input-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-input-motion-easing-standard: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }

    .input {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-input-size-height-default, 32px);
      max-height: var(--fsds-box-model-max-height);
      box-sizing: border-box;
      border-style: solid;
      border-width: var(--fsds-input-size-border-default, 1px);
      background-color: var(--fsds-input-color-bg-default, #ffffff);
      color: var(--fsds-input-color-text-default, #141414);
      border-color: var(--fsds-input-color-border-default, #a0a0a1);
      border-radius: var(--fsds-input-size-radius-default, 6px);
      font-size: var(--fsds-input-typography-size-default, 1rem);
      line-height: var(--fsds-input-typography-line-height-default, 1.5);
      padding-block: var(--fsds-input-size-padding-block-default, 4px);
      padding-inline: var(--fsds-input-size-padding-inline-default, 8px);
      transition-property: background-color, border-color, color, outline-color;
      transition-duration: var(--fsds-input-motion-duration-fast, 150ms);
      transition-timing-function: var(--fsds-input-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));

      &::placeholder {
        color: var(--fsds-input-color-text-placeholder, #888889);
      }

      &:hover:not(:disabled) {
        border-color: var(--fsds-input-color-border-hover, #888889);
      }

      &:focus-visible:not(:disabled) {
        border-color: var(--fsds-input-color-focus-default, #0566fe);
        outline-width: var(--fsds-input-focus-ring-width, 2px);
        outline-color: var(--fsds-input-focus-ring-color, #0566fe);
        outline-style: var(--fsds-input-focus-ring-style, solid);
        outline-offset: var(--fsds-input-focus-ring-offset, 2px);
      }

      &:disabled {
        background-color: var(--fsds-input-color-bg-disabled, #b8b8b8);
        border-color: var(--fsds-input-color-border-disabled, #b8b8b8);
        color: var(--fsds-input-color-text-disabled, #727272);
        opacity: var(--fsds-input-opacity-disabled, 0.5);
        cursor: not-allowed;
      }
    }

    .input--invalid {
      border-color: var(--fsds-input-color-invalid-default, #b31b1b);
    }

    .input--invalid:focus-visible:not(:disabled) {
      border-color: var(--fsds-input-color-invalid-default, #b31b1b);
      outline-color: var(--fsds-semantic-focus-ring-intent-danger, #b31b1b);
    }
  `;

  @property({ type: String }) type?: string;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ attribute: false }) onChange?: (value: string) => void;
  @property({ type: String }) placeholder?: string;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) invalid?: boolean;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: String }) name?: string;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ type: String }) ariaLabelledby?: string;

  private behavior = new InputBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  private handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "input");
  }

  private computeClasses(): string {
    return [
      "input",
      this.disabled ? "input--disabled" : null,
      this.invalid ? "input--invalid" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<input class="${this.computeClasses()}" role="textbox" @change=${(e: Event) => this.handleValueChange(e)} .value=${this.behavior.value} ?disabled=${this.disabled ?? false} aria-invalid=${ifDefined(this.invalid === undefined ? undefined : (this.invalid ? 'true' : 'false'))} type=${ifDefined(this.type)} placeholder=${ifDefined(this.placeholder)} name=${ifDefined(this.name)} ?required=${this.required ?? false} aria-label=${ifDefined(this.ariaLabel ?? undefined)} aria-labelledby=${ifDefined(this.ariaLabelledby)} />`;
  }
}

customElements.define('fsds-input', InputElement);

// @generated:end

// @custom:start trailing

// @custom:end