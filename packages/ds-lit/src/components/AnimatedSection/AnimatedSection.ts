// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedSectionAs = "section" | "div" | "article" | "main" | "aside" | "header" | "footer";
export type AnimatedSectionVariant = "fade-up" | "fade-in" | "slide-in" | "stagger-children";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AnimatedSectionElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false }) as?: AnimatedSectionAs;
  @property({ attribute: false }) variant?: AnimatedSectionVariant;
  @property({ type: Number }) duration?: number;
  @property({ type: Number }) stagger?: number;
  @property({ type: Number }) delay?: number;
  @property({ type: Boolean }) triggerOnScroll?: boolean;
  @property({ type: String }) scrollStart?: string;

  private computeClasses(): string {
    return [
      "animated-section",
      this.as ? `animated-section--${this.as}` : null,
      this.variant ? `animated-section--${this.variant}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<section class="${this.computeClasses()}">
  <slot></slot>
</section>`;
  }
}

customElements.define('fsds-animated-section', AnimatedSectionElement);
// @generated:end

// @custom:start trailing

// @custom:end