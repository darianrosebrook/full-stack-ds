// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
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
  static override styles = css`:host { display: contents; }`;

  @property() as?: TextElement;
  @property() variant?: TextVariant;
  @property() size?: TextSize;
  @property() weight?: TextWeight;
  @property() align?: TextAlign;
  @property() transform?: TextTransform;
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
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="h3" class="text__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-text-title', TextTitleElement);

export class TextBodyElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="text__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-text-body', TextBodyElement);
// @generated:end

// @custom:start trailing

// @custom:end