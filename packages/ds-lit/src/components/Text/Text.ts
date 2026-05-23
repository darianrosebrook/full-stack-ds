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
    }
    
    .text--body {
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #555555);
    }
    
    .text__error {
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-danger, #d9292b);
    }
    
    .text__success {
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-success, #487e1e);
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
      line-height: var(--fsds-text-typography-lineHeight-body);
      margin: 0;
    }
    
    .text--title {
      font-weight: var(--fsds-text-typography-fontWeight-bold);
      line-height: var(--fsds-text-typography-lineHeight-heading);
      color: var(--fsds-text-color-foreground-primary);
    }
    
    .text--body {
      font-weight: var(--fsds-text-typography-fontWeight-regular);
      line-height: var(--fsds-text-typography-lineHeight-body);
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