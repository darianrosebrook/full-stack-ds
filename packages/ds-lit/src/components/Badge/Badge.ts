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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 2px;
      --fsds-box-model-padding-block-end: 2px;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 8px;
      --fsds-box-model-padding-inline-end: 8px;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-max-height: none;
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-badge-spacing-gap: var(--fsds-core-spacing-size-02, 2px);
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-badge-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-badge-color-background-default);
      color: var(--fsds-badge-color-foreground-primary);
      border-color: var(--fsds-badge-color-border-default);
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 2px;
      --fsds-box-model-padding-block-end: 2px;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 8px;
      --fsds-box-model-padding-inline-end: 8px;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-max-height: none;
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-badge-spacing-gap: var(--fsds-core-spacing-size-02, 2px);
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-badge-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-badge-color-background-default);
      color: var(--fsds-badge-color-foreground-primary);
      border-color: var(--fsds-badge-color-border-default);
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