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
  static override styles = css`
    :host { display: contents; }
    .divider {
      /* --fsds-semantic-color-border-light: #fceaea; */
      /* --fsds-semantic-color-border-subtle: #cecece; */
      /* --fsds-semantic-color-border-light: #fceaea; */
      /* --fsds-core-shape-border-width-hairline: 1px; */
      /* --fsds-core-shape-border-width-hairline: 1px; */
      /* --fsds-core-spacing-size-04: 8px; */
    }
  `;

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
    return html`<hr class="${this.computeClasses()}" role="separator" />`;
  }
}

customElements.define('fsds-divider', DividerElement);
// @generated:end

// @custom:start trailing

// @custom:end