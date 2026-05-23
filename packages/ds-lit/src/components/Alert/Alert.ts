// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-feedback-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-alert-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-spacing-gap: var(--fsds-semantic-spacing-gap-gridSmall, 8px);
      --fsds-alert-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert--info {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-info, #0042dc);
    }
    
    .alert--success {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-success, #336006);
    }
    
    .alert--warning {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-warning, #824500);
    }
    
    .alert--danger {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-danger, #ae0001);
    }
    
    .alert {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-alert-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      align-items: flex-start;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      padding: var(--fsds-alert-size-padding);
      border-radius: var(--fsds-alert-size-radius);
      font-size: var(--fsds-alert-text-size);
      font-weight: var(--fsds-alert-text-weight);
      background-color: var(--fsds-alert-color-background-primary);
      color: var(--fsds-alert-color-foreground-primary);
      border-color: var(--fsds-alert-color-border-primary);
    }
    
    .alert__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .alert__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-spacing-gap);
    }
    
    .alert__dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: transparent;
      border: 0;
      padding: 0;
      margin-left: auto;
      color: inherit;
      cursor: pointer;
      font: inherit;
      line-height: 1;
    }
    
    .alert__dismiss:hover {
      opacity: 0.7;
    }
    
    .alert__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    
    .alert__title {
      margin: 0;
      font-weight: var(--fsds-alert-typography-title-fontWeight);
      font-size: var(--fsds-alert-typography-title-fontSize);
    }
  `;

  @property({ type: String }) intent?: AlertIntent;
  @property({ type: String }) level?: AlertLevel;
  @property({ type: Boolean }) dismissible?: boolean;
  @property({ attribute: false }) onDismiss?: () => void;
  @property({ type: String }) dismissLabel?: string = "Dismiss";
  @property({ attribute: false }) icon?: unknown;

  private computeClasses(): string {
    return [
      "alert",
      this.intent ? `alert--${this.intent}` : null,
      this.level ? `alert--${this.level}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="alert">
  ${this.icon ? html`
  <span class=${'alert__icon'} aria-hidden="true">${this.icon}</span>
  ` : nothing}
  <slot></slot>
  ${this.dismissible ? html`
  <button class=${'alert__dismiss'} type="button" @click=${this.onDismiss} aria-label=${ifDefined(this.dismissLabel)}></button>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-alert', AlertElement);

export class AlertBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-feedback-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-alert-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-spacing-gap: var(--fsds-semantic-spacing-gap-gridSmall, 8px);
      --fsds-alert-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert--info {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-info, #0042dc);
    }
    
    .alert--success {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-success, #336006);
    }
    
    .alert--warning {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-warning, #824500);
    }
    
    .alert--danger {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-danger, #ae0001);
    }
    
    .alert {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-alert-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      align-items: flex-start;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      padding: var(--fsds-alert-size-padding);
      border-radius: var(--fsds-alert-size-radius);
      font-size: var(--fsds-alert-text-size);
      font-weight: var(--fsds-alert-text-weight);
      background-color: var(--fsds-alert-color-background-primary);
      color: var(--fsds-alert-color-foreground-primary);
      border-color: var(--fsds-alert-color-border-primary);
    }
    
    .alert__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .alert__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-spacing-gap);
    }
    
    .alert__dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: transparent;
      border: 0;
      padding: 0;
      margin-left: auto;
      color: inherit;
      cursor: pointer;
      font: inherit;
      line-height: 1;
    }
    
    .alert__dismiss:hover {
      opacity: 0.7;
    }
    
    .alert__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    
    .alert__title {
      margin: 0;
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
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-feedback-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-feedback-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-feedback-size-gap, 12px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-alert-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-size-radius: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-alert-spacing-gap: var(--fsds-semantic-spacing-gap-gridSmall, 8px);
      --fsds-alert-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }
    
    .alert--info {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-info-subtle, #d9f3fe);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #002d99);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-info, #0042dc);
    }
    
    .alert--success {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-success-subtle, #e4f2e0);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #234104);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-success, #336006);
    }
    
    .alert--warning {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-warning-subtle, #ffedcc);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #593000);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-warning, #824500);
    }
    
    .alert--danger {
      --fsds-alert-color-background-primary: var(--fsds-semantic-color-background-danger-subtle, #fceaea);
      --fsds-alert-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #7b0000);
      --fsds-alert-color-border-primary: var(--fsds-semantic-color-border-danger, #ae0001);
    }
    
    .alert {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-alert-spacing-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: flex;
      align-items: flex-start;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      padding: var(--fsds-alert-size-padding);
      border-radius: var(--fsds-alert-size-radius);
      font-size: var(--fsds-alert-text-size);
      font-weight: var(--fsds-alert-text-weight);
      background-color: var(--fsds-alert-color-background-primary);
      color: var(--fsds-alert-color-foreground-primary);
      border-color: var(--fsds-alert-color-border-primary);
    }
    
    .alert__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .alert__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-spacing-gap);
    }
    
    .alert__dismiss {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: transparent;
      border: 0;
      padding: 0;
      margin-left: auto;
      color: inherit;
      cursor: pointer;
      font: inherit;
      line-height: 1;
    }
    
    .alert__dismiss:hover {
      opacity: 0.7;
    }
    
    .alert__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    
    .alert__title {
      margin: 0;
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