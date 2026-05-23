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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-feedback-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-skeleton-color-base: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-skeleton-color-highlight: var(--fsds-semantic-color-background-highlight, #f7c1c2);
      --fsds-skeleton-color-static: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-skeleton-radius-md: var(--fsds-core-shape-radius-04, 16px);
      --fsds-skeleton-gap-md: var(--fsds-core-spacing-size-07, 24px);
      --fsds-skeleton-anim-duration: var(--fsds-core-motion-duration-long, 400ms);
      --fsds-skeleton-anim-easing: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
    }
    
    .skeleton {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: block;
      background-color: var(--fsds-skeleton-color-base);
      transition-duration: var(--fsds-skeleton-anim-duration);
      transition-timing-function: var(--fsds-skeleton-anim-easing);
      animation: skeleton-shimmer var(--fsds-skeleton-anim-duration, 400ms) var(--fsds-skeleton-anim-easing, cubic-bezier(0.4, 0, 0.2, 1)) infinite;
    }
    
    @keyframes skeleton-shimmer {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  @property({ type: String }) variant?: SkeletonVariant = "block";
  @property({ attribute: 'animate' })
  _animate?: SkeletonAnimate = "shimmer";
  @property({ type: String }) density?: SkeletonDensity = "regular";
  @property({ type: String }) aspectRatio?: string;
  @property({ attribute: false }) lines?: SkeletonLines;
  @property({ type: String }) radius?: SkeletonRadius;
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