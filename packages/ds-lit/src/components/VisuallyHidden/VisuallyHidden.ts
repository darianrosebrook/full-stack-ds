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
export class VisuallyHiddenElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Boolean }) focusable?: boolean;

  private computeClasses(): string {
    return [
      "visually-hidden",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<span class="${this.computeClasses()}">
  <slot></slot>
</span>`;
  }
}

customElements.define('fsds-visually-hidden', VisuallyHiddenElement);
// @generated:end

// @custom:start trailing

// @custom:end