// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class StatusElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .status {
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
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-primary, #f29495);
      --fsds-status-size-radius-default: var(--fsds-core-shape-radius-full, 9999px);
      --fsds-status-size-padding-default: var(--fsds-core-spacing-size-04, 8px);
      --fsds-status-size-border-default: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-status-typography-lineHeight: var(--fsds-semantic-typography-line-height-collapse, 1);
    }
    
    .status {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-status-color-background-default);
      color: var(--fsds-status-color-foreground-primary);
      border-color: var(--fsds-status-color-border-default);
      border-radius: var(--fsds-status-size-radius-default);
      padding: var(--fsds-status-size-padding-default);
      line-height: var(--fsds-status-typography-lineHeight);
    }
    
    .status__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
      margin-right: 4px;
    }
    
    .status__label {
      display: inline-block;
      color: var(--fsds-status-color-foreground-primary);
    }
  `;

  @property({ type: String }) status!: StatusIntent;

  private computeClasses(): string {
    return [
      "status",
      this.status ? `status--${this.status}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<span class="${this.computeClasses()}">
  <span class=${'status__icon'} aria-hidden="true"></span>
  <span class=${'status__label'}>
    <slot></slot>
  </span>
</span>`;
  }
}

customElements.define('fsds-status', StatusElement);
// @generated:end

// @custom:start trailing

// @custom:end