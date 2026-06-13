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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-surface-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: var(--fsds-semantic-surface-size-min-width, 64px);
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-blockquote-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-blockquote-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-blockquote-color-border-default: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-blockquote-typography-fontStyle: var(--fsds-semantic-typography-font-style-italic, italic);
      --fsds-blockquote-typography-fontWeight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-blockquote-size-padding-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-blockquote-size-padding-sm: var(--fsds-core-spacing-size-04, 8px);
      --fsds-blockquote-size-padding-lg: var(--fsds-core-spacing-size-07, 24px);
      --fsds-blockquote-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-blockquote-size-border-thick: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-blockquote-size-fontSize-sm: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-blockquote-size-fontSize-md: var(--fsds-core-typography-ramp-4, 1rem);
      --fsds-blockquote-size-fontSize-lg: var(--fsds-core-typography-ramp-5, 1.125rem);
    }

    .blockquote--default {
      --fsds-blockquote-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
    }

    .blockquote--bordered {
      --fsds-blockquote-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-blockquote-size-padding-default: var(--fsds-core-spacing-size-05, 12px);
    }

    .blockquote--highlighted {
      --fsds-blockquote-color-background-default: var(--fsds-semantic-color-background-accentSubtle, #fceaea);
      --fsds-blockquote-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
    }

    .blockquote--sm {
      --fsds-blockquote-size-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-blockquote-size-fontSize-md: var(--fsds-core-typography-ramp-3, 0.875rem);
    }

    .blockquote--md {
      --fsds-blockquote-size-padding-default: var(--fsds-core-spacing-size-05, 12px);
      --fsds-blockquote-size-fontSize-md: var(--fsds-core-typography-ramp-4, 1rem);
    }

    .blockquote--lg {
      --fsds-blockquote-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-blockquote-size-fontSize-md: var(--fsds-core-typography-ramp-5, 1.125rem);
    }

    .blockquote {
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
      color: var(--fsds-blockquote-color-foreground-primary);
      background-color: var(--fsds-blockquote-color-background-default);
      border-color: var(--fsds-blockquote-color-border-default);
      border-style: solid;
      border-width: 0;
      border-radius: var(--fsds-blockquote-size-radius-default);
      padding: var(--fsds-blockquote-size-padding-default);
      font-size: var(--fsds-blockquote-size-fontSize-md);
      font-style: var(--fsds-blockquote-typography-fontStyle);
      font-weight: var(--fsds-blockquote-typography-fontWeight);
      margin: 0;
    }

    .blockquote--default {
      border-width: 0;
    }

    .blockquote--bordered {
      border-inline-start-width: var(--fsds-blockquote-size-border-thick);
      border-inline-start-style: solid;
      border-inline-start-color: var(--fsds-blockquote-color-border-default);
      padding-inline-start: var(--fsds-blockquote-size-padding-default);
    }

    .blockquote--sm {
      font-size: var(--fsds-blockquote-size-fontSize-md);
      padding: var(--fsds-blockquote-size-padding-default);
    }

    .blockquote--md {
      font-size: var(--fsds-blockquote-size-fontSize-md);
      padding: var(--fsds-blockquote-size-padding-default);
    }

    .blockquote--lg {
      font-size: var(--fsds-blockquote-size-fontSize-md);
      padding: var(--fsds-blockquote-size-padding-default);
    }
  `;

  @property({ type: String }) cite?: string;
  @property({ type: String }) variant?: BlockquoteVariant;
  @property({ type: String }) size?: BlockquoteSize;

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