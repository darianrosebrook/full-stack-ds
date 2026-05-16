// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ChipType = "button" | "submit" | "reset";
export type ChipVariant = "default" | "selected" | "dismissible";
export type ChipSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ChipElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() type?: ChipType;
  @property() variant?: ChipVariant;
  @property() size?: ChipSize;
  @property({ type: Boolean }) disabled?: boolean;
  @property() icon?: unknown;
  @property() ariaLabel?: string;
  @property({ type: Boolean }) ariaExpanded?: boolean;
  @property({ type: Boolean }) ariaPressed?: boolean;

  private computeClasses(): string {
    return [
      "chip",
      this.variant ? `chip--${this.variant}` : null,
      this.size ? `chip--${this.size}` : null,
      this.disabled ? "chip--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<button class="${this.computeClasses()}" .type=${this.type} ?disabled=${this.disabled} aria-label=${this.ariaLabel} ?aria-expanded=${this.ariaExpanded} ?aria-pressed=${this.ariaPressed}>
  ${this.icon ? html`
  <span class=${'chip__icon'} aria-hidden="true"></span>
  ` : nothing}
  <span class=${'chip__text'}>
    <slot></slot>
  </span>
</button>`;
  }
}

customElements.define('fsds-chip', ChipElement);
// @generated:end

// @custom:start trailing

// @custom:end