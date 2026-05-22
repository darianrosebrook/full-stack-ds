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
      --fsds-checkbox-color-border-hover: var(--fsds-semantic-color-border-hover, #f29495);
      --fsds-checkbox-color-background-checked: var(--fsds-semantic-color-action-background-primary-default, #d9292b);
      --fsds-checkbox-color-background-disabled: var(--fsds-semantic-color-background-disabled, #cecece);
    }
    
    .checkbox {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    
      &:hover .checkbox__indicator {
        border-color: var(--fsds-checkbox-color-border-hover);
      }
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
    
    :has(.checkbox__input:checked) .checkbox__indicator {
      background-color: var(--fsds-checkbox-color-background-checked);
      border-color: var(--fsds-checkbox-color-background-checked);
    }
    
    :has(.checkbox__input:disabled) .checkbox__indicator {
      background-color: var(--fsds-checkbox-color-background-disabled);
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
    return html`<input class="${this.computeClasses()}" type="checkbox" role="checkbox" ?checked=${this.behavior.checked} @change=${(e: Event) => this.handleCheckedChange(e)} ?disabled=${this.disabled ?? false} />`;
  }
}

customElements.define('fsds-checkbox', CheckboxElement);
// @generated:end

// @custom:start trailing

// @custom:end