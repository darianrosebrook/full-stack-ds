// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ImageAspectRatio = "square" | "video" | "photo" | "wide" | "portrait";
export type ImageObjectFit = "cover" | "contain" | "fill" | "scale-down" | "none";
export type ImageLoading = "lazy" | "eager";
export type ImageRadius = "none" | "sm" | "md" | "lg" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ImageElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .image {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-display-size-gap, 4px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: 100%;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-image-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-image-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-image-size-icon: var(--fsds-core-spacing-size-08, 32px);
      --fsds-image-typography-error-fontSize: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-image-size-xs: 24px;
      --fsds-image-size-sm: 32px;
      --fsds-image-size-md: 48px;
      --fsds-image-size-lg: 64px;
      --fsds-image-size-xl: 96px;
      --fsds-image-radius-none: var(--fsds-semantic-shape-radius-none, 0px);
      --fsds-image-radius-sm: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-image-radius-md: var(--fsds-semantic-shape-radius-medium, 8px);
      --fsds-image-radius-lg: var(--fsds-semantic-shape-radius-large, 16px);
      --fsds-image-radius-full: var(--fsds-semantic-shape-radius-full, 9999px);
    }

    .image {
      display: block;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: 100%;
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-image-color-background-default);
      color: var(--fsds-image-color-foreground-primary);
    }

    .image--size-xs {
      width: var(--fsds-image-size-xs);
      height: var(--fsds-image-size-xs);
    }

    .image--size-sm {
      width: var(--fsds-image-size-sm);
      height: var(--fsds-image-size-sm);
    }

    .image--size-md {
      width: var(--fsds-image-size-md);
      height: var(--fsds-image-size-md);
    }

    .image--size-lg {
      width: var(--fsds-image-size-lg);
      height: var(--fsds-image-size-lg);
    }

    .image--size-xl {
      width: var(--fsds-image-size-xl);
      height: var(--fsds-image-size-xl);
    }

    .image--size-full {
      width: 100%;
      height: auto;
    }

    .image--radius-none {
      border-radius: var(--fsds-image-radius-none);
    }

    .image--radius-sm {
      border-radius: var(--fsds-image-radius-sm);
    }

    .image--radius-md {
      border-radius: var(--fsds-image-radius-md);
    }

    .image--radius-lg {
      border-radius: var(--fsds-image-radius-lg);
    }

    .image--radius-full {
      border-radius: var(--fsds-image-radius-full);
    }
  `;

  @property({ type: String }) src?: string;
  @property({ type: String }) alt!: string;
  @property({ type: Number }) width?: number;
  @property({ type: Number }) height?: number;
  @property({ type: String }) aspectRatio?: ImageAspectRatio;
  @property({ type: String }) objectFit?: ImageObjectFit;
  @property({ type: String }) objectPosition?: string;
  @property({ type: String }) loading?: ImageLoading;
  @property({ type: String }) sizes?: string;
  @property({ type: String }) radius?: ImageRadius;
  @property({ type: Boolean }) showPlaceholder?: boolean;
  @property({ type: String }) fallbackSrc?: string;
  @property() size?: string;

  private computeClasses(): string {
    return [
      "image",
      this.radius ? `image--radius-${this.radius}` : null,
      this.size ? `image--size-${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<img class="${this.computeClasses()}" role="img" src=${ifDefined(this.src)} alt=${ifDefined(this.alt)} width=${ifDefined(this.width)} height=${ifDefined(this.height)} loading=${ifDefined(this.loading)} sizes=${ifDefined(this.sizes)} />`;
  }
}

customElements.define('fsds-image', ImageElement);
// @generated:end

// @custom:start trailing

// @custom:end