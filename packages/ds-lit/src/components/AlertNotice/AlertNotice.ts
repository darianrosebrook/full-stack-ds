// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { StackElement as _Stack } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "error";
export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AlertNoticeElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert-notice {
      --fsds-alertnotice-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alertnotice-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alertnotice-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alertnotice-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alertnotice-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alertnotice-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alertnotice-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alertnotice-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alertnotice-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alertnotice-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alertnotice-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alertnotice-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alertnotice-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alertnotice-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alertnotice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alertnotice-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alertnotice-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alertnotice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alertnotice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alertnotice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alertnotice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alertnotice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert-notice {
      background-color: var(--fsds-alertnotice-color-background-danger);
      color: var(--fsds-alertnotice-color-foreground-danger);
      border-color: var(--fsds-alertnotice-color-border-danger);
      padding: var(--fsds-alertnotice-size-padding);
      border-radius: var(--fsds-alertnotice-size-radius);
      gap: var(--fsds-alertnotice-spacing-gap);
      font-size: var(--fsds-alertnotice-text-size);
      font-weight: var(--fsds-alertnotice-text-weight);
    }
    
    .alert-notice__title {
      font-weight: var(--fsds-alertnotice-typography-title-fontWeight);
      font-size: var(--fsds-alertnotice-typography-title-fontSize);
    }
  `;

  @property({ attribute: false })
  status?: AlertNoticeStatus;
  @property({ attribute: false })
  level?: AlertNoticeLevel;
  @property({ type: Boolean })
  dismissible?: boolean;
  @property({ attribute: false })
  icon?: unknown;

  override render() {
    const classes = {
      'alert-notice': true,
      [`alert-notice--${this.status}`]: !!this.status,
      [`alert-notice--${this.level}`]: !!this.level,
    };
    return html`<fsds-stack role="alert" class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-notice', AlertNoticeElement);

export class AlertNoticeBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert-notice {
      --fsds-alertnotice-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alertnotice-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alertnotice-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alertnotice-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alertnotice-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alertnotice-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alertnotice-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alertnotice-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alertnotice-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alertnotice-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alertnotice-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alertnotice-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alertnotice-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alertnotice-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alertnotice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alertnotice-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alertnotice-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alertnotice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alertnotice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alertnotice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alertnotice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alertnotice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert-notice {
      background-color: var(--fsds-alertnotice-color-background-danger);
      color: var(--fsds-alertnotice-color-foreground-danger);
      border-color: var(--fsds-alertnotice-color-border-danger);
      padding: var(--fsds-alertnotice-size-padding);
      border-radius: var(--fsds-alertnotice-size-radius);
      gap: var(--fsds-alertnotice-spacing-gap);
      font-size: var(--fsds-alertnotice-text-size);
      font-weight: var(--fsds-alertnotice-text-weight);
    }
    
    .alert-notice__title {
      font-weight: var(--fsds-alertnotice-typography-title-fontWeight);
      font-size: var(--fsds-alertnotice-typography-title-fontSize);
    }
  `;

  override render() {
    return html`<fsds-stack class="alert-notice__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-notice-body', AlertNoticeBodyElement);

export class AlertNoticeTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert-notice {
      --fsds-alertnotice-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alertnotice-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alertnotice-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alertnotice-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alertnotice-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alertnotice-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alertnotice-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alertnotice-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alertnotice-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alertnotice-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alertnotice-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alertnotice-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alertnotice-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alertnotice-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alertnotice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alertnotice-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alertnotice-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alertnotice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alertnotice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alertnotice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alertnotice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alertnotice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert-notice {
      background-color: var(--fsds-alertnotice-color-background-danger);
      color: var(--fsds-alertnotice-color-foreground-danger);
      border-color: var(--fsds-alertnotice-color-border-danger);
      padding: var(--fsds-alertnotice-size-padding);
      border-radius: var(--fsds-alertnotice-size-radius);
      gap: var(--fsds-alertnotice-spacing-gap);
      font-size: var(--fsds-alertnotice-text-size);
      font-weight: var(--fsds-alertnotice-text-weight);
    }
    
    .alert-notice__title {
      font-weight: var(--fsds-alertnotice-typography-title-fontWeight);
      font-size: var(--fsds-alertnotice-typography-title-fontSize);
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="alert-notice__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-notice-title', AlertNoticeTitleElement);
// @generated:end

// @custom:start trailing

// @custom:end