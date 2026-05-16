// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type BlockquoteVariant = "default" | "bordered" | "highlighted";
export type BlockquoteSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class BlockquoteElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() cite?: string;
  @property() variant?: BlockquoteVariant;
  @property() size?: BlockquoteSize;

  private computeClasses(): string {
    return [
      "blockquote",
      this.variant ? `blockquote--${this.variant}` : null,
      this.size ? `blockquote--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<blockquote class="${this.computeClasses()}">
  <slot></slot>
</blockquote>`;
  }
}

customElements.define('fsds-blockquote', BlockquoteElement);
// @generated:end

// @custom:start trailing

// @custom:end