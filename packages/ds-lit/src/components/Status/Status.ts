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
      --fsds-box-model-padding-block-start: var(--fsds-semantic-glyph-badge-size-md-paddingY, 2px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-glyph-badge-size-md-paddingY, 2px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-glyph-badge-size-md-paddingX, 8px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-glyph-badge-size-md-paddingX, 8px);
      --fsds-box-model-gap: var(--fsds-semantic-glyph-badge-size-md-gap, 4px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-secondary, #5c5b5c);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-status-size-radius-default: var(--fsds-semantic-shape-control-radius-pill, 9999px);
      --fsds-status-size-minHeight: var(--fsds-semantic-glyph-badge-size-md-minHeight, 24px);
      --fsds-status-size-fontSize: var(--fsds-semantic-glyph-badge-size-md-fontSize, 12px);
      --fsds-status-size-border-default: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-status-text-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-status-typography-lineHeight: var(--fsds-semantic-typography-line-height-collapse, 1);
    }

    .status--info {
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-info-subtle, #95dafb);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-on-info-subtle, #013ab0);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-info, #034fd6);
    }

    .status--success {
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-success-subtle, #b3dba7);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-on-success-subtle, #2c4f09);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-success, #3a6614);
    }

    .status--warning {
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-warning-subtle, #fdc67f);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-on-warning-subtle, #6c3a00);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-warning, #8b4b00);
    }

    .status--danger {
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .status--error {
      --fsds-status-color-background-default: var(--fsds-semantic-color-background-danger-subtle, #fac2c2);
      --fsds-status-color-foreground-primary: var(--fsds-semantic-color-foreground-on-danger-subtle, #900909);
      --fsds-status-color-border-default: var(--fsds-semantic-color-border-danger, #b31b1b);
    }

    .status {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: fit-content;
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-status-size-minHeight, 24px);
      max-height: var(--fsds-box-model-max-height);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      white-space: nowrap;
      border-style: solid;
      background-color: var(--fsds-status-color-background-default, #d0d0d0);
      color: var(--fsds-status-color-foreground-primary, #5c5b5c);
      border-color: var(--fsds-status-color-border-default, #d0d0d0);
      border-width: var(--fsds-status-size-border-default, 1px);
      border-radius: var(--fsds-status-size-radius-default, 9999px);
      font-size: var(--fsds-status-size-fontSize, 12px);
      font-weight: var(--fsds-status-text-weight, 500);
      line-height: var(--fsds-status-typography-lineHeight, 1);
    }

    .status__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 1em;
      height: 1em;
    }

    .status__label {
      display: inline-block;
      color: var(--fsds-status-color-foreground-primary, #5c5b5c);
    }
  `;

  @property({ type: String }) status!: StatusIntent;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "status");
  }

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