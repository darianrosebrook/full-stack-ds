// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { CheckboxBehavior } from './CheckboxBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CheckboxSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CheckboxElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .checkbox {
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
      --fsds-checkbox-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-checkbox-color-border-default: var(--fsds-semantic-color-border-default, #aeaeae);
      --fsds-checkbox-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-checkbox-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-checkbox-transition-duration: var(--fsds-core-motion-duration-short, 150ms);
      --fsds-checkbox-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-checkbox-focus-ring-color: var(--fsds-semantic-focus-ring-color, #0a65fe);
      --fsds-checkbox-focus-ring-style: var(--fsds-semantic-focus-ring-style, solid);
      --fsds-checkbox-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);

      &:hover .checkbox__indicator {
        --fsds-checkbox-color-border-default: var(--fsds-semantic-color-border-hover, #f29495);
      }
    }

    :has(.checkbox__input:checked) .checkbox__indicator {
      --fsds-checkbox-color-background-default: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
    }

    :has(.checkbox__input:disabled) .checkbox__indicator {
      --fsds-checkbox-color-background-default: var(--fsds-semantic-color-background-disabled, #cecece);
    }

    .checkbox {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }

    .checkbox__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .checkbox__indicator {
      display: inline-block;
      position: relative;
      width: 16px;
      height: 16px;
      border-radius: var(--fsds-checkbox-border-radius);
      border-color: var(--fsds-checkbox-color-border-default);
      background-color: var(--fsds-checkbox-color-background-default);
      border-style: solid;
      border-width: var(--fsds-checkbox-border-width);
      box-sizing: border-box;
      transition-duration: var(--fsds-checkbox-transition-duration);
    }

    :has(.checkbox__input:focus-visible) .checkbox__indicator {
      outline-width: var(--fsds-checkbox-focus-ring-width);
      outline-color: var(--fsds-checkbox-focus-ring-color);
      outline-style: var(--fsds-checkbox-focus-ring-style);
      outline-offset: var(--fsds-checkbox-focus-ring-offset);
    }
  `;

  @property({ type: String }) size?: CheckboxSize = "md";
  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ attribute: false }) onChange?: (checked: boolean) => void;
  @property({ type: Boolean }) indeterminate?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) name?: string;
  @property({ type: String }) value?: string;

  private behavior = new CheckboxBehavior(this, {
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
  });

  private handleCheckedChange(event: Event): void {
    this.behavior.setChecked((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "checkbox",
      this.size ? `checkbox--${this.size}` : null,
      this.behavior.checked ? "checkbox--checked" : null,
      this.disabled ? "checkbox--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<input class="${this.computeClasses()}" type="checkbox" role="checkbox" @change=${(e: Event) => this.handleCheckedChange(e)} ?checked=${this.behavior.checked} ?disabled=${this.disabled ?? false} name=${ifDefined(this.name)} value=${ifDefined(this.value)} aria-checked=${(this.indeterminate ? "mixed" : this.behavior.checked)} />`;
  }
}

customElements.define('fsds-checkbox', CheckboxElement);
// @generated:end

// @custom:start trailing

// @custom:end