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
  static override styles = css`:host { display: contents; }`;

  @property() size?: SpinnerSize;
  @property() variant?: SpinnerVariant;
  @property() thickness?: SpinnerThickness;
  @property({ type: Boolean }) ariaHidden?: boolean;
  @property() label?: string;
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
    return html`<div class="${this.computeClasses()}">
  <span class=${'spinner__visual'} aria-hidden="true"></span>
</div>`;
  }
}

customElements.define('fsds-spinner', SpinnerElement);
// @generated:end

// @custom:start trailing

// @custom:end