// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ToggleSwitchBehavior } from './ToggleSwitchBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToggleSwitchSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ToggleSwitchElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property() size?: ToggleSwitchSize = "medium";
  @property({ type: Boolean }) disabled?: boolean;
  @property() ariaLabel?: string;
  @property() ariaDescribedby?: string;
  @property({ attribute: false }) onChange?: (value: boolean) => void;

  private behavior = new ToggleSwitchBehavior(this, {
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
  });

  private handleCheckedChange(event: Event): void {
    this.behavior.setChecked((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "toggle-switch",
      this.size ? `toggle-switch--${this.size}` : null,
      this.behavior.checked ? "toggle-switch--checked" : null,
      this.disabled ? "toggle-switch--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<button class="${this.computeClasses()}" type="button" ?aria-checked=${this.behavior.checked} aria-label=${this.ariaLabel} aria-describedby=${this.ariaDescribedby} ?disabled=${this.disabled} @click=${(e: Event) => this.handleCheckedChange(e)}></button>`;
  }
}

customElements.define('fsds-toggle-switch', ToggleSwitchElement);
// @generated:end

// @custom:start trailing

// @custom:end