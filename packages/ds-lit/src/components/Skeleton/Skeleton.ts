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
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: 100%;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 1em;
      --fsds-box-model-max-height: none;
      --fsds-skeleton-color-base: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-skeleton-color-highlight: var(--fsds-semantic-color-background-highlight, #f5a2a1);
      --fsds-skeleton-color-static: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-skeleton-radius-sm: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-skeleton-radius-lg: var(--fsds-semantic-shape-radius-large, 16px);
      --fsds-skeleton-radius-full: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-skeleton-gap-compact: var(--fsds-core-spacing-size-03, 4px);
      --fsds-skeleton-gap-md: var(--fsds-core-spacing-size-05, 12px);
      --fsds-skeleton-gap-spacious: var(--fsds-core-spacing-size-07, 24px);
      --fsds-skeleton-anim-duration: var(--fsds-core-motion-duration-long, 400ms);
      --fsds-skeleton-anim-easing: var(--fsds-core-motion-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
      --fsds-skeleton-shape-height-text: var(--fsds-core-typography-ramp-4, 1rem);
    }

    .skeleton--block {
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-radius-medium, 8px);
    }

    .skeleton--text {
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-skeleton-shape-height-text: var(--fsds-core-typography-ramp-4, 1rem);
    }

    .skeleton--avatar {
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-control-radius-pill, 9999px);
    }

    .skeleton--media {
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-radius-medium, 8px);
    }

    .skeleton--dataviz {
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-radius-medium, 8px);
    }

    .skeleton--actions {
      --fsds-skeleton-radius-md: var(--fsds-semantic-shape-radius-medium, 8px);
    }

    .skeleton--wipe {
      --fsds-skeleton-color-base: var(--fsds-semantic-color-background-tertiary, #d0d0d0);
    }

    .skeleton--compact {
      --fsds-skeleton-gap-md: var(--fsds-skeleton-gap-compact, 4px);
    }

    .skeleton--regular {
      --fsds-skeleton-gap-md: var(--fsds-core-spacing-size-05, 12px);
    }

    .skeleton--spacious {
      --fsds-skeleton-gap-md: var(--fsds-skeleton-gap-spacious, 24px);
    }

    .skeleton {
      display: block;
      box-sizing: border-box;
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
      background-color: var(--fsds-skeleton-color-base, #f7f7f7);
      border-radius: var(--fsds-skeleton-radius-md, 8px);
      transition-duration: var(--fsds-skeleton-anim-duration, 400ms);
      transition-timing-function: var(--fsds-skeleton-anim-easing, cubic-bezier(0.4, 0, 0.2, 1));
      animation: skeleton-shimmer calc(var(--fsds-skeleton-anim-duration, 400ms) * 2) var(--fsds-skeleton-anim-easing, cubic-bezier(0.4, 0, 0.2, 1)) infinite;

      &:has(.skeleton__stack) {
        background-color: transparent;
        animation: none;
        height: auto;
      }

      &:has(.skeleton__stack) .skeleton__shape {
        height: var(--fsds-skeleton-shape-height-text, 1rem);
        animation: skeleton-shimmer calc(var(--fsds-skeleton-anim-duration, 400ms) * 2) var(--fsds-skeleton-anim-easing, cubic-bezier(0.4, 0, 0.2, 1)) infinite;
      }
    }

    .skeleton__shape {
      display: block;
      background-color: var(--fsds-skeleton-color-base, #f7f7f7);
      border-radius: var(--fsds-skeleton-radius-md, 8px);
    }

    .skeleton__stack {
      display: flex;
      flex-direction: column;
      gap: var(--fsds-skeleton-gap-md, 12px);
    }

    .skeleton--block {
      border-radius: var(--fsds-skeleton-radius-md, 8px);
    }

    .skeleton--text {
      border-radius: var(--fsds-skeleton-radius-md, 8px);
      height: var(--fsds-skeleton-shape-height-text, 1rem);
    }

    .skeleton--avatar {
      border-radius: var(--fsds-skeleton-radius-md, 8px);
      aspect-ratio: 1;
    }

    .skeleton--media {
      border-radius: var(--fsds-skeleton-radius-md, 8px);
      aspect-ratio: 16 / 9;
      width: 100%;
    }

    .skeleton--dataviz {
      border-radius: var(--fsds-skeleton-radius-md, 8px);
      aspect-ratio: 4 / 3;
      width: 100%;
    }

    .skeleton--actions {
      border-radius: var(--fsds-skeleton-radius-md, 8px);
      height: 36px;
      min-width: 80px;
    }

    .skeleton--shimmer {
      animation: skeleton-shimmer calc(var(--fsds-skeleton-anim-duration, 400ms) * 2) var(--fsds-skeleton-anim-easing, cubic-bezier(0.4, 0, 0.2, 1)) infinite;
    }

    .skeleton--wipe {
      overflow: hidden;
      position: relative;
      animation: none;
    }

    .skeleton--wipe::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, var(--fsds-skeleton-color-highlight, rgba(255,255,255,0.55)), transparent);
      transform: translateX(-100%);
      animation: skeleton-wipe calc(var(--fsds-skeleton-anim-duration, 400ms) * 2) var(--fsds-skeleton-anim-easing, cubic-bezier(0.4, 0, 0.2, 1)) infinite;
    }

    .skeleton--pulse {
      animation: skeleton-shimmer calc(var(--fsds-skeleton-anim-duration, 400ms) * 3) ease-in-out infinite;
    }

    .skeleton--none {
      animation: none;
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

    @keyframes skeleton-wipe {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;

  @property({ type: String }) variant?: SkeletonVariant = "block";
  @property({ attribute: 'animate' })
  _animate?: SkeletonAnimate = "shimmer";
  @property({ type: String }) density?: SkeletonDensity = "regular";
  @property({ type: String }) aspectRatio?: string;
  @property({ type: Number }) lines?: number;
  @property({ type: String }) radius?: SkeletonRadius;
  @property({ type: Boolean }) decorative?: boolean = true;
  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "skeleton");
  }

  private computeClasses(): string {
    return [
      "skeleton",
      (this.variant ?? "block") ? `skeleton--${(this.variant ?? "block")}` : null,
      (this._animate ?? "shimmer") ? `skeleton--${(this._animate ?? "shimmer")}` : null,
      (this.density ?? "regular") ? `skeleton--${(this.density ?? "regular")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" .role=${((this.decorative ?? true) ? "presentation" : "status")} aria-busy=${((this.decorative ?? true) ? "false" : "true")} aria-hidden=${((this.decorative ?? true) ? "true" : "false")} aria-label=${ifDefined(this.ariaLabel ?? undefined)}>
  ${this.lines ? html`
  <div class=${'skeleton__stack'}>
    ${Array.from({ length: this.lines ?? 0 }, (_, index) => html`
    <div class=${'skeleton__row'}>
      <div class=${'skeleton__shape'} aria-hidden="true"></div>
    </div>
    `)}
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-skeleton', SkeletonElement);

// @generated:end

// @custom:start trailing

// @custom:end