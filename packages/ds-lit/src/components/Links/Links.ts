// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";
export type LinkSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class LinksElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ type: String }) href?: string;
  @property({ attribute: false }) target?: LinkTarget;
  @property({ type: String }) rel?: string;
  @property({ attribute: false }) size?: LinkSize;
  @property({ type: Boolean }) disabled?: boolean;

  private computeClasses(): string {
    return [
      "links",
      this.size ? `links--${this.size}` : null,
      this.disabled ? "links--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<a class="${this.computeClasses()}" href=${ifDefined(this.href)} target=${ifDefined(this.target)} rel=${ifDefined(this.rel)}>
  <slot></slot>
</a>`;
  }
}

customElements.define('fsds-links', LinksElement);
// @generated:end

// @custom:start trailing

// @custom:end