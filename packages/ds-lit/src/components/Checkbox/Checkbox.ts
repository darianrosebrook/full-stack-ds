// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { CheckboxBehavior } from './CheckboxBehavior.js';
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
      --fsds-checkbox-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-checkbox-color-border-default: var(--fsds-semantic-color-border-default, #aeaeae);
      --fsds-checkbox-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-checkbox-border-radius: var(--fsds-core-shape-radius-small, 4px);
      --fsds-checkbox-transition-duration: var(--fsds-core-motion-duration-short, 150ms);
    
      &:hover {
        --fsds-checkbox-color-border-hover: var(--fsds-semantic-color-border-hover, #f29495);
      }
    
      &:disabled {
        --fsds-checkbox-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
      }
    
      &:checked {
        --fsds-checkbox-color-background-checked: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      }
    }
    
    .checkbox {
      background-color: var(--fsds-checkbox-color-background-default);
      border-color: var(--fsds-checkbox-color-border-default);
      border-width: var(--fsds-checkbox-border-width);
      border-radius: var(--fsds-checkbox-border-radius);
      transition-duration: var(--fsds-checkbox-transition-duration);
    
      &:hover {
        border-color: var(--fsds-checkbox-color-border-hover);
      }
    
      &:disabled {
        background-color: var(--fsds-checkbox-color-background-disabled);
      }
    
      &:checked {
        background-color: var(--fsds-checkbox-color-background-checked);
      }
    }
  `;

  @property({ attribute: false }) size?: CheckboxSize = "md";
  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ type: Boolean }) indeterminate?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property({ type: String }) name?: string;
  @property({ type: String }) value?: string;
  @property({ attribute: false }) onChange?: (value: boolean) => void;

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
    return html`<input class="${this.computeClasses()}" type="checkbox" role="checkbox" ?checked=${this.behavior.checked} @change=${(e: Event) => this.handleCheckedChange(e)} ?disabled=${this.disabled ?? false} />`;
  }
}

customElements.define('fsds-checkbox', CheckboxElement);
// @generated:end

// @custom:start trailing

// @custom:end