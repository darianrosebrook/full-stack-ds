// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SkeletonVariant = "block" | "text" | "avatar" | "media" | "dataviz" | "actions";
export type SkeletonAnimate = "shimmer" | "wipe" | "pulse" | "none";
export type SkeletonDensity = "compact" | "regular" | "spacious";
export type SkeletonLines = number | { min: number; max: number };
export type SkeletonRadius = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SkeletonElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() variant?: SkeletonVariant = "block";
  @property({ attribute: 'animate' })
  _animate?: SkeletonAnimate = "shimmer";
  @property() density?: SkeletonDensity = "regular";
  @property() aspectRatio?: string;
  @property() lines?: SkeletonLines;
  @property() radius?: SkeletonRadius;
  @property({ type: Boolean }) decorative?: boolean = true;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;

  private computeClasses(): string {
    return [
      "skeleton",
      this.variant ? `skeleton--${this.variant}` : null,
      this._animate ? `skeleton--${this._animate}` : null,
      this.density ? `skeleton--${this.density}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" aria-busy="true" role="status" aria-label=${this.ariaLabel}></div>`;
  }
}

customElements.define('fsds-skeleton', SkeletonElement);
// @generated:end

// @custom:start trailing

// @custom:end