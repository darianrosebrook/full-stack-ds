// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedCardAs = "article" | "div" | "li" | "a";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AnimatedCardElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() as?: AnimatedCardAs;
  @property({ type: Number }) duration?: number;
  @property({ type: Number }) delay?: number;
  @property({ type: Boolean }) triggerOnScroll?: boolean;
  @property() scrollStart?: string;
  @property({ type: Boolean }) enableHover?: boolean;
  @property() href?: string;

  private computeClasses(): string {
    return [
      "animated-card",
      this.as ? `animated-card--${this.as}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" data-as=${this.as}>
  <slot></slot>
</div>`;
  }
}

customElements.define('fsds-animated-card', AnimatedCardElement);

export class AnimatedCardTitleElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="h3" class="animated-card__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-animated-card-title', AnimatedCardTitleElement);
// @generated:end

// @custom:start trailing

// @custom:end