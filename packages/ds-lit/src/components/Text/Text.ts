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
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-text-typography-fontWeight-light: var(--fsds-semantic-typography-font-weight-light, 300);
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-text-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-text-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-text-color-foreground-danger: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-text-color-foreground-success: var(--fsds-semantic-color-foreground-success, #487e1e);
    }
    
    .text {
      color: var(--fsds-text-color-foreground-secondary);
      line-height: var(--fsds-text-typography-lineHeight-body);
    }
    
    .text__error {
      color: var(--fsds-text-color-foreground-danger);
    }
    
    .text__success {
      color: var(--fsds-text-color-foreground-success);
    }
  `;

  @property({ attribute: false }) as?: TextAs;
  @property({ attribute: false }) variant?: TextVariant;
  @property({ attribute: false }) size?: TextSize;
  @property({ attribute: false }) weight?: TextWeight;
  @property({ attribute: false }) align?: TextAlign;
  @property({ attribute: false }) transform?: TextTransform;
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

export class TextTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .text {
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-text-typography-fontWeight-light: var(--fsds-semantic-typography-font-weight-light, 300);
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-text-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-text-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-text-color-foreground-danger: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-text-color-foreground-success: var(--fsds-semantic-color-foreground-success, #487e1e);
    }
    
    .text {
      color: var(--fsds-text-color-foreground-secondary);
      line-height: var(--fsds-text-typography-lineHeight-body);
    }
    
    .text__error {
      color: var(--fsds-text-color-foreground-danger);
    }
    
    .text__success {
      color: var(--fsds-text-color-foreground-success);
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="text__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-text-title', TextTitleElement);

export class TextBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .text {
      --fsds-text-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-text-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-text-typography-fontWeight-light: var(--fsds-semantic-typography-font-weight-light, 300);
      --fsds-text-typography-fontWeight-regular: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-text-typography-fontWeight-medium: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-text-typography-fontWeight-bold: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-text-typography-lineHeight-heading: var(--fsds-semantic-typography-line-height-heading, 1);
      --fsds-text-typography-lineHeight-body: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-text-color-foreground-danger: var(--fsds-semantic-color-foreground-danger, #d9292b);
      --fsds-text-color-foreground-success: var(--fsds-semantic-color-foreground-success, #487e1e);
    }
    
    .text {
      color: var(--fsds-text-color-foreground-secondary);
      line-height: var(--fsds-text-typography-lineHeight-body);
    }
    
    .text__error {
      color: var(--fsds-text-color-foreground-danger);
    }
    
    .text__success {
      color: var(--fsds-text-color-foreground-success);
    }
  `;

  override render() {
    return html`<fsds-stack class="text__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-text-body', TextBodyElement);
// @generated:end

// @custom:start trailing

// @custom:end