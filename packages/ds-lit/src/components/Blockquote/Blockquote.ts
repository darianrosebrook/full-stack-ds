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
  static override styles = css`
    :host { display: contents; }
    .blockquote {
      --fsds-blockquote-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-blockquote-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-blockquote-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-blockquote-size-padding-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-blockquote-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    }
    
    .blockquote {
      color: var(--fsds-blockquote-color-foreground-primary);
      background-color: var(--fsds-blockquote-color-background-default);
      border-color: var(--fsds-blockquote-color-border-default);
      padding: var(--fsds-blockquote-size-padding-default);
      border-radius: var(--fsds-blockquote-size-radius-default);
      /* --fsds-semantic-typography-font-style-italic: italic; */
      /* --fsds-semantic-typography-font-weight-medium: 500; */
      /* --fsds-core-shape-border-width-thick: 2px; */
    }
  `;

  @property({ type: String }) cite?: string;
  @property({ attribute: false }) variant?: BlockquoteVariant;
  @property({ attribute: false }) size?: BlockquoteSize;

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