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
      --fsds-badge-color-background-hover: var(--fsds-semantic-interaction-background-hover, #e4e4e4);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
      --fsds-badge-size-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-badge-size-border: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-md-paddingX, 8px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-md-paddingY, 2px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-md-fontSize, 12px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-md-minHeight, 24px);
      --fsds-badge-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
    }
    
    .badge--sm {
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-sm-paddingX, 4px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-sm-paddingY, 2px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-sm-fontSize, 10px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-sm-minHeight, 16px);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-sm-gap, 2px);
    }
    
    .badge--md {
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-md-paddingX, 8px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-md-paddingY, 2px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-md-fontSize, 12px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-md-minHeight, 24px);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
    }
    
    .badge--lg {
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-lg-paddingX, 12px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-lg-paddingY, 4px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-lg-fontSize, 14px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-lg-minHeight, 32px);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-lg-gap, 4px);
    }
    
    .badge--info {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-info, #0042dc);
    }
    
    .badge--success {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-success, #336006);
    }
    
    .badge--warning {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-warning, #824500);
    }
    
    .badge--danger {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-danger, #ae0001);
    }
    
    .badge--counter {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-strong, #d9292b);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-background-danger-strong, #d9292b);
    }
    
    .badge--tag {
      --fsds-badge-size-radius: var(--fsds-core-shape-radius-medium, 6px);
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
      width: fit-content;
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-badge-size-minHeight);
      max-height: var(--fsds-box-model-max-height);
      justify-content: center;
      white-space: nowrap;
      border-style: solid;
      background-color: var(--fsds-badge-color-background-default);
      color: var(--fsds-badge-color-foreground-primary);
      border-color: var(--fsds-badge-color-border-default);
      border-width: var(--fsds-badge-size-border);
      border-radius: var(--fsds-badge-size-radius);
      padding-block: var(--fsds-badge-size-paddingY);
      padding-inline: var(--fsds-badge-size-paddingX);
      font-size: var(--fsds-badge-size-fontSize);
      font-weight: var(--fsds-badge-text-weight);
      line-height: 1;
    
      &:hover {
        background-color: var(--fsds-badge-color-background-hover);
      }
    }
    
    .badge__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
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
      --fsds-badge-color-background-hover: var(--fsds-semantic-interaction-background-hover, #e4e4e4);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
      --fsds-badge-size-radius: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-badge-size-border: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-md-paddingX, 8px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-md-paddingY, 2px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-md-fontSize, 12px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-md-minHeight, 24px);
      --fsds-badge-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
    }
    
    .badge--sm {
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-sm-paddingX, 4px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-sm-paddingY, 2px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-sm-fontSize, 10px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-sm-minHeight, 16px);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-sm-gap, 2px);
    }
    
    .badge--md {
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-md-paddingX, 8px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-md-paddingY, 2px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-md-fontSize, 12px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-md-minHeight, 24px);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
    }
    
    .badge--lg {
      --fsds-badge-size-paddingX: var(--fsds-semantic-glyph-badge-size-lg-paddingX, 12px);
      --fsds-badge-size-paddingY: var(--fsds-semantic-glyph-badge-size-lg-paddingY, 4px);
      --fsds-badge-size-fontSize: var(--fsds-semantic-glyph-badge-size-lg-fontSize, 14px);
      --fsds-badge-size-minHeight: var(--fsds-semantic-glyph-badge-size-lg-minHeight, 32px);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-lg-gap, 4px);
    }
    
    .badge--info {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-info, #0042dc);
    }
    
    .badge--success {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-success, #336006);
    }
    
    .badge--warning {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-warning, #824500);
    }
    
    .badge--danger {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-danger, #ae0001);
    }
    
    .badge--counter {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-strong, #d9292b);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-background-danger-strong, #d9292b);
    }
    
    .badge--tag {
      --fsds-badge-size-radius: var(--fsds-core-shape-radius-medium, 6px);
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
      width: fit-content;
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-badge-size-minHeight);
      max-height: var(--fsds-box-model-max-height);
      justify-content: center;
      white-space: nowrap;
      border-style: solid;
      background-color: var(--fsds-badge-color-background-default);
      color: var(--fsds-badge-color-foreground-primary);
      border-color: var(--fsds-badge-color-border-default);
      border-width: var(--fsds-badge-size-border);
      border-radius: var(--fsds-badge-size-radius);
      padding-block: var(--fsds-badge-size-paddingY);
      padding-inline: var(--fsds-badge-size-paddingX);
      font-size: var(--fsds-badge-size-fontSize);
      font-weight: var(--fsds-badge-text-weight);
      line-height: 1;
    
      &:hover {
        background-color: var(--fsds-badge-color-background-hover);
      }
    }
    
    .badge__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
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