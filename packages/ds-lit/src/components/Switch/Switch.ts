// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { SwitchBehavior } from './SwitchBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SwitchSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SwitchElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) checked?: boolean;
  @property({ type: Boolean }) defaultChecked?: boolean;
  @property() size?: SwitchSize = "md";
  @property({ type: Boolean }) disabled?: boolean;
  @property() name?: string;
  @property() value?: string;
  @property({ attribute: false }) onChange?: (value: boolean) => void;

  private behavior = new SwitchBehavior(this, {
    checked: () => this.checked,
    defaultChecked: this.defaultChecked,
    onChange: (v) => this.onChange?.(v),
  });

  private handleCheckedChange(event: Event): void {
    this.behavior.setChecked((event.target as HTMLInputElement).checked);
  }

  private computeClasses(): string {
    return [
      "switch",
      this.size ? `switch--${this.size}` : null,
      this.behavior.checked ? "switch--checked" : null,
      this.disabled ? "switch--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<label class="${this.computeClasses()}">
  <input class=${'switch__input'} type="checkbox" role="switch" ?checked=${this.behavior.checked} @change=${(e: Event) => this.handleCheckedChange(e)} ?disabled=${this.disabled} .name=${this.name} .value=${this.value} />
  <span class=${'switch__track'} aria-hidden="true">
    <span class=${'switch__thumb'}></span>
  </span>
</label>`;
  }
}

customElements.define('fsds-switch', SwitchElement);
// @generated:end

// @custom:start trailing

// @custom:end