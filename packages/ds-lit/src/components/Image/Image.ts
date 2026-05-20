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
  static override styles = css`:host { display: contents; }`;

  @property({ type: String }) src?: string;
  @property({ type: String }) alt!: string;
  @property({ type: Number }) width?: number;
  @property({ type: Number }) height?: number;
  @property({ attribute: false }) aspectRatio?: ImageAspectRatio;
  @property({ attribute: false }) objectFit?: ImageObjectFit;
  @property({ type: String }) objectPosition?: string;
  @property({ attribute: false }) loading?: ImageLoading;
  @property({ type: String }) sizes?: string;
  @property({ attribute: false }) radius?: ImageRadius;
  @property({ type: Boolean }) showPlaceholder?: boolean;
  @property({ type: String }) fallbackSrc?: string;
  @property() size?: string;

  private computeClasses(): string {
    return [
      "image",
      this.radius ? `image--${this.radius}` : null,
      this.size ? `image--${this.size}` : null,
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