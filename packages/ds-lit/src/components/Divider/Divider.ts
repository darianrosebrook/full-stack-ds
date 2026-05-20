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
export class DividerElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false }) orientation?: "horizontal" | "vertical";
  @property({ type: Boolean }) decorative?: boolean;
  @property({ type: String }) thickness?: string;

  private computeClasses(): string {
    return [
      "divider",
      this.orientation ? `divider--${this.orientation}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<hr class="${this.computeClasses()}" />`;
  }
}

customElements.define('fsds-divider', DividerElement);
// @generated:end

// @custom:start trailing

// @custom:end