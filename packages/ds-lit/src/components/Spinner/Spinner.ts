// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerVariant = "ring" | "dots" | "bars";
export type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SpinnerElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .spinner {
      --fsds-spinner-dots-gap: var(--fsds-core-spacing-size-04, 8px);
    }
    
    .spinner {
      gap: var(--fsds-spinner-dots-gap);
      /* --fsds-spinner-size-xs: ; */
      /* --fsds-spinner-size-sm: ; */
      /* --fsds-spinner-size-md: ; */
      /* --fsds-spinner-size-lg: ; */
      /* --fsds-spinner-thickness-hairline: ; */
      /* --fsds-spinner-thickness-regular: ; */
      /* --fsds-spinner-thickness-bold: ; */
      /* --fsds-semantic-color-background-accent: #d9292b; */
      /* --fsds-semantic-color-border-subtle: #cecece; */
      /* --fsds-spinner-anim-duration: ; */
    }
  `;

  @property({ attribute: false }) size?: SpinnerSize;
  @property({ attribute: false }) variant?: SpinnerVariant;
  @property({ attribute: false }) thickness?: SpinnerThickness;
  @property({ attribute: 'aria-hidden', reflect: true })
  override ariaHidden: string | null = null;
  @property({ type: String }) label?: string;
  @property({ type: Boolean }) inline?: boolean;
  @property({ type: Number }) showAfterMs?: number;

  private computeClasses(): string {
    return [
      "spinner",
      this.size ? `spinner--${this.size}` : null,
      this.variant ? `spinner--${this.variant}` : null,
      this.thickness ? `spinner--${this.thickness}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="status">
  <span class=${'spinner__visual'} aria-hidden="true"></span>
</div>`;
  }
}

customElements.define('fsds-spinner', SpinnerElement);
// @generated:end

// @custom:start trailing

// @custom:end