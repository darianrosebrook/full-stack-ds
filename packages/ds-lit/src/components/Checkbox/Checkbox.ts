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
  static override styles = css`:host { display: contents; }`;

  @property() size?: CheckboxSize = "md";
  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property({ type: Boolean }) indeterminate?: boolean;
  @property({ type: Boolean }) disabled?: boolean;
  @property() name?: string;
  @property() value?: string;
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
    return html`<input class="${this.computeClasses()}" type="checkbox" ?checked=${this.behavior.checked} @change=${(e: Event) => this.handleCheckedChange(e)} ?disabled=${this.disabled} />`;
  }
}

customElements.define('fsds-checkbox', CheckboxElement);
// @generated:end

// @custom:start trailing

// @custom:end