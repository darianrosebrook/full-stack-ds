// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
  static override styles = css`
    :host { display: contents; }
    .skeleton {
      --fsds-skeleton-color-base: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-skeleton-color-highlight: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-skeleton-color-static: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-skeleton-radius-sm: var(--fsds-core-shape-radius-02, 4px);
      --fsds-skeleton-radius-md: var(--fsds-core-shape-radius-03, 8px);
      --fsds-skeleton-radius-lg: var(--fsds-core-shape-radius-04, 16px);
      --fsds-skeleton-gap-sm: var(--fsds-core-spacing-size-03, 4px);
      --fsds-skeleton-gap-md: var(--fsds-core-spacing-size-05, 12px);
      --fsds-skeleton-gap-lg: var(--fsds-core-spacing-size-07, 24px);
      --fsds-skeleton-anim-duration: var(--fsds-core-motion-duration-long, 400ms);
      --fsds-skeleton-anim-easing: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }
    
    .skeleton {
      border-radius: var(--fsds-skeleton-radius-lg);
      gap: var(--fsds-skeleton-gap-lg);
      transition-duration: var(--fsds-skeleton-anim-duration);
      transition-timing-function: var(--fsds-skeleton-anim-easing);
    }
  `;

  @property({ attribute: false }) variant?: SkeletonVariant = "block";
  @property({ attribute: 'animate' })
  _animate?: SkeletonAnimate = "shimmer";
  @property({ attribute: false }) density?: SkeletonDensity = "regular";
  @property({ type: String }) aspectRatio?: string;
  @property({ attribute: false }) lines?: SkeletonLines;
  @property({ attribute: false }) radius?: SkeletonRadius;
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
    return html`<div class="${this.computeClasses()}" aria-busy="true" role="status" aria-label=${ifDefined(this.ariaLabel ?? undefined)}></div>`;
  }
}

customElements.define('fsds-skeleton', SkeletonElement);
// @generated:end

// @custom:start trailing

// @custom:end