// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AspectRatioPreset = "square" | "video" | "photo" | "wide" | "portrait";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AspectRatioElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: Number }) ratio?: number;
  @property() preset?: AspectRatioPreset;

  private computeClasses(): string {
    return [
      "aspect-ratio",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <slot></slot>
</div>`;
  }
}

customElements.define('fsds-aspect-ratio', AspectRatioElement);
// @generated:end

// @custom:start trailing

// @custom:end