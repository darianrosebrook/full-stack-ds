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
  static override styles = css`
    :host { display: contents; }
    .list {
      --fsds-list-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-list-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-list-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-list-spacing-sm: var(--fsds-core-spacing-size-03, 4px);
      --fsds-list-spacing-md: var(--fsds-core-spacing-size-05, 12px);
      --fsds-list-spacing-lg: var(--fsds-core-spacing-size-06, 16px);
    }
    
    .list {
      color: var(--fsds-list-color-foreground-primary);
      border-color: var(--fsds-list-color-border-default);
      padding: var(--fsds-list-size-padding-default);
    }
  `;

  @property({ type: String }) as?: ListAs;
  @property({ type: String }) variant?: ListVariant;
  @property({ type: String }) marker?: ListMarker;
  @property({ type: String }) spacing?: ListSpacing;
  @property({ type: String }) size?: ListSize;

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