// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
      --fsds-alert-notice-spacing-gap: var(--fsds-semantic-spacing-gap-gridSmall, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-notice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-size-padding-page: var(--fsds-core-spacing-size-07, 24px);
      --fsds-alert-notice-typography-page-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-typography-page-title-fontSize: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-alert-notice-typography-inline-fontSize: var(--fsds-semantic-typography-body-04, 12px);
    }

    .alert-notice--inline {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-03, 14px);
    }

    .alert-notice--section {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }

    .alert-notice--page {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-07, 24px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-color-background-info: var(--fsds-semantic-color-background-info-softer, #eef7ff);
      --fsds-alert-notice-color-background-success: var(--fsds-semantic-color-background-success-softer, #eef7ea);
      --fsds-alert-notice-color-background-warning: var(--fsds-semantic-color-background-warning-softer, #fff4e0);
      --fsds-alert-notice-color-background-danger: var(--fsds-semantic-color-background-danger-softer, #fdf0f0);
    }

    .alert-notice {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-alert-notice-spacing-gap);
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
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
      padding: var(--fsds-alert-notice-size-padding);
      border-radius: var(--fsds-alert-notice-size-radius);
      font-size: var(--fsds-alert-notice-text-size);
      font-weight: var(--fsds-alert-notice-text-weight);
    }

    .alert-notice__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .alert-notice__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-notice-spacing-gap);
    }

    .alert-notice__dismiss {
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

    .alert-notice__dismiss:hover {
      opacity: 0.7;
    }

    .alert-notice__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
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

  @property({ type: String }) status?: AlertNoticeStatus;
  @property({ type: String }) level?: AlertNoticeLevel;
  @property({ type: Boolean }) dismissible?: boolean;
  @property({ attribute: false }) onDismiss?: () => void;
  @property({ type: String }) dismissLabel?: string = "Dismiss";
  @property({ attribute: false }) icon?: unknown;

  private computeClasses(): string {
    return [
      "alert-notice",
      this.status ? `alert-notice--${this.status}` : null,
      this.level ? `alert-notice--${this.level}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="alert">
  ${this.icon ? html`
  <span class=${'alert-notice__icon'} aria-hidden="true">${this.icon}</span>
  ` : nothing}
  <slot></slot>
  ${this.dismissible ? html`
  <button class=${'alert-notice__dismiss'} type="button" @click=${this.onDismiss} aria-label=${ifDefined((this.dismissLabel ?? "Dismiss"))}></button>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-alert-notice', AlertNoticeElement);

export class AlertNoticeBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .alert-notice {
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
      --fsds-alert-notice-spacing-gap: var(--fsds-semantic-spacing-gap-gridSmall, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-notice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-size-padding-page: var(--fsds-core-spacing-size-07, 24px);
      --fsds-alert-notice-typography-page-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-typography-page-title-fontSize: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-alert-notice-typography-inline-fontSize: var(--fsds-semantic-typography-body-04, 12px);
    }

    .alert-notice--inline {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-03, 14px);
    }

    .alert-notice--section {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }

    .alert-notice--page {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-07, 24px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-color-background-info: var(--fsds-semantic-color-background-info-softer, #eef7ff);
      --fsds-alert-notice-color-background-success: var(--fsds-semantic-color-background-success-softer, #eef7ea);
      --fsds-alert-notice-color-background-warning: var(--fsds-semantic-color-background-warning-softer, #fff4e0);
      --fsds-alert-notice-color-background-danger: var(--fsds-semantic-color-background-danger-softer, #fdf0f0);
    }

    .alert-notice {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-alert-notice-spacing-gap);
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
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
      padding: var(--fsds-alert-notice-size-padding);
      border-radius: var(--fsds-alert-notice-size-radius);
      font-size: var(--fsds-alert-notice-text-size);
      font-weight: var(--fsds-alert-notice-text-weight);
    }

    .alert-notice__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .alert-notice__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-notice-spacing-gap);
    }

    .alert-notice__dismiss {
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

    .alert-notice__dismiss:hover {
      opacity: 0.7;
    }

    .alert-notice__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
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
      --fsds-alert-notice-spacing-gap: var(--fsds-semantic-spacing-gap-gridSmall, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-text-weight: var(--fsds-semantic-typography-font-weight-regular, 400);
      --fsds-alert-notice-icon-size: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-size-padding-inline: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-size-padding-page: var(--fsds-core-spacing-size-07, 24px);
      --fsds-alert-notice-typography-page-fontSize: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-typography-page-title-fontSize: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-alert-notice-typography-inline-fontSize: var(--fsds-semantic-typography-body-04, 12px);
    }

    .alert-notice--inline {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-03, 4px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-04, 12px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-03, 14px);
    }

    .alert-notice--section {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-02, 16px);
    }

    .alert-notice--page {
      --fsds-alert-notice-size-padding: var(--fsds-core-spacing-size-07, 24px);
      --fsds-alert-notice-spacing-gap: var(--fsds-core-spacing-size-05, 12px);
      --fsds-alert-notice-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-alert-notice-typography-title-fontSize: var(--fsds-semantic-typography-body-01, 18px);
      --fsds-alert-notice-typography-title-fontWeight: var(--fsds-semantic-typography-font-weight-bold, 700);
      --fsds-alert-notice-color-background-info: var(--fsds-semantic-color-background-info-softer, #eef7ff);
      --fsds-alert-notice-color-background-success: var(--fsds-semantic-color-background-success-softer, #eef7ea);
      --fsds-alert-notice-color-background-warning: var(--fsds-semantic-color-background-warning-softer, #fff4e0);
      --fsds-alert-notice-color-background-danger: var(--fsds-semantic-color-background-danger-softer, #fdf0f0);
    }

    .alert-notice {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-alert-notice-spacing-gap);
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
      background-color: var(--fsds-alert-notice-color-background-danger);
      color: var(--fsds-alert-notice-color-foreground-danger);
      border-color: var(--fsds-alert-notice-color-border-danger);
      padding: var(--fsds-alert-notice-size-padding);
      border-radius: var(--fsds-alert-notice-size-radius);
      font-size: var(--fsds-alert-notice-text-size);
      font-weight: var(--fsds-alert-notice-text-weight);
    }

    .alert-notice__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .alert-notice__body {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: var(--fsds-alert-notice-spacing-gap);
    }

    .alert-notice__dismiss {
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

    .alert-notice__dismiss:hover {
      opacity: 0.7;
    }

    .alert-notice__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
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