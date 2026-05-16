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
export class SlinkyCursorElement extends LitElement {
  static override styles = css`:host { display: contents; }`;


  private computeClasses(): string {
    return [
      "slinky-cursor",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <div class=${'slinky-cursor__pest'}></div>
</div>`;
  }
}

customElements.define('fsds-slinky-cursor', SlinkyCursorElement);
// @generated:end

// @custom:start trailing

// @custom:end