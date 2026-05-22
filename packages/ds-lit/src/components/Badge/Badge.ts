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
  static override styles = css`
    :host { display: contents; }
    .badge {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-badge-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-badge-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-badge-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-badge-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-badge-spacing-gap: var(--fsds-core-spacing-size-02, 2px);
    }
    
    .badge {
      background-color: var(--fsds-badge-color-background-default);
      color: var(--fsds-badge-color-foreground-primary);
      border-color: var(--fsds-badge-color-border-default);
      gap: var(--fsds-badge-spacing-gap);
    }
    
    .badge__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
      margin-inline-end: 2px;
    }
    
    .badge__content {
      display: inline-block;
      white-space: nowrap;
    }
  `;

  @property({ type: String }) variant?: BadgeVariant;
  @property({ type: String }) intent?: BadgeIntent;
  @property({ type: String }) size?: BadgeSize;
  @property({ attribute: false }) icon?: unknown;
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
  static override styles = css`
    :host { display: contents; }
    .badge {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-badge-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-badge-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-badge-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-badge-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-badge-spacing-gap: var(--fsds-core-spacing-size-02, 2px);
    }
    
    .badge {
      background-color: var(--fsds-badge-color-background-default);
      color: var(--fsds-badge-color-foreground-primary);
      border-color: var(--fsds-badge-color-border-default);
      gap: var(--fsds-badge-spacing-gap);
    }
    
    .badge__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
      margin-inline-end: 2px;
    }
    
    .badge__content {
      display: inline-block;
      white-space: nowrap;
    }
  `;

  override render() {
    return html`<fsds-stack class="badge__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-badge-content', BadgeContentElement);
// @generated:end

// @custom:start trailing

// @custom:end