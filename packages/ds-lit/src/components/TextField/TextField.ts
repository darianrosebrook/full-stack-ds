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
      --fsds-text-field-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-text-field-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-text-field-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-text-field-color-input-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-field-color-input-placeholder: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-text-field-color-input-borderError: var(--fsds-semantic-color-status-danger, #d9292b);
      --fsds-text-field-color-error: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-text-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-text-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-text-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-text-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .text-field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-text-field-spacing-gap);
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
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--fsds-text-field-color-input-text);
    }
    
    .text-field__field {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      border-width: var(--fsds-text-field-border-width);
      border-radius: var(--fsds-text-field-border-radius);
      color: var(--fsds-text-field-color-input-text);
      font-size: 1rem;
      padding: 8px 12px;
    }
    
    .text-field__description {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-text-field-color-input-text);
    }
    
    .text-field__error {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-text-field-color-error);
    }
    
    .text-field__field:focus-visible {
      outline-width: var(--fsds-text-field-focus-ring-width);
      outline-color: var(--fsds-text-field-focus-ring-color);
      outline-style: var(--fsds-text-field-focus-ring-style);
      outline-offset: var(--fsds-text-field-focus-ring-offset);
    }
    
    .text-field--invalid .text-field__field {
      border-color: var(--fsds-text-field-color-input-borderError);
    }
    
    .text-field__field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ attribute: false }) label?: unknown;
  @property({ attribute: false }) description?: unknown;
  @property({ attribute: false }) error?: unknown;
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
  <input class=${'text-field__field'} @change=${(e: Event) => this.handleValueChange(e)} type=${ifDefined(this.type)} .value=${this.behavior.value} ?disabled=${this.disabled ?? false} name=${ifDefined(this.name)} ?required=${this.required ?? false} aria-invalid=${ifDefined(this.invalid === undefined ? undefined : (this.invalid ? 'true' : 'false'))} aria-describedby=${ifDefined(this.ariaDescribedby)} />
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
  static override styles = css`
    :host { display: contents; }
    .text-field {
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
      --fsds-text-field-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-text-field-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-text-field-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-text-field-color-input-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-field-color-input-placeholder: var(--fsds-semantic-color-foreground-tertiary, #717171);
      --fsds-text-field-color-input-borderError: var(--fsds-semantic-color-status-danger, #d9292b);
      --fsds-text-field-color-error: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-text-field-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-text-field-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-text-field-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-text-field-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
    }
    
    .text-field {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-text-field-spacing-gap);
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
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--fsds-text-field-color-input-text);
    }
    
    .text-field__field {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border-style: solid;
      border-width: var(--fsds-text-field-border-width);
      border-radius: var(--fsds-text-field-border-radius);
      color: var(--fsds-text-field-color-input-text);
      font-size: 1rem;
      padding: 8px 12px;
    }
    
    .text-field__description {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-text-field-color-input-text);
    }
    
    .text-field__error {
      display: block;
      font-size: 0.875em;
      color: var(--fsds-text-field-color-error);
    }
    
    .text-field__field:focus-visible {
      outline-width: var(--fsds-text-field-focus-ring-width);
      outline-color: var(--fsds-text-field-focus-ring-color);
      outline-style: var(--fsds-text-field-focus-ring-style);
      outline-offset: var(--fsds-text-field-focus-ring-offset);
    }
    
    .text-field--invalid .text-field__field {
      border-color: var(--fsds-text-field-color-input-borderError);
    }
    
    .text-field__field:disabled {
      opacity: 0.5;
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