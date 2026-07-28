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
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-badge-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
      --fsds-badge-size-radius: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-badge-size-border: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
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
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .badge--success {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .badge--warning {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .badge--danger {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .badge--counter {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-strong, #b31b1b);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-background-danger-strong, #b31b1b);
    }

    .badge--tag {
      --fsds-badge-size-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-badge-spacing-gap, 4px);
      width: fit-content;
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-badge-size-minHeight, 24px);
      max-height: var(--fsds-box-model-max-height);
      justify-content: center;
      white-space: nowrap;
      border-style: solid;
      background-color: var(--fsds-badge-color-background-default, #d0d0d0);
      color: var(--fsds-badge-color-foreground-primary, #141414);
      border-color: var(--fsds-badge-color-border-default, #d0d0d0);
      border-width: var(--fsds-badge-size-border, 1px);
      border-radius: var(--fsds-badge-size-radius, 9999px);
      padding-block: var(--fsds-badge-size-paddingY, 2px);
      padding-inline: var(--fsds-badge-size-paddingX, 8px);
      font-size: var(--fsds-badge-size-fontSize, 12px);
      font-weight: var(--fsds-badge-text-weight, 500);
      line-height: 1;

      &:hover {
        background-color: var(--fsds-badge-color-background-hover, #d0d0d0);
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "badge");
  }

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
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-badge-color-background-hover: var(--fsds-semantic-interaction-background-hover, #d0d0d0);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-badge-spacing-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
      --fsds-badge-size-radius: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-badge-size-border: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
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
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .badge--success {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .badge--warning {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .badge--danger {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-badge-color-background-hover: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .badge--counter {
      --fsds-badge-color-background-default: var(--fsds-semantic-color-background-danger-strong, #b31b1b);
      --fsds-badge-color-foreground-primary: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-badge-color-border-default: var(--fsds-semantic-color-background-danger-strong, #b31b1b);
    }

    .badge--tag {
      --fsds-badge-size-radius: var(--fsds-semantic-shape-control-radius-default, 6px);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-badge-spacing-gap, 4px);
      width: fit-content;
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-badge-size-minHeight, 24px);
      max-height: var(--fsds-box-model-max-height);
      justify-content: center;
      white-space: nowrap;
      border-style: solid;
      background-color: var(--fsds-badge-color-background-default, #d0d0d0);
      color: var(--fsds-badge-color-foreground-primary, #141414);
      border-color: var(--fsds-badge-color-border-default, #d0d0d0);
      border-width: var(--fsds-badge-size-border, 1px);
      border-radius: var(--fsds-badge-size-radius, 9999px);
      padding-block: var(--fsds-badge-size-paddingY, 2px);
      padding-inline: var(--fsds-badge-size-paddingX, 8px);
      font-size: var(--fsds-badge-size-fontSize, 12px);
      font-weight: var(--fsds-badge-text-weight, 500);
      line-height: 1;

      &:hover {
        background-color: var(--fsds-badge-color-background-hover, #d0d0d0);
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