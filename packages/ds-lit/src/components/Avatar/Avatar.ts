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
export class AvatarElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() src?: string;
  @property() name!: string;
  @property({ type: Boolean }) priority?: boolean;
  @property() size?: string;

  private computeClasses(): string {
    return [
      "avatar",
      this.size ? `avatar--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}"></div>`;
  }
}

customElements.define('fsds-avatar', AvatarElement);
// @generated:end

// @custom:start trailing

// @custom:end