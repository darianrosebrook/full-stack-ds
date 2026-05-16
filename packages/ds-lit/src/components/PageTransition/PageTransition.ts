// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class PageTransitionElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() transitionName?: string;
  @property({ type: Number }) duration?: number;
  @property({ type: Boolean }) enabled?: boolean = true;

  private computeClasses(): string {
    return [
      "page-transition",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">
  <slot></slot>
</div>`;
  }
}

customElements.define('fsds-page-transition', PageTransitionElement);
// @generated:end

// @custom:start trailing

// @custom:end