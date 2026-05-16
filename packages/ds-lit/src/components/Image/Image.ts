// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
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

  @property() src?: string;
  @property() alt!: string;
  @property({ type: Number }) width?: number;
  @property({ type: Number }) height?: number;
  @property() aspectRatio?: ImageAspectRatio;
  @property() objectFit?: ImageObjectFit;
  @property() objectPosition?: string;
  @property() loading?: ImageLoading;
  @property() sizes?: string;
  @property() radius?: ImageRadius;
  @property({ type: Boolean }) showPlaceholder?: boolean;
  @property() fallbackSrc?: string;
  @property() size?: string;

  private computeClasses(): string {
    return [
      "image",
      this.radius ? `image--${this.radius}` : null,
      this.size ? `image--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<img class="${this.computeClasses()}" role="img" .src=${this.src} .alt=${this.alt} .width=${this.width} .height=${this.height} .loading=${this.loading} .sizes=${this.sizes} />`;
  }
}

customElements.define('fsds-image', ImageElement);
// @generated:end

// @custom:start trailing

// @custom:end