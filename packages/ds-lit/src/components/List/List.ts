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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-list-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-list-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-list-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-list-size-sm: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-list-size-md: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-list-size-lg: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-list-spacing-none: var(--fsds-core-spacing-size-00, 0px);
      --fsds-list-spacing-sm: var(--fsds-core-spacing-size-04, 8px);
      --fsds-list-spacing-md: var(--fsds-core-spacing-size-05, 12px);
      --fsds-list-spacing-lg: var(--fsds-core-spacing-size-07, 24px);
    }

    .list {
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
      color: var(--fsds-list-color-foreground-primary);
      border-color: var(--fsds-list-color-border-default);
      padding: var(--fsds-list-size-padding-default);
    }

    .list--size-sm {
      font-size: var(--fsds-list-size-sm);
    }

    .list--size-md {
      font-size: var(--fsds-list-size-md);
    }

    .list--size-lg {
      font-size: var(--fsds-list-size-lg);
    }

    .list--spacing-none > * + * {
      margin-block-start: var(--fsds-list-spacing-none);
    }

    .list--spacing-sm > * + * {
      margin-block-start: var(--fsds-list-spacing-sm);
    }

    .list--spacing-md > * + * {
      margin-block-start: var(--fsds-list-spacing-md);
    }

    .list--spacing-lg > * + * {
      margin-block-start: var(--fsds-list-spacing-lg);
    }

    .list--marker-none {
      list-style-type: none;
    }

    .list--marker-disc {
      list-style-type: disc;
    }

    .list--marker-circle {
      list-style-type: circle;
    }

    .list--marker-square {
      list-style-type: square;
    }

    .list--marker-decimal {
      list-style-type: decimal;
    }

    .list--marker-alpha {
      list-style-type: lower-alpha;
    }

    .list--marker-roman {
      list-style-type: lower-roman;
    }

    .list--variant-unstyled {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .list--variant-inline {
      display: flex;
      flex-direction: row;
      list-style: none;
      gap: var(--fsds-list-spacing-md);
    }

    .list--variant-divided > * + * {
      border-block-start-width: 1px;
      border-block-start-style: solid;
      border-block-start-color: var(--fsds-list-color-border-default);
    }

    .list--variant-spaced > * {
      margin-block: var(--fsds-list-spacing-lg);
    }
  `;

  @property({ type: String }) as?: ListAs;
  @property({ type: String }) variant?: ListVariant = "default";
  @property({ type: String }) marker?: ListMarker = "default";
  @property({ type: String }) spacing?: ListSpacing;
  @property({ type: String }) size?: ListSize;

  private computeClasses(): string {
    return [
      "list",
      this.as ? `list--${this.as}` : null,
      this.variant ? `list--variant-${this.variant}` : null,
      this.marker ? `list--marker-${this.marker}` : null,
      this.spacing ? `list--spacing-${this.spacing}` : null,
      this.size ? `list--size-${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`${this.as === "ol" ? html`<ol class="${this.computeClasses()}">
  <slot></slot>
</ol>` : this.as === "dl" ? html`<dl class="${this.computeClasses()}">
  <slot></slot>
</dl>` : html`<ul class="${this.computeClasses()}">
  <slot></slot>
</ul>`}`;
  }
}

customElements.define('fsds-list', ListElement);
// @generated:end

// @custom:start trailing

// @custom:end