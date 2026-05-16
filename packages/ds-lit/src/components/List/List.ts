// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ListAs = "ul" | "ol" | "dl";
export type ListVariant = "default" | "unstyled" | "inline" | "divided" | "spaced";
export type ListMarker = "default" | "none" | "disc" | "circle" | "square" | "decimal" | "alpha" | "roman";
export type ListSpacing = "none" | "sm" | "md" | "lg";
export type ListSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ListElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() as?: ListAs;
  @property() variant?: ListVariant;
  @property() marker?: ListMarker;
  @property() spacing?: ListSpacing;
  @property() size?: ListSize;

  private computeClasses(): string {
    return [
      "list",
      this.as ? `list--${this.as}` : null,
      this.variant ? `list--${this.variant}` : null,
      this.marker ? `list--${this.marker}` : null,
      this.spacing ? `list--${this.spacing}` : null,
      this.size ? `list--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<ul class="${this.computeClasses()}">
  <slot></slot>
</ul>`;
  }
}

customElements.define('fsds-list', ListElement);
// @generated:end

// @custom:start trailing

// @custom:end