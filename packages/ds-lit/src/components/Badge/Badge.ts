// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type BadgeVariant = "default" | "status" | "counter" | "tag";
export type BadgeIntent = "info" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class BadgeElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() variant?: BadgeVariant;
  @property() intent?: BadgeIntent;
  @property() size?: BadgeSize;
  @property() icon?: unknown;
  @property({ type: Boolean }) showStatusIcon?: boolean;

  private computeClasses(): string {
    return [
      "badge",
      this.variant ? `badge--${this.variant}` : null,
      this.intent ? `badge--${this.intent}` : null,
      this.size ? `badge--${this.size}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<span class="${this.computeClasses()}">
  ${this.icon ? html`
  <span class=${'badge__icon'} aria-hidden="true"></span>
  ` : nothing}
  <span class=${'badge__content'}>
    <slot></slot>
  </span>
</span>`;
  }
}

customElements.define('fsds-badge', BadgeElement);

export class BadgeContentElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="badge__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-badge-content', BadgeContentElement);
// @generated:end

// @custom:start trailing

// @custom:end