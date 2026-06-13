// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TextAs = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TextVariant = "display" | "headline" | "title" | "body" | "caption" | "overline" | "code";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type TextWeight = "light" | "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TextElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .text {
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
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-typography-fontWeight-light: var(--fsds-semantic-typography-font-weight-light, 300);
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-text-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-text-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-text-typography-lineHeight-tight: var(--fsds-semantic-typography-line-height-tight, 1.2);
      --fsds-text-typography-letterSpacing-wide: var(--fsds-semantic-typography-letter-spacing-wide, 0.018rem);
      --fsds-text-typography-letterSpacing-tight: var(--fsds-semantic-typography-letter-spacing-tight, -0.018rem);
      --fsds-text-size-xs: var(--fsds-core-typography-ramp-2, 0.75rem);
      --fsds-text-size-sm: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-text-size-md: var(--fsds-core-typography-ramp-4, 1rem);
      --fsds-text-size-lg: var(--fsds-core-typography-ramp-5, 1.125rem);
      --fsds-text-size-xl: var(--fsds-core-typography-ramp-6, 1.25rem);
      --fsds-text-size-2xl: var(--fsds-core-typography-ramp-7, 1.5rem);
      --fsds-text-size-3xl: var(--fsds-core-typography-ramp-8, 2rem);
    }

    .text--display {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-11, 3.75rem);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
    }

    .text--headline {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-8, 2rem);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
    }

    .text--title {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-6, 1.25rem);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
    }

    .text--body {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-4, 1rem);
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
    }

    .text--caption {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-2, 0.75rem);
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
    }

    .text--overline {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-2, 0.75rem);
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
    }

    .text--code {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-3, 0.875rem);
    }

    .text--xs {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-2, 0.75rem);
    }

    .text--sm {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-3, 0.875rem);
    }

    .text--md {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-4, 1rem);
    }

    .text--lg {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-5, 1.125rem);
    }

    .text--xl {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-6, 1.25rem);
    }

    .text--2xl {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-7, 1.5rem);
    }

    .text--3xl {
      --fsds-text-size-md: var(--fsds-core-typography-ramp-8, 2rem);
    }

    .text--light {
      --fsds-text-typography-fontWeight-light: var(--fsds-semantic-typography-font-weight-light, 300);
    }

    .text--normal {
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
    }

    .text--medium {
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
    }

    .text--semibold {
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-semibold, 600);
    }

    .text--bold {
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
    }

    .text {
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
      color: var(--fsds-text-color-foreground-primary);
      font-size: var(--fsds-text-size-md);
      line-height: var(--fsds-text-typography-lineHeight-body);
      margin: 0;
    }

    .text--display {
      font-size: var(--fsds-text-size-md);
      font-weight: var(--fsds-text-typography-fontWeight-bold);
      line-height: var(--fsds-text-typography-lineHeight-heading);
      letter-spacing: var(--fsds-text-typography-letterSpacing-tight);
    }

    .text--headline {
      font-size: var(--fsds-text-size-md);
      font-weight: var(--fsds-text-typography-fontWeight-bold);
      line-height: var(--fsds-text-typography-lineHeight-heading);
      letter-spacing: var(--fsds-text-typography-letterSpacing-tight);
    }

    .text--title {
      font-size: var(--fsds-text-size-md);
      font-weight: var(--fsds-text-typography-fontWeight-bold);
      line-height: var(--fsds-text-typography-lineHeight-heading);
    }

    .text--body {
      font-size: var(--fsds-text-size-md);
      font-weight: var(--fsds-text-typography-fontWeight-regular);
      line-height: var(--fsds-text-typography-lineHeight-body);
    }

    .text--caption {
      font-size: var(--fsds-text-size-md);
      font-weight: var(--fsds-text-typography-fontWeight-regular);
      line-height: var(--fsds-text-typography-lineHeight-tight);
    }

    .text--overline {
      font-size: var(--fsds-text-size-md);
      font-weight: var(--fsds-text-typography-fontWeight-medium);
      line-height: var(--fsds-text-typography-lineHeight-tight);
      text-transform: uppercase;
      letter-spacing: var(--fsds-text-typography-letterSpacing-wide);
    }

    .text--code {
      font-size: var(--fsds-text-size-md);
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
      line-height: var(--fsds-text-typography-lineHeight-body);
    }

    .text--xs {
      font-size: var(--fsds-text-size-md);
    }

    .text--sm {
      font-size: var(--fsds-text-size-md);
    }

    .text--md {
      font-size: var(--fsds-text-size-md);
    }

    .text--lg {
      font-size: var(--fsds-text-size-md);
    }

    .text--xl {
      font-size: var(--fsds-text-size-md);
    }

    .text--2xl {
      font-size: var(--fsds-text-size-md);
    }

    .text--3xl {
      font-size: var(--fsds-text-size-md);
    }

    .text--light {
      font-weight: var(--fsds-text-typography-fontWeight-light);
    }

    .text--normal {
      font-weight: var(--fsds-text-typography-fontWeight-regular);
    }

    .text--medium {
      font-weight: var(--fsds-text-typography-fontWeight-medium);
    }

    .text--semibold {
      font-weight: var(--fsds-text-typography-fontWeight-medium);
    }

    .text--bold {
      font-weight: var(--fsds-text-typography-fontWeight-bold);
    }

    .text--left {
      text-align: left;
    }

    .text--center {
      text-align: center;
    }

    .text--right {
      text-align: right;
    }

    .text--justify {
      text-align: justify;
    }

    .text--none {
      text-transform: none;
    }

    .text--uppercase {
      text-transform: uppercase;
    }

    .text--lowercase {
      text-transform: lowercase;
    }

    .text--capitalize {
      text-transform: capitalize;
    }

    .text__error {
      color: var(--fsds-semantic-color-feedback-foreground-danger-default, #d9292b);
    }

    .text__success {
      color: var(--fsds-semantic-color-feedback-foreground-success-default, #1f8a4c);
    }
  `;

  @property({ type: String }) as?: TextAs;
  @property({ type: String }) variant?: TextVariant;
  @property({ type: String }) size?: TextSize;
  @property({ type: String }) weight?: TextWeight;
  @property({ type: String }) align?: TextAlign;
  @property({ type: String }) transform?: TextTransform;
  @property({ type: Boolean }) truncate?: boolean;

  private computeClasses(): string {
    return [
      "text",
      this.variant ? `text--${this.variant}` : null,
      this.size ? `text--${this.size}` : null,
      this.weight ? `text--${this.weight}` : null,
      this.align ? `text--${this.align}` : null,
      this.transform ? `text--${this.transform}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<p class="${this.computeClasses()}"></p>`;
  }
}

customElements.define('fsds-text', TextElement);
// @generated:end

// @custom:start trailing

// @custom:end