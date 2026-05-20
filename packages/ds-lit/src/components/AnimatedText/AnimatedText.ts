// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedTextAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
export type AnimatedTextVariant = "blur-in" | "fade-up" | "slide-in";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AnimatedTextElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: String }) text!: string;
  @property({ attribute: false }) as?: AnimatedTextAs;
  @property({ attribute: false }) variant?: AnimatedTextVariant;
  @property({ type: Number }) duration?: number;
  @property({ type: Number }) stagger?: number;
  @property({ type: Number }) delay?: number;
  @property({ type: Boolean }) triggerOnScroll?: boolean;
  @property({ type: String }) scrollStart?: string;

  private computeClasses(): string {
    return [
      "animated-text",
      this.as ? `animated-text--${this.as}` : null,
      this.variant ? `animated-text--${this.variant}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" data-text=${ifDefined(this.text)}></div>`;
  }
}

customElements.define('fsds-animated-text', AnimatedTextElement);
// @generated:end

// @custom:start trailing

// @custom:end