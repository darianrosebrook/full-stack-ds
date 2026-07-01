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
      --fsds-input-color-bg-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-input-color-bg-disabled: var(--fsds-semantic-interaction-background-disabled, #efefef);
      --fsds-input-color-text-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-input-color-text-placeholder: var(--fsds-semantic-color-foreground-placeholder, #717171);
      --fsds-input-color-text-disabled: var(--fsds-semantic-color-foreground-disabled, #717171);
      --fsds-input-color-border-default: var(--fsds-semantic-color-border-default, #aeaeae);
      --fsds-input-color-border-hover: var(--fsds-semantic-color-border-hover, #8f8f8f);
      --fsds-input-color-border-disabled: var(--fsds-semantic-color-border-disabled, #cecece);
      --fsds-input-size-height-default: var(--fsds-semantic-input-size-medium-min-height, 36px);
      --fsds-input-size-padding-block-default: var(--fsds-semantic-input-size-medium-padding-block, 8px);
      --fsds-input-size-padding-inline-default: var(--fsds-semantic-input-size-medium-padding-inline, 12px);
      --fsds-input-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-input-size-border-default: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-input-space-inline-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-input-color-focus-default: var(--fsds-semantic-color-border-focus, #d9292b);
      --fsds-input-color-invalid-default: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-input-typography-size-default: var(--fsds-semantic-typography-body-02, 1rem);
      --fsds-input-typography-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-input-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-input-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-input-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
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
      min-height: var(--fsds-input-size-height-default);
      max-height: var(--fsds-box-model-max-height);
      box-sizing: border-box;
      border-style: solid;
      border-width: var(--fsds-input-size-border-default);
      background-color: var(--fsds-input-color-bg-default);
      color: var(--fsds-input-color-text-default);
      border-color: var(--fsds-input-color-border-default);
      border-radius: var(--fsds-input-size-radius-default);
      font-size: var(--fsds-input-typography-size-default);
      line-height: var(--fsds-input-typography-line-height-default);
      padding-block: var(--fsds-input-size-padding-block-default);
      padding-inline: var(--fsds-input-size-padding-inline-default);
      transition-property: background-color, border-color, color, outline-color;
      transition-duration: var(--fsds-input-motion-duration-fast);
      transition-timing-function: var(--fsds-input-motion-easing-standard);

      &::placeholder {
        color: var(--fsds-input-color-text-placeholder);
      }

      &:hover {
        border-color: var(--fsds-input-color-border-hover);
      }

      &:focus-visible {
        border-color: var(--fsds-input-color-focus-default);
        outline-width: var(--fsds-input-focus-ring-width);
        outline-color: var(--fsds-input-focus-ring-color);
        outline-style: var(--fsds-input-focus-ring-style);
        outline-offset: var(--fsds-input-focus-ring-offset);
      }

      &:disabled {
        background-color: var(--fsds-input-color-bg-disabled);
        border-color: var(--fsds-input-color-border-disabled);
        color: var(--fsds-input-color-text-disabled);
        opacity: var(--fsds-input-opacity-disabled);
        cursor: not-allowed;
      }
    }

    .input--invalid {
      border-color: var(--fsds-input-color-invalid-default);
    }

    .input--invalid:focus-visible {
      border-color: var(--fsds-input-color-invalid-default);
      outline-color: var(--fsds-semantic-focus-ring-intent-danger);
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
    return html`<input class="${this.computeClasses()}" role="textbox" @change=${(e: Event) => this.handleValueChange(e)} .value=${this.behavior.value} ?disabled=${this.disabled ?? false} aria-invalid=${ifDefined(this.invalid === undefined ? undefined : (this.invalid ? 'true' : 'false'))} type=${ifDefined(this.type)} placeholder=${ifDefined(this.placeholder)} name=${ifDefined(this.name)} ?required=${this.required ?? false} />`;
  }
}

customElements.define('fsds-input', InputElement);
// @generated:end

// @custom:start trailing

// @custom:end