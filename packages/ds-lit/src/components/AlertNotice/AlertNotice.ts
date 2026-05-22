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
      --fsds-alert-notice-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-notice-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-notice-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-notice-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-notice-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-notice-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-notice-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-notice-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-notice-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-notice-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-notice-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alert-notice-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alert-notice-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alert-notice-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-notice-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-notice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert-notice {
      display: flex;
      align-items: flex-start;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
      padding: var(--fsds-alert-notice-size-padding);
      border-radius: var(--fsds-alert-notice-size-radius);
      gap: var(--fsds-alert-notice-spacing-gap);
      font-size: var(--fsds-alert-notice-text-size);
      font-weight: var(--fsds-alert-notice-text-weight);
    }
    
    .alert-notice__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-notice-spacing-gap);
    }
    
    .alert-notice__title {
      margin: 0;
      font-weight: var(--fsds-alert-notice-typography-title-fontWeight);
      font-size: var(--fsds-alert-notice-typography-title-fontSize);
    }
    
    .alert-notice--info {
      background-color: var(--fsds-alert-notice-color-background-info);
      color: var(--fsds-alert-notice-color-foreground-info);
      border-color: var(--fsds-alert-notice-color-border-info);
    }
    
    .alert-notice--success {
      background-color: var(--fsds-alert-notice-color-background-success);
      color: var(--fsds-alert-notice-color-foreground-success);
      border-color: var(--fsds-alert-notice-color-border-success);
    }
    
    .alert-notice--warning {
      background-color: var(--fsds-alert-notice-color-background-warning);
      color: var(--fsds-alert-notice-color-foreground-warning);
      border-color: var(--fsds-alert-notice-color-border-warning);
    }
    
    .alert-notice--error {
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
    }
  `;

  @property({ type: String })
  status?: AlertNoticeStatus;
  @property({ type: String })
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
      --fsds-alert-notice-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-notice-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-notice-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-notice-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-notice-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-notice-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-notice-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-notice-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-notice-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-notice-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-notice-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alert-notice-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alert-notice-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alert-notice-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-notice-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-notice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert-notice {
      display: flex;
      align-items: flex-start;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
      padding: var(--fsds-alert-notice-size-padding);
      border-radius: var(--fsds-alert-notice-size-radius);
      gap: var(--fsds-alert-notice-spacing-gap);
      font-size: var(--fsds-alert-notice-text-size);
      font-weight: var(--fsds-alert-notice-text-weight);
    }
    
    .alert-notice__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-notice-spacing-gap);
    }
    
    .alert-notice__title {
      margin: 0;
      font-weight: var(--fsds-alert-notice-typography-title-fontWeight);
      font-size: var(--fsds-alert-notice-typography-title-fontSize);
    }
    
    .alert-notice--info {
      background-color: var(--fsds-alert-notice-color-background-info);
      color: var(--fsds-alert-notice-color-foreground-info);
      border-color: var(--fsds-alert-notice-color-border-info);
    }
    
    .alert-notice--success {
      background-color: var(--fsds-alert-notice-color-background-success);
      color: var(--fsds-alert-notice-color-foreground-success);
      border-color: var(--fsds-alert-notice-color-border-success);
    }
    
    .alert-notice--warning {
      background-color: var(--fsds-alert-notice-color-background-warning);
      color: var(--fsds-alert-notice-color-foreground-warning);
      border-color: var(--fsds-alert-notice-color-border-warning);
    }
    
    .alert-notice--error {
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
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
      --fsds-alert-notice-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-notice-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-notice-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-notice-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-notice-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-notice-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-notice-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-notice-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-notice-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-notice-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-notice-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alert-notice-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alert-notice-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alert-notice-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-notice-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-notice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert-notice {
      display: flex;
      align-items: flex-start;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
      padding: var(--fsds-alert-notice-size-padding);
      border-radius: var(--fsds-alert-notice-size-radius);
      gap: var(--fsds-alert-notice-spacing-gap);
      font-size: var(--fsds-alert-notice-text-size);
      font-weight: var(--fsds-alert-notice-text-weight);
    }
    
    .alert-notice__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-notice-spacing-gap);
    }
    
    .alert-notice__title {
      margin: 0;
      font-weight: var(--fsds-alert-notice-typography-title-fontWeight);
      font-size: var(--fsds-alert-notice-typography-title-fontSize);
    }
    
    .alert-notice--info {
      background-color: var(--fsds-alert-notice-color-background-info);
      color: var(--fsds-alert-notice-color-foreground-info);
      border-color: var(--fsds-alert-notice-color-border-info);
    }
    
    .alert-notice--success {
      background-color: var(--fsds-alert-notice-color-background-success);
      color: var(--fsds-alert-notice-color-foreground-success);
      border-color: var(--fsds-alert-notice-color-border-success);
    }
    
    .alert-notice--warning {
      background-color: var(--fsds-alert-notice-color-background-warning);
      color: var(--fsds-alert-notice-color-foreground-warning);
      border-color: var(--fsds-alert-notice-color-border-warning);
    }
    
    .alert-notice--error {
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
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