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
  static override styles = css`
    :host { display: contents; }
    .text-field {
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
      --fsds-text-field-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-text-field-field-padding-block: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-text-field-field-padding-inline: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-text-field-field-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-text-field-border-width: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-text-field-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-text-field-color-input-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-text-field-color-input-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-field-color-input-placeholder: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-text-field-color-input-border: var(--fsds-semantic-color-border-default, #a0a0a1);
      --fsds-text-field-color-input-borderHover: var(--fsds-semantic-color-border-hover, #888889);
      --fsds-text-field-color-input-backgroundDisabled: var(--fsds-semantic-interaction-background-disabled, #b8b8b8);
      --fsds-text-field-color-input-textDisabled: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-text-field-color-input-borderDisabled: var(--fsds-semantic-color-border-disabled, #b8b8b8);
      --fsds-text-field-color-input-borderError: var(--fsds-semantic-color-status-danger, #d92d2e);
      --fsds-text-field-color-error: var(--fsds-semantic-color-foreground-danger, #d92d2e);
      --fsds-text-field-color-supporting-text: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-text-field-typography-label-size: var(--fsds-semantic-typography-caption-01, 0.875rem);
      --fsds-text-field-typography-label-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-text-field-typography-label-line-height: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-text-field-typography-field-size: var(--fsds-semantic-typography-body-02, 1rem);
      --fsds-text-field-typography-field-line-height: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-text-field-typography-supporting-size: var(--fsds-semantic-typography-caption-01, 0.875rem);
      --fsds-text-field-typography-supporting-line-height: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-text-field-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-text-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-text-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-text-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-text-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
      --fsds-text-field-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-text-field-motion-easing-standard: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }

    .text-field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-text-field-spacing-gap, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
    }

    .text-field__label {
      display: inline-block;
      font-size: var(--fsds-text-field-typography-label-size, 0.875rem);
      font-weight: var(--fsds-text-field-typography-label-weight, 500);
      line-height: var(--fsds-text-field-typography-label-line-height, 1.5);
      color: var(--fsds-text-field-color-input-text, #141414);
    }

    .text-field__field {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      background-color: var(--fsds-text-field-color-input-background, #ffffff);
      border-color: var(--fsds-text-field-color-input-border, #a0a0a1);
      border-width: var(--fsds-text-field-border-width, 1px);
      border-radius: var(--fsds-text-field-border-radius, 6px);
      color: var(--fsds-text-field-color-input-text, #141414);
      font-size: var(--fsds-text-field-typography-field-size, 1rem);
      line-height: var(--fsds-text-field-typography-field-line-height, 1.5);
      min-height: var(--fsds-text-field-field-min-height, 32px);
      padding-block: var(--fsds-text-field-field-padding-block, 4px);
      padding-inline: var(--fsds-text-field-field-padding-inline, 8px);
      transition-property: background-color, border-color, color, outline-color;
      transition-duration: var(--fsds-text-field-motion-duration-fast, 150ms);
      transition-timing-function: var(--fsds-text-field-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }

    .text-field__description {
      display: block;
      font-size: var(--fsds-text-field-typography-supporting-size, 0.875rem);
      line-height: var(--fsds-text-field-typography-supporting-line-height, 1.5);
      color: var(--fsds-text-field-color-supporting-text, #727272);
    }

    .text-field__error {
      display: block;
      font-size: var(--fsds-text-field-typography-supporting-size, 0.875rem);
      line-height: var(--fsds-text-field-typography-supporting-line-height, 1.5);
      color: var(--fsds-text-field-color-error, #d92d2e);
    }

    .text-field__field::placeholder {
      color: var(--fsds-text-field-color-input-placeholder, #727272);
    }

    .text-field__field:hover:not(:disabled) {
      border-color: var(--fsds-text-field-color-input-borderHover, #888889);
    }

    .text-field__field:focus-visible {
      border-color: var(--fsds-text-field-focus-ring-color, #0566fe);
      outline-width: var(--fsds-text-field-focus-ring-width, 2px);
      outline-color: var(--fsds-text-field-focus-ring-color, #0566fe);
      outline-style: var(--fsds-text-field-focus-ring-style, solid);
      outline-offset: var(--fsds-text-field-focus-ring-offset, 2px);
    }

    .text-field--invalid .text-field__field {
      border-color: var(--fsds-text-field-color-input-borderError, #d92d2e);
    }

    .text-field--invalid .text-field__field:focus-visible {
      border-color: var(--fsds-text-field-color-input-borderError, #d92d2e);
      outline-color: var(--fsds-text-field-color-input-borderError, #d92d2e);
    }

    .text-field__field:disabled {
      background-color: var(--fsds-text-field-color-input-backgroundDisabled, #b8b8b8);
      border-color: var(--fsds-text-field-color-input-borderDisabled, #b8b8b8);
      color: var(--fsds-text-field-color-input-textDisabled, #727272);
      opacity: var(--fsds-text-field-opacity-disabled, 0.5);
      cursor: not-allowed;
    }
  `;

  @property({ type: String }) type?: string;
  @property({ type: String }) value?: string;
  @property({ type: String }) defaultValue?: string;
  @property({ attribute: false }) onChange?: (value: string) => void;
  @property({ type: Boolean }) invalid?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: Boolean }) required?: boolean;
  @property({ type: String }) name?: string;
  @property({ type: String }) ariaDescribedby?: string;

  private behavior = new TextFieldBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
  });

  private handleValueChange(event: Event): void {
    this.behavior.setValue((event.target as HTMLInputElement).value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "text-field");
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
  <label class=${'text-field__label'} id="text-field-label">
    <slot name="label" @slotchange=${() => this.requestUpdate()}></slot>
  </label>
  <input class=${'text-field__field'} @change=${(e: Event) => this.handleValueChange(e)} type=${ifDefined(this.type)} .value=${this.behavior.value} ?disabled=${this.disabled ?? false} name=${ifDefined(this.name)} ?required=${this.required ?? false} aria-invalid=${ifDefined(this.invalid === undefined ? undefined : (this.invalid ? 'true' : 'false'))} aria-labelledby=${ifDefined([this.querySelector('[slot="label"]') !== null ? 'text-field-label' : null].filter(Boolean).join(' ') || undefined)} aria-describedby=${ifDefined([this.querySelector('[slot="description"]') !== null ? 'text-field-description' : null, this.querySelector('[slot="error"]') !== null && this.invalid ? 'text-field-error' : null, this.ariaDescribedby].filter(Boolean).join(' ') || undefined)} />
  <span class=${'text-field__description'} id="text-field-description">
    <slot name="description" @slotchange=${() => this.requestUpdate()}></slot>
  </span>
  <span class=${'text-field__error'} role="alert" id="text-field-error">
    <slot name="error" @slotchange=${() => this.requestUpdate()}></slot>
  </span>
</div>`;
  }
}

customElements.define('fsds-text-field', TextFieldElement);

export class TextFieldDescriptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .text-field {
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
      --fsds-text-field-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-text-field-field-padding-block: var(--fsds-semantic-input-size-medium-padding-block, 4px);
      --fsds-text-field-field-padding-inline: var(--fsds-semantic-input-size-medium-padding-inline, 8px);
      --fsds-text-field-field-min-height: var(--fsds-semantic-input-size-medium-min-height, 32px);
      --fsds-text-field-border-width: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-text-field-border-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-text-field-color-input-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-text-field-color-input-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-field-color-input-placeholder: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-text-field-color-input-border: var(--fsds-semantic-color-border-default, #a0a0a1);
      --fsds-text-field-color-input-borderHover: var(--fsds-semantic-color-border-hover, #888889);
      --fsds-text-field-color-input-backgroundDisabled: var(--fsds-semantic-interaction-background-disabled, #b8b8b8);
      --fsds-text-field-color-input-textDisabled: var(--fsds-semantic-color-foreground-disabled, #727272);
      --fsds-text-field-color-input-borderDisabled: var(--fsds-semantic-color-border-disabled, #b8b8b8);
      --fsds-text-field-color-input-borderError: var(--fsds-semantic-color-status-danger, #d92d2e);
      --fsds-text-field-color-error: var(--fsds-semantic-color-foreground-danger, #d92d2e);
      --fsds-text-field-color-supporting-text: var(--fsds-semantic-color-foreground-tertiary, #727272);
      --fsds-text-field-typography-label-size: var(--fsds-semantic-typography-caption-01, 0.875rem);
      --fsds-text-field-typography-label-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-text-field-typography-label-line-height: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-text-field-typography-field-size: var(--fsds-semantic-typography-body-02, 1rem);
      --fsds-text-field-typography-field-line-height: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-text-field-typography-supporting-size: var(--fsds-semantic-typography-caption-01, 0.875rem);
      --fsds-text-field-typography-supporting-line-height: var(--fsds-semantic-typography-line-height-normal, 1.5);
      --fsds-text-field-opacity-disabled: var(--fsds-semantic-interaction-disabled-opacity, 0.5);
      --fsds-text-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-text-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0566fe);
      --fsds-text-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-text-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
      --fsds-text-field-motion-duration-fast: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-text-field-motion-easing-standard: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }

    .text-field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-text-field-spacing-gap, 8px);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      flex-direction: column;
    }

    .text-field__label {
      display: inline-block;
      font-size: var(--fsds-text-field-typography-label-size, 0.875rem);
      font-weight: var(--fsds-text-field-typography-label-weight, 500);
      line-height: var(--fsds-text-field-typography-label-line-height, 1.5);
      color: var(--fsds-text-field-color-input-text, #141414);
    }

    .text-field__field {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      background-color: var(--fsds-text-field-color-input-background, #ffffff);
      border-color: var(--fsds-text-field-color-input-border, #a0a0a1);
      border-width: var(--fsds-text-field-border-width, 1px);
      border-radius: var(--fsds-text-field-border-radius, 6px);
      color: var(--fsds-text-field-color-input-text, #141414);
      font-size: var(--fsds-text-field-typography-field-size, 1rem);
      line-height: var(--fsds-text-field-typography-field-line-height, 1.5);
      min-height: var(--fsds-text-field-field-min-height, 32px);
      padding-block: var(--fsds-text-field-field-padding-block, 4px);
      padding-inline: var(--fsds-text-field-field-padding-inline, 8px);
      transition-property: background-color, border-color, color, outline-color;
      transition-duration: var(--fsds-text-field-motion-duration-fast, 150ms);
      transition-timing-function: var(--fsds-text-field-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }

    .text-field__description {
      display: block;
      font-size: var(--fsds-text-field-typography-supporting-size, 0.875rem);
      line-height: var(--fsds-text-field-typography-supporting-line-height, 1.5);
      color: var(--fsds-text-field-color-supporting-text, #727272);
    }

    .text-field__error {
      display: block;
      font-size: var(--fsds-text-field-typography-supporting-size, 0.875rem);
      line-height: var(--fsds-text-field-typography-supporting-line-height, 1.5);
      color: var(--fsds-text-field-color-error, #d92d2e);
    }

    .text-field__field::placeholder {
      color: var(--fsds-text-field-color-input-placeholder, #727272);
    }

    .text-field__field:hover:not(:disabled) {
      border-color: var(--fsds-text-field-color-input-borderHover, #888889);
    }

    .text-field__field:focus-visible {
      border-color: var(--fsds-text-field-focus-ring-color, #0566fe);
      outline-width: var(--fsds-text-field-focus-ring-width, 2px);
      outline-color: var(--fsds-text-field-focus-ring-color, #0566fe);
      outline-style: var(--fsds-text-field-focus-ring-style, solid);
      outline-offset: var(--fsds-text-field-focus-ring-offset, 2px);
    }

    .text-field--invalid .text-field__field {
      border-color: var(--fsds-text-field-color-input-borderError, #d92d2e);
    }

    .text-field--invalid .text-field__field:focus-visible {
      border-color: var(--fsds-text-field-color-input-borderError, #d92d2e);
      outline-color: var(--fsds-text-field-color-input-borderError, #d92d2e);
    }

    .text-field__field:disabled {
      background-color: var(--fsds-text-field-color-input-backgroundDisabled, #b8b8b8);
      border-color: var(--fsds-text-field-color-input-borderDisabled, #b8b8b8);
      color: var(--fsds-text-field-color-input-textDisabled, #727272);
      opacity: var(--fsds-text-field-opacity-disabled, 0.5);
      cursor: not-allowed;
    }
  `;

  override render() {
    return html`<fsds-stack as="p" class="text-field__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-text-field-description', TextFieldDescriptionElement);
// @generated:end

// @custom:start trailing

// @custom:end