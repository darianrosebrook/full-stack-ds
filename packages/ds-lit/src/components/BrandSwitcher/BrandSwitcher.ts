// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class BrandSwitcherElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) showAutoCycle?: boolean = false;
  @property({ type: Boolean }) showDensity?: boolean = false;
  @property({ type: Boolean }) showFonts?: boolean = false;
  @property({ type: Boolean }) compact?: boolean = false;
  @property({ type: Boolean }) sticky?: boolean = false;
  @property({ type: Boolean }) enableKeyboard?: boolean = true;

  private computeClasses(): string {
    return [
      "brand-switcher",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <slot></slot>
</div>`;
  }
}

customElements.define('fsds-brand-switcher', BrandSwitcherElement);
// @generated:end

// @custom:start trailing

// @custom:end