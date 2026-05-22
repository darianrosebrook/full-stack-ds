// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { StackElement as _Stack } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertIntent = "info" | "success" | "warning" | "danger";
export type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class AlertElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-alert-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alert-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alert-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alert-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alert-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alert-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
    }
    
    .alert__title {
      --fsds-alert-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert {
      background-color: var(--fsds-alert-color-background-danger);
      color: var(--fsds-alert-color-foreground-danger);
      border-color: var(--fsds-alert-color-border-danger);
      padding: var(--fsds-alert-size-padding);
      border-radius: var(--fsds-alert-size-radius);
      gap: var(--fsds-alert-spacing-gap);
      font-size: var(--fsds-alert-text-size);
      font-weight: var(--fsds-alert-text-weight);
      /* --fsds-core-spacing-size-06: 16px; */
    }
    
    .alert__title {
      font-weight: var(--fsds-alert-typography-title-fontWeight);
      font-size: var(--fsds-alert-typography-title-fontSize);
    }
  `;

  @property({ attribute: false })
  intent?: AlertIntent;
  @property({ attribute: false })
  level?: AlertLevel;
  @property({ type: Boolean })
  dismissible?: boolean;
  @property({ attribute: false })
  icon?: unknown;

  override render() {
    const classes = {
      'alert': true,
      [`alert--${this.intent}`]: !!this.intent,
      [`alert--${this.level}`]: !!this.level,
    };
    return html`<fsds-stack role="alert" class=${classMap(classes)}><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert', AlertElement);

export class AlertBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-alert-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alert-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alert-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alert-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alert-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alert-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
    }
    
    .alert__title {
      --fsds-alert-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert {
      background-color: var(--fsds-alert-color-background-danger);
      color: var(--fsds-alert-color-foreground-danger);
      border-color: var(--fsds-alert-color-border-danger);
      padding: var(--fsds-alert-size-padding);
      border-radius: var(--fsds-alert-size-radius);
      gap: var(--fsds-alert-spacing-gap);
      font-size: var(--fsds-alert-text-size);
      font-weight: var(--fsds-alert-text-weight);
      /* --fsds-core-spacing-size-06: 16px; */
    }
    
    .alert__title {
      font-weight: var(--fsds-alert-typography-title-fontWeight);
      font-size: var(--fsds-alert-typography-title-fontSize);
    }
  `;

  override render() {
    return html`<fsds-stack class="alert__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-body', AlertBodyElement);

export class AlertTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-alert-color-background-info: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-color-background-success: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-color-background-warning: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-color-background-danger: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-color-foreground-info: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-color-foreground-success: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-color-foreground-warning: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-color-foreground-danger: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-color-border-info: var(--fsds-semantic-color-border-info, #0042dc);
      --fsds-alert-color-border-success: var(--fsds-semantic-color-border-success, #336006);
      --fsds-alert-color-border-warning: var(--fsds-semantic-color-border-warning, #824500);
      --fsds-alert-color-border-danger: var(--fsds-semantic-color-border-danger, #ae0001);
      --fsds-alert-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-spacing-gap: var(--fsds-semantic-spacing-gap-grid-small, 8px);
      --fsds-alert-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
    }
    
    .alert__title {
      --fsds-alert-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert {
      background-color: var(--fsds-alert-color-background-danger);
      color: var(--fsds-alert-color-foreground-danger);
      border-color: var(--fsds-alert-color-border-danger);
      padding: var(--fsds-alert-size-padding);
      border-radius: var(--fsds-alert-size-radius);
      gap: var(--fsds-alert-spacing-gap);
      font-size: var(--fsds-alert-text-size);
      font-weight: var(--fsds-alert-text-weight);
      /* --fsds-core-spacing-size-06: 16px; */
    }
    
    .alert__title {
      font-weight: var(--fsds-alert-typography-title-fontWeight);
      font-size: var(--fsds-alert-typography-title-fontSize);
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="alert__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-alert-title', AlertTitleElement);
// @generated:end

// @custom:start trailing

// @custom:end